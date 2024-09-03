<?php

use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LorryController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ItemUnitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ManifestController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\UserRoleController;
use App\Http\Middleware\PrivilegeMiddleware;
use App\Http\Controllers\FinSessionController;
use App\Http\Controllers\BookingItemController;
use App\Http\Controllers\ReturnBookingController;

Route::controller(PagesController::class)->group(function () {
    Route::get('/', 'welcome');
    Route::get('/test', 'test');
   
});

Route::get('/linkstorage', function() {
    Artisan::call('storage:link');
    return 'Storage link created successfully.';
});


// auth routes

Route::middleware('auth')->group(function () {
    // view
    Route::controller(PagesController::class)->group(function () {
        Route::get('/dashboard', 'dashboard')->name('dashboard');
        Route::get('/master/item-units', 'item_unit');
        Route::get('/master/locations', 'location_master');
        Route::get('/master/branches', 'branch_master')->middleware(PrivilegeMiddleware::class . ':500');
        Route::get('/master/parties', 'party_master');
        Route::get('/master/items', 'item_master');
        Route::get('/master/lorries', 'lorry_master');
        Route::get('/transaction/manifest', 'manifest_list');
        Route::get('/transaction/booking', 'booking_list');
        Route::get('/transaction/challan', 'challan_list');
        Route::get('/booking/track', 'track_status');
        Route::get('/transaction/booking/report', 'booking_report');
        Route::get('/transaction/booking/party-report', 'party_booking_report');
    });

    // operations
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::get('/master/user/branch', 'get_branch');
    });

    
    Route::controller(LocationController::class)->group(function () {
        Route::get('/master/data/locations', 'get_locations');
        Route::get('/master/data/location/{location}', 'get_location');
        Route::post('/master/data/new/location', 'store');
        Route::put('/master/data/location/{location}', 'update');
        Route::delete('/master/data/location/{location}', 'destroy');
    });

    Route::controller(LorryController::class)->group(function () {
        Route::get('/master/data/lorries', 'get_lorries');
        Route::get('/master/data/lorry/{lorry}', 'get_lorry');
        Route::post('/master/data/new/lorry', 'store');
        Route::put('/master/data/lorry/{lorry}', 'update');
        Route::delete('/master/data/lorry/{lorry}', 'destroy');
    });

    Route::controller(BranchController::class)->group(function () {
        Route::get('/master/data/branches', 'get_items');
        Route::get('/master/data/branches/all', 'get_all');
        Route::get('/master/data/branch/{branch}', 'get_item');
        Route::post('/master/data/new/branch', 'store');
        Route::put('/master/data/branch/{branch}', 'update');
        Route::delete('/master/data/branch/{branch}', 'destroy');
    });

    Route::controller(PartyController::class)->group(function () {
        Route::get('/master/data/parties', 'get_items');
        Route::get('/master/data/parties/all', 'get_allitems');
        Route::get('/master/data/party/{party}', 'get_item');
        Route::post('/master/data/new/party', 'store');
        Route::put('/master/data/party/{party}', 'update');
        Route::delete('/master/data/party/{party}', 'destroy');
    });

    Route::controller(ItemUnitController::class)->group(function () {
        Route::get('/master/data/itemunits', 'get_itemunits');
        Route::get('/master/data/itemunit/{item_unit}', 'get_itemunit');
        Route::post('/master/data/new/itemunit', 'store');
        Route::put('/master/data/itemunit/{item_unit}', 'update');
        Route::delete('/master/data/itemunit/{item_unit}', 'destroy');
    });

    Route::controller(ItemController::class)->group(function () {
        Route::get('/master/data/items', 'get_items');
        Route::get('/master/data/item/{item}', 'get_item');
        Route::post('/master/data/new/item', 'store');
        Route::put('/master/data/item/{item}', 'update');
        Route::delete('/master/data/item/{item}', 'destroy');
    });
    
    Route::controller(BookingController::class)->group(function () {
        Route::get('/data/bookings', 'get_items');
        Route::get('/transaction/booking/{booking}', 'booking_view');
        Route::get('/data/booking/{booking}', 'get_item');
        Route::post('/data/booking/new', 'store');
        Route::put('/data/update/booking/{booking}', 'update');
        Route::delete('/data/booking/delete/{booking}', 'destroy');
        // status
        Route::post('/transaction/booking/status/{booking}', 'update_status');
        Route::post('/transaction/booking/upload_document/{booking}', 'upload_document');
        // booking_reports
        Route::post('/data/report/booking', 'booking_reports');
        Route::post('/data/report/return/booking', 'return_booking_reports');
        // 
        Route::post('/data/report/party_booking', 'party_booking_reports');

        // print page
        Route::get('/print/booking/{booking}', 'print_booking_item');
    });

    Route::controller(ReturnBookingController::class)->group(function () {
        Route::get('/data/return/bookings', 'get_items');
        Route::get('/data/return/booking/{booking}', 'get_item');
        Route::get('/transaction/return/booking/{booking}', 'item_view');
        Route::post('/data/return/booking/new', 'store');
        Route::delete('/data/return/booking/delete/{booking}', 'destroy');
    });

    Route::controller(ManifestController::class)->group(function () {
        Route::get('/data/manifests', 'get_items');
        Route::get('/data/manifest/{manifest}', 'get_item');
        Route::post('/data/manifest/new', 'store');
        Route::put('/data/update/manifest/{manifest}', 'update');
        Route::delete('/data/manifest/delete/{manifest}', 'destroy');
    });
    
    Route::controller(TrackingController::class)->group(function () {
        Route::get('/data/trackings', 'get_items');
    });
    
    Route::controller(UserRoleController::class)->group(function () {
        Route::get('/master/data/roles/all', 'get_all');
    });
    Route::controller(UserController::class)->group(function () {
        Route::get('/administration/manage-user', 'index');
        Route::get('/data/users', 'get_users');
        Route::get('/data/user/{user}', 'get_user');
        Route::post('/data/store/user', 'store');
        Route::put('/data/update/user/{user}', 'update');
        Route::put('/data/change/password/{user}', 'change_password');
        Route::delete('/data/delete/user/{user}', 'destroy');
    });
});

Route::controller(FinSessionController::class)->group(function () {
    Route::get('/data/sessions', 'get_items');
    Route::get('/data/session/{finsession}', 'get_item');
    Route::post('/data/session/store', 'store');
    Route::put('/data/session/update/{finsession}', 'update');
    Route::delete('/data/session/delete/{finsession}', 'destroy');
    Route::post('/data/session/{finsession}/activate', 'set_current_session');
});

Route::controller(DocumentController::class)->group(function () {
    Route::delete('/data/delete/{document}', 'destroy');
});

Route::controller(BookingItemController::class)->group(function () {
    Route::post('/data/invoice/check', 'duplicate_check');
    Route::post('/data/return/invoice/check', 'duplicate_return_check');
    Route::get('/data/last_item/challan', 'last_number');
    Route::get('/data/return/last_item/challan', 'last_return_number');
});
Route::controller(ActivityLogController::class)->group(function () {
    Route::get('/administration/activity-log', 'index');
    Route::get('/data/activities', 'get_items');
    Route::get('/data/activities/user/{user}', 'get_user_items');
});

require __DIR__ . '/auth.php';
