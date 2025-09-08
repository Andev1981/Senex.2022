<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {


        // Users base (ajusta si ya la tienes)
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('last_name')->nullable();
            $t->string('email')->unique();
            $t->string('password');
            $t->enum('role', ['admin', 'reception', 'kine', 'finance'])->default('kine');
            $t->rememberToken();
            $t->timestamp('email_verified_at')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
    }

    public function down(): void
    {

        Schema::dropIfExists('users');
    }
};
