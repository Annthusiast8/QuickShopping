<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Report an item
     */
    public function reportItem(Request $request, $itemId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        // Check if item exists
        $item = Item::findOrFail($itemId);
        
        // Check if user has already reported this item
        $existingReport = ItemReport::where('item_id', $itemId)
            ->where('user_id', Auth::id())
            ->where('status', 'pending')
            ->first();
            
        if ($existingReport) {
            return response()->json([
                'message' => 'You have already reported this item'
            ], 400);
        }
        
        // Create report
        $report = ItemReport::create([
            'item_id' => $itemId,
            'user_id' => Auth::id(),
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending'
        ]);
        
        return response()->json([
            'message' => 'Item reported successfully',
            'report' => $report
        ], 201);
    }
    
    /**
     * Get all reports (admin only)
     */
    public function getAllReports(Request $request)
    {
        $status = $request->query('status', 'pending');
        
        $reports = ItemReport::with(['item', 'user'])
            ->when($status !== 'all', function($query) use ($status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($reports);
    }
    
    /**
     * Review a report (admin only)
     */
    public function reviewReport(Request $request, $reportId)
    {
        $request->validate([
            'status' => 'required|in:reviewed,resolved',
            'admin_notes' => 'nullable|string',
            'remove_item' => 'boolean'
        ]);
        
        $report = ItemReport::with('item')->findOrFail($reportId);
        
        // Update report
        $report->status = $request->status;
        $report->admin_notes = $request->admin_notes;
        $report->reviewed_by = Auth::id();
        $report->reviewed_at = Carbon::now();
        $report->save();
        
        // If admin wants to remove the item
        if ($request->remove_item) {
            $item = $report->item;
            
            if ($item) {
                // Deactivate the item instead of deleting it
                $item->status = 'removed';
                $item->save();
            }
        }
        
        return response()->json([
            'message' => 'Report reviewed successfully',
            'report' => $report->load(['item', 'user', 'reviewer'])
        ]);
    }
} 