<?php

namespace App\Traits;

use App\Models\PatientContact;

trait NotificationUtils
{
  /**
   * Formatea un monto entero a formato moneda CLP ($10.000)
   */
  public function formatCLP(int $amount): string
  {
    return '$' . number_format($amount, 0, ',', '.');
  }

  /**
   * Obtiene solo el primer nombre de un string
   */
  public function getFirstName(string $fullName): string
  {
    return explode(' ', trim($fullName))[0];
  }

  /**
   * Resuelve quién es el destinatario (Paciente o Tutor)
   * y retorna el nombre que se debe usar en el saludo.
   */
  public function getRecipientName($notifiable): string
  {
    if ($notifiable->require_tutor) {
      $tutor = $notifiable->contacts()->where('is_primary', true)->first();
      return $tutor ? $tutor->name : $notifiable->name;
    }

    return $notifiable->name;
  }

  /**
   * Retorna una mención al paciente si existe un tutor de por medio
   * Útil para: "Tienes un pago de [Nombre Paciente]"
   */
  public function getPatientReference($notifiable): string
  {
    return $notifiable->require_tutor ? " de {$notifiable->name}" : "";
  }

  /**
   * Formatear número de teléfono a E.164 (Chile)
   */
  private function formatWhatsAppNumber(?string $phone): ?string
  {
    if (!$phone) {
      return null;
    }

    // Limpiar caracteres no numéricos
    $phone = preg_replace('/[^0-9]/', '', $phone);

    // Si está vacío después de limpiar
    if (empty($phone)) {
      return null;
    }

    // Si ya tiene código de país Chile (56)
    if (str_starts_with($phone, '56')) {
      return '+' . $phone;
    }

    // Si empieza con 9 y tiene 9 dígitos (celular chileno)
    if (str_starts_with($phone, '9') && strlen($phone) === 9) {
      return '+56' . $phone;
    }

    // Si tiene 8 dígitos (celular sin el 9 inicial)
    if (strlen($phone) === 8) {
      return '+569' . $phone;
    }

    // Si empieza con 2 y tiene 9 dígitos (fijo Santiago)
    if (str_starts_with($phone, '2') && strlen($phone) === 9) {
      return '+56' . $phone;
    }

    return null;
  }
}
