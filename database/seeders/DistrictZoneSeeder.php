<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\District;
use App\Models\Zone;

class DistrictZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding districts and zones for J&K and Ladakh...');

        // Jammu & Kashmir - Kashmir Division (10 districts)
        $this->seedKashmirDivision();

        // Jammu & Kashmir - Jammu Division (10 districts)
        $this->seedJammuDivision();

        // Ladakh (2 districts)
        $this->seedLadakh();

        $this->command->info('Districts and zones seeding completed successfully!');
        $this->command->info('Total: 22 districts seeded');
    }

    /**
     * Seed Kashmir Division districts and zones
     */
    private function seedKashmirDivision(): void
    {
        $this->command->info('Seeding Kashmir Division...');

        // 1. Srinagar
        $srinagar = District::firstOrCreate(
            ['code' => 'JK-SRI'],
            ['name' => 'Srinagar', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($srinagar, [
            'City Zone', 'North Zone', 'South Zone', 'East Zone'
        ]);

        // 2. Ganderbal
        $ganderbal = District::firstOrCreate(
            ['code' => 'JK-GAN'],
            ['name' => 'Ganderbal', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ganderbal, [
            'Ganderbal Zone', 'Kangan Zone', 'Lar Zone'
        ]);

        // 3. Budgam
        $budgam = District::firstOrCreate(
            ['code' => 'JK-BUD'],
            ['name' => 'Budgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($budgam, [
            'Budgam Zone', 'Beerwah Zone', 'Khansahib Zone', 'Chadoora Zone','Khag'
        ]);

        // 4. Anantnag
        $anantnag = District::firstOrCreate(
            ['code' => 'JK-ANA'],
            ['name' => 'Anantnag', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($anantnag, [
            'Anantnag Zone', 'Bijbehara Zone', 'Pahalgam Zone'
        ]);

        // 5. Kulgam
        $kulgam = District::firstOrCreate(
            ['code' => 'JK-KUL'],
            ['name' => 'Kulgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kulgam, [
            'Kulgam Zone', 'DH Pora Zone', 'Frisal Zone'
        ]);

        // 6. Pulwama
        $pulwama = District::firstOrCreate(
            ['code' => 'JK-PUL'],
            ['name' => 'Pulwama', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($pulwama, [
            'Pulwama Zone', 'Pampore Zone', 'Tral Zone'
        ]);

        // 7. Shopian
        $shopian = District::firstOrCreate(
            ['code' => 'JK-SHO'],
            ['name' => 'Shopian', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($shopian, [
            'Shopian Zone', 'Zainapora Zone'
        ]);

        // 8. Baramulla
        $baramulla = District::firstOrCreate(
            ['code' => 'JK-BAR'],
            ['name' => 'Baramulla', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($baramulla, [
            'Baramulla Zone', 'Sopore Zone', 'Uri Zone', 'Pattan Zone'
        ]);

        // 9. Bandipora
        $bandipora = District::firstOrCreate(
            ['code' => 'JK-BAN'],
            ['name' => 'Bandipora', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($bandipora, [
            'Bandipora Zone', 'Sumbal Zone', 'Gurez Zone'
        ]);

        // 10. Kupwara
        $kupwara = District::firstOrCreate(
            ['code' => 'JK-KUP'],
            ['name' => 'Kupwara', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kupwara, [
            'Kupwara Zone', 'Handwara Zone', 'Karnah Zone', 'Lolab Zone'
        ]);

        $this->command->info('✓ Kashmir Division: 10 districts seeded');
    }

    /**
     * Seed Jammu Division districts and zones
     */
    private function seedJammuDivision(): void
    {
        $this->command->info('Seeding Jammu Division...');

        // 1. Jammu
        $jammu = District::firstOrCreate(
            ['code' => 'JK-JAM'],
            ['name' => 'Jammu', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($jammu, [
            'City Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone'
        ]);

        // 2. Samba
        $samba = District::firstOrCreate(
            ['code' => 'JK-SAM'],
            ['name' => 'Samba', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($samba, [
            'Samba Zone', 'Vijaypur Zone', 'Ghagwal Zone'
        ]);

        // 3. Kathua
        $kathua = District::firstOrCreate(
            ['code' => 'JK-KAT'],
            ['name' => 'Kathua', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kathua, [
            'Kathua Zone', 'Hiranagar Zone', 'Billawar Zone', 'Bani Zone'
        ]);

        // 4. Udhampur
        $udhampur = District::firstOrCreate(
            ['code' => 'JK-UDH'],
            ['name' => 'Udhampur', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($udhampur, [
            'Udhampur Zone', 'Chenani Zone', 'Ramnagar Zone'
        ]);

        // 5. Reasi
        $reasi = District::firstOrCreate(
            ['code' => 'JK-REA'],
            ['name' => 'Reasi', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($reasi, [
            'Reasi Zone', 'Katra Zone'
        ]);

        // 6. Rajouri
        $rajouri = District::firstOrCreate(
            ['code' => 'JK-RAJ'],
            ['name' => 'Rajouri', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($rajouri, [
            'Rajouri Zone', 'Nowshera Zone', 'Kalakote Zone'
        ]);

        // 7. Poonch
        $poonch = District::firstOrCreate(
            ['code' => 'JK-POO'],
            ['name' => 'Poonch', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($poonch, [
            'Poonch Zone', 'Surankote Zone', 'Mendhar Zone'
        ]);

        // 8. Doda
        $doda = District::firstOrCreate(
            ['code' => 'JK-DOD'],
            ['name' => 'Doda', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($doda, [
            'Doda Zone', 'Bhaderwah Zone', 'Thathri Zone'
        ]);

        // 9. Ramban
        $ramban = District::firstOrCreate(
            ['code' => 'JK-RAM'],
            ['name' => 'Ramban', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ramban, [
            'Ramban Zone', 'Banihal Zone'
        ]);

        // 10. Kishtwar
        $kishtwar = District::firstOrCreate(
            ['code' => 'JK-KIS'],
            ['name' => 'Kishtwar', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kishtwar, [
            'Kishtwar Zone', 'Paddar Zone'
        ]);

        $this->command->info('✓ Jammu Division: 10 districts seeded');
    }

    /**
     * Seed Ladakh districts and zones
     */
    private function seedLadakh(): void
    {
        $this->command->info('Seeding Ladakh...');

        // 1. Leh
        $leh = District::firstOrCreate(
            ['code' => 'LD-LEH'],
            ['name' => 'Leh', 'state' => 'Ladakh']
        );
        $this->createZones($leh, [
            'Leh Town Zone', 'Nubra Zone', 'Changthang Zone', 'Khaltse Zone'
        ]);

        // 2. Kargil
        $kargil = District::firstOrCreate(
            ['code' => 'LD-KAR'],
            ['name' => 'Kargil', 'state' => 'Ladakh']
        );
        $this->createZones($kargil, [
            'Kargil Town Zone', 'Zanskar Zone', 'Drass Zone', 'Shakar-Chiktan Zone'
        ]);

        $this->command->info('✓ Ladakh: 2 districts seeded');
    }

    /**
     * Create zones for a district
     */
    private function createZones(District $district, array $zoneNames): void
    {
        foreach ($zoneNames as $index => $zoneName) {
            $code = strtoupper($district->code . '-Z' . str_pad($index + 1, 2, '0', STR_PAD_LEFT));
            
            Zone::firstOrCreate(
                ['code' => $code],
                [
                    'district_id' => $district->id,
                    'name' => $zoneName,
                ]
            );
        }
    }
}