<?php

namespace App\Policies;

use App\Models\Dte;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DtePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin', 'user']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Dte $dte): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $dte->company_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin', 'user']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Dte $dte): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $dte->company_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Dte $dte): bool
    {
        return $user->isSuperAdmin() || ($user->hasRole('admin') && $user->company_id === $dte->company_id);
    }
}