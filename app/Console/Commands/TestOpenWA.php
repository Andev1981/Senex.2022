<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\OpenWAService;

class TestOpenWA extends Command
{
    protected $signature = 'openwa:test {phone} {message}';
    protected $description = 'Send a test WhatsApp message via OpenWA';

    public function handle(OpenWAService $openWA)
    {
        $phone = $this->argument('phone');
        $message = $this->argument('message');

        $this->info("Enviando mensaje a {$phone}...");

        if ($openWA->sendWhatsApp($phone, $message)) {
            $this->info('✅ Mensaje enviado exitosamente.');
        } else {
            $this->error('❌ Error al enviar el mensaje. Revisa los logs.');
        }
    }
}
