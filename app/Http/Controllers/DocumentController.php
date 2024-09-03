<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        if ($document) {
            $booking_id = $document->booking->id;
            Storage::disk('public')->delete($document->file_location);
            $document->delete();
            $user = Auth::user();
            ActivityLog::create([
                'title' => 'Document Removed',
                'activity' => 'Document of booking id ('. $booking_id .') has been Removed !',
                'user_id' => $user->id,
                'created_at' => now()
            ]);
            return response()->json(['message' => 'Document deleted successfully'], 200);
        } else {
            return response()->json(['message' => 'Document not found'], 404);
        }
    }
}
