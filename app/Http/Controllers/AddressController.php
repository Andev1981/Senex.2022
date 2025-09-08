<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Models\Region;
use App\Models\Province;
use App\Models\Commune;

class AddressController extends Controller
{
    public function regions()
    {
        return response()->json(
            Region::query()->orderBy('id')->get(['id', 'code', 'name', 'roman'])
        );
    }

    public function provinces(Region $region)
    {
        return response()->json(
            $region->provinces()->orderBy('name')->get(['id', 'code', 'name', 'region_id'])
        );
    }

    public function communes(Province $province)
    {
        return response()->json(
            $province->communes()->orderBy('name')->get(['id', 'code', 'name', 'province_id'])
        );
    }
}
