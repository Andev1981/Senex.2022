<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\DteConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DteConfigurationController extends Controller
{
    public function storeOrUpdate(Request $request, Company $company)
    {
        $this->authorize('update', $company);
        
        $request->validate([
            'company_rut' => 'required|string',
            'certificate_file' => 'nullable|file|extensions:p12,pfx|max:2048',
            'certificate_password' => $request->hasFile('certificate_file') ? 'required|string' : 'nullable',
            'environment' => 'required|in:certification,production',
            'simulation_mode' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Buscamos o creamos la configuración
            $config = $company->dteConfiguration ?: new DteConfiguration();
            $config->company_id = $company->id;
            
            // Forzamos el guardado del RUT de la empresa (Emisor)
            $config->company_rut = preg_replace('/[^0-9Kk]/', '', $request->company_rut);
            $config->environment = $request->environment;
            $config->simulation_mode = $request->simulation_mode;

            if ($request->hasFile('certificate_file')) {
                // Borrar certificado físico anterior si existe
                if ($config->certificate_path && Storage::disk('private')->exists($config->certificate_path)) {
                    Storage::disk('private')->delete($config->certificate_path);
                }

                $password = $request->certificate_password;
                $file = $request->file('certificate_file');

                $pfxContent = file_get_contents($file->getRealPath());
                $certStore = [];

                // Limpiar errores previos de OpenSSL
                while (openssl_error_string());

                if (!openssl_pkcs12_read($pfxContent, $certStore, $password)) {
                    $errors = [];
                    while ($msg = openssl_error_string()) {
                        $errors[] = $msg;
                    }
                    $fullError = implode(' | ', $errors);

                    $msg = "Error de validación: ";
                    if (str_contains($fullError, 'mac verify failure')) {
                        $msg .= "La contraseña es incorrecta para este certificado.";
                    } elseif (str_contains($fullError, 'unsupported') || str_contains($fullError, '0308010C')) {
                        $msg .= "Cifrado Legacy no soportado por esta versión de OpenSSL 3. Detalle técnico: " . $fullError;
                    } else {
                        $msg .= "No se pudo leer el certificado. Errores: " . $fullError;
                    }

                    throw ValidationException::withMessages([
                        'certificate_password' => $msg
                    ]);
                }
                
                $certData = openssl_x509_parse($certStore['cert']);

                // EXTRAER RUT USANDO LIBREDTE (EL MÉTODO OFICIAL)
                try {
                    $Firma = new \sasco\LibreDTE\FirmaElectronica([
                        'data' => $pfxContent,
                        'pass' => $password
                    ]);
                    $extractedRut = preg_replace('/[^0-9Kk]/', '', $Firma->getID());
                    if ($extractedRut) {
                        $config->signer_rut = $extractedRut;
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("LibreDTE getID failed: " . $e->getMessage());
                }

                $validTo = isset($certData['validTo_time_t'])
                    ? date('Y-m-d H:i:s', $certData['validTo_time_t'])
                    : null;

                $path = $file->store('tenants/' . $company->id . '/dte/certificates', 'private');

                $config->certificate_path = $path;
                $config->certificate_password = Crypt::encryptString($password);
                $config->expiration_date = $validTo;
            }

            $config->save();

            // Sincronizar RUT con la tabla principal de la empresa si es necesario
            $company->update(['rut' => $config->company_rut]);

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
            return back()->with('success', 'Configuración DTE guardada. Certificado expira el: ' . ($config->expiration_date ?? 'No definida'));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
