<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class StepsController extends Controller
{

    public function stepOne(){
        if(Session::get('data')){
            Session::forget('data');
        }
        Session::put('currentPage',1);
        return view('steps.step1');
    }

    public function stepTwo(){

        return view('steps.step2');
    }
    public function stepThree(){

        return view('steps.step1');
    }
    public function stepFour(){
        return view('steps.step1');
    }
    public function stepFive(){
        return view('steps.step1');
    }

    public function toStepTwo(Request $request){


        Session::put('currentPage',1);

        return view('steps.step2');

    }


}
