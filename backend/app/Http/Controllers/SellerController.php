<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function checkHealth(){
        return response()->json([
            "message" => "working"
        ]);
    }
}
