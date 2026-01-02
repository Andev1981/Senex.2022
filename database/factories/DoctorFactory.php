<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Company;
use App\Rules\ValidRut;
use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Doctor::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'company_id' => Company::factory(),
            'name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'rut' => ValidRut::generate(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => '+569' . $this->faker->numerify('########'),
            'speciality' => $this->faker->jobTitle(),
            'birth_date' => $this->faker->dateTimeBetween('-60 years', '-25 years'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'license_number' => $this->faker->numerify('#######'),
        ];
    }
}
