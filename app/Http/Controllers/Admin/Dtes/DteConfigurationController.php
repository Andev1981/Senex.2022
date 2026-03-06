<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\DteConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DteConfigurationController extends Controller
{
    public function storeOrUpdate(Request $request, Company $company)
    {
        $this->authorize('update', $company);
        
        // Validación actualizada con nombres en inglés
        $request->validate([
            'company_rut' => 'required|string',
            'certificate_file' => 'nullable|file|mimes:p12,pfx|max:2048',
            'certificate_password' => 'required_with:certificate_file|string',
            'environment' => 'required|in:certification,production',
            'simulation_mode' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            $config = $company->dteConfiguration ?? new DteConfiguration(['company_id' => $company->id]);

            $config->company_rut = $request->company_rut;
            $config->environment = $request->environment;
            $config->simulation_mode = $request->simulation_mode;

            if ($request->hasFile('certificate_file')) {
                $password = $request->certificate_password;
                $file = $request->file('certificate_file');

                $pfxContent = file_get_contents($file->getRealPath());
                $certStore = [];

                if (!openssl_pkcs12_read($pfxContent, $certStore, $password)) {
                    throw new \Exception("La contraseña del certificado es incorrecta o el archivo está dañado.");
                }

                $certData = openssl_x509_parse($certStore['cert']);
                $validTo = isset($certData['validTo_time_t'])
                    ? date('Y-m-d H:i:s', $certData['validTo_time_t'])
                    : null;

                $path = $file->store('tenants/' . $company->id . '/dte/certificates', 'private');

                $config->certificate_path = $path;
                $config->certificate_password = Crypt::encryptString($password);
                $config->expiration_date = $validTo;
            }

            $company->dteConfiguration()->save($config);

            // Lógica de Logo
            if ($request->hasFile('logo')) {
                $oldLogo = $company->logo;
                if ($oldLogo && Storage::disk('public')->exists($oldLogo->path)) {
                    Storage::disk('public')->delete($oldLogo->path);
                }

                $file = $request->file('logo');
                $extension = $file->getClientOriginalExtension();
                $path = $file->storeAs(
                    "branding/tenants/{$company->id}", 
                    "logo_{$company->id}_" . time() . ".{$extension}", 
                    'public'
                );

                $company->logo()->updateOrCreate(
                    ['type' => 'logo'],
                    [
                        'path' => $path, 
                        'url' => Storage::disk('public')->url($path),
                        'extension' => $extension
                    ]
                );
            }

            DB::commit();
            return back()->with('success', 'Configuración DTE guardada. Certificado expira el: ' . $config->expiration_date);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
