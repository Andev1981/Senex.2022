<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvoicePolicy
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
    public function view(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $invoice->company_id;
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
    public function update(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $invoice->company_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || ($user->hasRole('admin') && $user->company_id === $invoice->company_id);
    }

    /**
     * Determine whether the user can download the PDF.
     */
    public function download(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $invoice->company_id;
    }

    /**
     * Determine whether the user can send the invoice by email.
     */
    public function sendEmail(User $user, Invoice $invoice): bool
    {
        return $user->isSuperAdmin() || $user->company_id === $invoice->company_id;
    }
}
