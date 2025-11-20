<?php
// app/Mail/WelcomeKineEmail.php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeKineEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $temporalPassword
    ) {}

    public function build()
    {
        return $this->subject('Bienvenido al Portal Kine')
            ->markdown('emails.kines.welcome');
    }
}