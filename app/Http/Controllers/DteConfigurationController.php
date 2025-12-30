<?php

namespace App\Http\Controllers;

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
        $request->validate([
            'rut_empresa' => 'required|string',
            'certificado_file' => 'nullable|file|mimes:p12,pfx|max:2048', // PFX suele ser p12
            'certificado_password' => 'required_with:certificado_file|string',
            'ambiente' => 'required|in:homologacion,produccion',
            'simulation_mode' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Buscamos o instanciamos la config
            $config = $company->dteConfiguration ?? new DteConfiguration(['company_id' => $company->id]);

            $config->rut_empresa = $request->rut_empresa;
            $config->ambiente = $request->ambiente;
            $config->simulation_mode = $request->simulation_mode;

            // Lógica de Certificado Digital
            if ($request->hasFile('certificado_file')) {
                $password = $request->certificado_password;
                $file = $request->file('certificado_file');

                // 1. Validar que el certificado y la clave sean válidos antes de guardar
                $pfxContent = file_get_contents($file->getRealPath());
                $certStore = [];

                if (!openssl_pkcs12_read($pfxContent, $certStore, $password)) {
                    throw new \Exception("La contraseña del certificado es incorrecta o el archivo está dañado.");
                }

                // 2. Extraer fecha de caducidad del certificado
                $certData = openssl_x509_parse($certStore['cert']);
                $validTo = isset($certData['validTo_time_t'])
                    ? date('Y-m-d H:i:s', $certData['validTo_time_t'])
                    : null;

                // 3. Guardar archivo en carpeta PRIVADA y SEGURA
                $path = $file->store('tenants/' . $company->id . '/dte/certificates', 'private');

                // 4. Actualizar campos
                $config->certificado_path = $path;
                $config->certificado_password = Crypt::encryptString($password); // 🔒 ENCRIPTADO
                $config->fecha_caducidad = $validTo;
            }

            $company->dteConfiguration()->save($config);

            // Lógica de Logo (Polimórfico)
            if ($request->hasFile('logo')) {
                // 1. Obtener logo anterior para borrar el archivo físico
                $oldLogo = $company->logo;
                if ($oldLogo && Storage::disk('public')->exists($oldLogo->path)) {
                    Storage::disk('public')->delete($oldLogo->path);
                }

                // 2. Guardar nuevo logo
                $file = $request->file('logo');
                $extension = $file->getClientOriginalExtension();
                $path = $file->storeAs(
                    "branding/tenants/{$company->id}", 
                    "logo_{$company->id}_" . time() . ".{$extension}", 
                    'public'
                );

                // 3. Actualizar registro polimórfico
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
            return back()->with('success', 'Configuración DTE guardada. Certificado expira el: ' . $config->fecha_caducidad);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
