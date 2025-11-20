<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        // Ya verificado por middleware
        $posts = Post::all();
        return Inertia::render('Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function store(Request $request)
    {
        // Verificación adicional si es necesario
        if (!auth()->user()->can('posts.create')) {
            abort(403, 'No tienes permiso para crear posts.');
        }

        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);

        Post::create($validated);

        return redirect()->route('posts.index')
            ->with('success', 'Post creado exitosamente.');
    }

    public function destroy(Post $post)
    {
        // Usar Gate para verificación más compleja
        if (auth()->user()->cannot('delete', $post)) {
            abort(403);
        }

        $post->delete();

        return redirect()->route('posts.index')
            ->with('success', 'Post eliminado exitosamente.');
    }
}