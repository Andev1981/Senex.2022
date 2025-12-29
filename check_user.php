<?php
use App\Models\User;

$user = User::where('email', 'javt1981@gmail.com')->first();
if ($user) {
    echo "Sucursales de " . $user->name . ":\n";
    foreach ($user->branches as $b) {
        echo "ID: " . $b->id . " - Nombre: " . $b->name . "\n";
    }
} else {
    echo "Usuario no encontrado.\n";
}

