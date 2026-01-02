<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Rules\ValidRut;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ActivityLog>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'user_id' => \App\Models\User::factory(),
            // Campos de identificación
            'rut' => ValidRut::generate(), 
            'name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'birth_date' => $this->faker->dateTimeBetween('-80 years', '-1 year'),
            
            // Campo clave para las pruebas de Twilio/WhatsApp
            'phone' => '+569' . $this->faker->unique()->numerify('########'), 
            
            // Campo para el Email (necesario para notificaciones)
            'email' => $this->faker->unique()->safeEmail(),
            
            'status' => 'active',
        ];
    }
}
