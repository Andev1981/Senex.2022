<?php

namespace App\Services;

use App\Models\CompanyDirectory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CompanyDataService
{
    /**
     * Get company data by RUT with "Cache on Demand" strategy.
     *
     * @param string $rut
     * @return CompanyDirectory|null
     */
    public function getByRut(string $rut): ?CompanyDirectory
    {
        $rut = $this->cleanRut($rut);

        // 2. Search in local DB (Using prefix as per Gold Rule)
        $company = CompanyDirectory::where('companies_directory.rut', $rut)->first();

        // 3. Check if local data is fresh (less than 30 days old)
        if ($company && $company->last_api_sync_at && $company->last_api_sync_at->gt(now()->subDays(30))) {
            return $company;
        }

        // 4. If not exists or old, fetch from API
        try {
            $response = Http::timeout(10)->get("https://api.libreapi.cl/rut/activities", [
                'rut' => $rut
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // LibreAPI structure: { status: 'success', data: { name: '...', activities: [...] } }
                $businessName = $data['data']['name'] ?? null;
                $activities = $data['data']['activities'] ?? [];
                $mainActivity = !empty($activities) ? $activities[0]['name'] : null;

                if ($businessName) {
                    return CompanyDirectory::updateOrCreate(
                        ['rut' => $rut],
                        [
                            'business_name' => $businessName,
                            'activity' => $mainActivity,
                            'last_api_sync_at' => now(),
                        ]
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error("Error fetching company data for RUT {$rut}: " . $e->getMessage());
            
            // If API fails, return old data if exists
            if ($company) {
                return $company;
            }
        }

        return null;
    }

    /**
     * Clean RUT string.
     */
    private function cleanRut(string $rut): string
    {
        return preg_replace('/[^0-9Kk]/', '', strtoupper($rut));
    }
}
