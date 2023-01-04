<?php

namespace App\Http\Controllers;

use App\Models\QuizzQuestion;
use App\Http\Requests\StoreQuizzQuestionRequest;
use App\Http\Requests\UpdateQuizzQuestionRequest;

class QuizzQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreQuizzQuestionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreQuizzQuestionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\QuizzQuestion  $quizzQuestion
     * @return \Illuminate\Http\Response
     */
    public function show(QuizzQuestion $quizzQuestion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\QuizzQuestion  $quizzQuestion
     * @return \Illuminate\Http\Response
     */
    public function edit(QuizzQuestion $quizzQuestion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateQuizzQuestionRequest  $request
     * @param  \App\Models\QuizzQuestion  $quizzQuestion
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateQuizzQuestionRequest $request, QuizzQuestion $quizzQuestion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\QuizzQuestion  $quizzQuestion
     * @return \Illuminate\Http\Response
     */
    public function destroy(QuizzQuestion $quizzQuestion)
    {
        //
    }
}
