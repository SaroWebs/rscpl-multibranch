<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Tracking;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Models\ReturnBooking;
use App\Models\ReturnBookingItem;
use App\Models\ReturnItemQuantity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReturnBookingController extends Controller
{

    public function item_view(ReturnBooking $booking)
    {
        $branchId = optional($this->branch)->id;

        if (is_null($branchId)) {
            abort(404, 'Branch ID is not set.');
        }

        $booking->load([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities',
        ]);
        if ($booking->manifest->branch->id == $branchId) {
            return Inertia::render('Dashboard/Transaction/Booking/Return/BookingItem', [
                'booking' => $booking
            ]);
        }

        abort(404, 'Booking does not belong to the specified branch.');
    }

    public function get_items(Request $request)
    {
        $branchId = optional($this->branch)->id;
        $active_session = optional($this->fin_session);

        $perPage = $request->input('per_page', 10);
        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'asc');

        $query = ReturnBooking::query();

        if ($active_session && $active_session->active) {
            $query->whereHas('manifest', function ($mani) use ($active_session) {
                $mani
                    ->where('trip_date', '>=', $active_session->start_date)
                    ->where('trip_date', '<=', $active_session->end_date);
            });
        }

        $bookings = $query->whereHas('manifest.branch', function ($q) use ($branchId) {
            $q->where('id', $branchId);
        })
            ->with(['manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities'])
            ->orderBy($orderBy, $order)
            ->paginate($perPage);

        return response()->json($bookings);
    }

    public function get_item(ReturnBooking $return_booking)
    {
        $branchId = optional($this->branch)->id;
        $return_booking->load(['statuses', 'manifest.branch', 'manifest.lorry', 'consignor.location', 'consignee.location', 'items.item_quantities']);
        if ($return_booking->manifest->branch_id !== $branchId) {
            return response()->json(['error' => 'Booking not found for the specified branch.'], 404);
        }
        return response()->json($return_booking);
    }

    
    public function print_return_item(ReturnBooking $booking)
    {
        $booking->load([
            'manifest.branch',
            'manifest.lorry',
            'consignor.location',
            'consignee.location',
            'items.item_quantities'
        ]);
        return Inertia::render('Dashboard/Transaction/Booking/Return/PrintItem', [
            'booking' => $booking
        ]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bookingData' => 'required|array',
            'bookingData.manifest_id' => 'required|integer',
            'bookingData.cn_no' => 'required|string',
            'bookingData.consignor' => 'required|integer',
            'bookingData.consignee' => 'required|integer',
            'bookingData.amount' => 'required|numeric',
            'bookingData.remarks' => 'nullable|string',
            'bookingData.party_location' => 'nullable|string',
            'bookingItemsData' => 'required|array',
            'bookingItemsData.*.invoice_no' => 'required|string',
            'bookingItemsData.*.invoice_date' => 'nullable|date',
            'bookingItemsData.*.amount' => 'required|numeric',
            'bookingItemsData.*.weight' => 'nullable|numeric',
            'bookingItemsData.*.itemsInfo' => 'required|array',
            'bookingItemsData.*.itemsInfo.*.item_name' => 'required|string',
            'bookingItemsData.*.itemsInfo.*.quantity' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            DB::beginTransaction();

            $booking = ReturnBooking::create([
                'manifest_id' => $request->bookingData['manifest_id'],
                'cn_no' => $request->bookingData['cn_no'],
                'consignor' => $request->bookingData['consignor'],
                'consignee' => $request->bookingData['consignee'],
                'amount' => $request->bookingData['amount'],
                'remarks' => $request->bookingData['remarks'],
                'party_location' => $request->bookingData['party_location'] ? $request->bookingData['party_location'] : '',
            ]);


            if ($booking) {
                $user = Auth::user();
                ActivityLog::create([
                    'title' => 'Return booking Stored',
                    'activity' => 'Return consignment (' . $booking->cn_no . ') has been generated.',
                    'user_id' => $user->id,
                    'branch_id' => $user->branch->id,
                    'created_at' => now()
                ]);

                foreach ($request->bookingItemsData as $itemData) {
                    $bookingItem = ReturnBookingItem::create([
                        'return_booking_id' => $booking->id,
                        'invoice_no' => $itemData['invoice_no'],
                        'invoice_date' => $itemData['invoice_date'],
                        'amount' => $itemData['amount'],
                        'weight' => $itemData['weight'],
                    ]);

                    if ($bookingItem) {
                        foreach ($itemData['itemsInfo'] as $itemInfo) {
                            ReturnItemQuantity::create([
                                'return_booking_item_id' => $bookingItem->id,
                                'item_name' => $itemInfo['item_name'],
                                'quantity' => $itemInfo['quantity'],
                            ]);
                        }
                    }
                }
            }


            DB::commit();

            return response()->json(['message' => 'Return booking created successfully'], 201);
        } catch (\Throwable $th) {
            DB::rollback();
            return response()->json(['error' => 'An error occurred: ' . $th->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ReturnBooking $returnBooking)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ReturnBooking $returnBooking)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReturnBooking $returnBooking)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReturnBooking $returnBooking)
    {
        //
    }
}
