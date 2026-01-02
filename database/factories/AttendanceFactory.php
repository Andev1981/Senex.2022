<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'status' => $this->faker->randomElement(['scheduled', 'completed', 'cancelled']),
            'observations' => $this->faker->sentence(),
            'patient_id' => \App\Models\Patient::factory(),
            'doctor_id' => \App\Models\Doctor::factory(),
        ];
    }

    /**
     * Indicate that the attendance is completed.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function realizada()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
            ];
        });
    }

    /**
     * Indicate that the attendance is scheduled.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pendiente()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'scheduled',
            ];
        });
    }
}