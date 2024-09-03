<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Manifest;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ManifestController extends Controller
{
    public function get_items(Request $request)
    {
        $active_session = optional($this->fin_session);

        $branchId = optional($this->branch)->id;
        $privilege = optional($this->role)->privilege_index;

        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'asc');
        $query = Manifest::query();

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($active_session->active == 1) {
            $query->where('trip_date', '>=', $active_session->start_date)
                ->where('trip_date', '<=', $active_session->end_date);
        } else {
            return response()->json(['message' => 'No item found in this session !'], 404);
        }

        $manifests = $query->with(['from_location', 'to_location', 'lorry'])->orderBy($orderBy, $order)->paginate($perPage);
        return response()->json($manifests);
    }

    public function get_item(Manifest $manifest)
    {
        $branchId = optional($this->branch)->id;

        if ($branchId && $manifest->branch_id == $branchId) {
            $manifest->load([
                'bookings.statuses',
                'bookings.items.item_quantities',
                'bookings.consignor.location', 
                'bookings.consignee.location', 
                'branch',
                'lorry'
            ]);
            return response()->json($manifest);
        } else {
            return response()->json(['message' => 'This item does not belong to you.'], 404);
        }
    }


    public function store(Request $request)
    {
        $request->validate([
            'trip_date' => 'required|date',
            'to_location' => 'required|integer',
            'from_location' => 'required|integer',
            'lorry_id' => 'nullable|integer',
        ]);


        $new_no = $this->generateManifestNumber();
        $data = $request->all();
        $data['manifest_no'] = $new_no;
        $data['trip_date'] = Carbon::parse($request->trip_date)->format('Y-m-d');

        $user = Auth::user();

        if ($user->branch) {
            $data['branch_id'] = $user->branch->id;
        } else {
            return response()->json(['message' => 'Unauthorized access'], 400);
        }


        try {
            $m = Manifest::create($data);

            if ($m) {
                $user = Auth::user();
                ActivityLog::create([
                    'title' => 'Manifest added',
                    'activity' => 'Manifest (' . $m->manifest_no . ') for Trip date ' . $m->trip_date . ' has been created.',
                    'user_id' => $user->id,
                    'branch_id' => $user->branch->id,
                    'created_at' => now()
                ]);
            }

            return response()->json(['message' => 'Created successfully!', 'manifest_no' => $new_no], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Could not be stored', 'error' => $e->getMessage()], 400);
        }
    }


    private function generateManifestNumber()
    {
        $prefix = 'M';
        $latestManifest = Manifest::whereDate('created_at', now()->toDateString())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($latestManifest) {
            $lastIndex = (int)substr($latestManifest->manifest_no, -3);
            $newIndex = $lastIndex + 1;
        } else {
            $newIndex = 1;
        }

        $index = str_pad($newIndex, 3, '0', STR_PAD_LEFT);

        return $prefix . $index;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Manifest $manifest)
    {
        DB::beginTransaction();
        $branchId = optional($this->branch)->id;
        
        if ($manifest->branch_id !== $branchId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $manifest->delete();
            return response()->json(['message' => 'Manifest and its bookings deleted successfully.']);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete manifest and its bookings.'], 500);
        }
    }
}
