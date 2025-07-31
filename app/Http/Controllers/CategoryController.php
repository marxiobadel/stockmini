<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('categories', ['categories' => Category::all()]);
    }
}
