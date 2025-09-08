<?php

namespace App\Models\Concerns;

use App\Models\Address;

trait HasAddresses
{
  public function addresses()
  {
    return $this->morphMany(Address::class, 'addressable')->orderByDesc('is_primary');
  }

  public function primaryAddress()
  {
    return $this->morphOne(Address::class, 'addressable')->where('is_primary', true);
  }

  public function setPrimaryAddress(Address $address): void
  {
    // desmarca otras primarias de la misma entidad
    $this->addresses()->update(['is_primary' => false]);

    $address->is_primary = true;
    $address->save();
  }
}
