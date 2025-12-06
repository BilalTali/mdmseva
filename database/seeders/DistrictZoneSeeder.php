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
        $srinagar = District::updateOrCreate(
            ['code' => 'JK-SRI'],
            ['name' => 'Srinagar', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($srinagar, [
            'City Zone', 'North Zone', 'South Zone', 'East Zone'
        ]);

        // 2. Ganderbal
        $ganderbal = District::updateOrCreate(
            ['code' => 'JK-GAN'],
            ['name' => 'Ganderbal', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ganderbal, [
            'Ganderbal ', 'Kangan ', 'Lar '
        ]);

        // 3. Budgam
        $budgam = District::updateOrCreate(
            ['code' => 'JK-BUD'],
            ['name' => 'Budgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($budgam, [
            'Budgam ', 'Beerwah ', 'Khansahib ', 'Chadoora ','Khag'
        ]);

        // 4. Anantnag
        $anantnag = District::updateOrCreate(
            ['code' => 'JK-ANA'],
            ['name' => 'Anantnag', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($anantnag, [
            'Anantnag ', 'Bijbehara ', 'Pahalgam '
        ]);

        // 5. Kulgam
        $kulgam = District::updateOrCreate(
            ['code' => 'JK-KUL'],
            ['name' => 'Kulgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kulgam, [
            'Kulgam ', 'DH Pora ', 'Frisal '
        ]);

        // 6. Pulwama
        $pulwama = District::updateOrCreate(
            ['code' => 'JK-PUL'],
            ['name' => 'Pulwama', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($pulwama, [
            'Pulwama ', 'Pampore ', 'Tral '
        ]);

        // 7. Shopian
        $shopian = District::updateOrCreate(
            ['code' => 'JK-SHO'],
            ['name' => 'Shopian', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($shopian, [
            'Shopian ', 'Zainapora '
        ]);

        // 8. Baramulla
        $baramulla = District::updateOrCreate(
            ['code' => 'JK-BAR'],
            ['name' => 'Baramulla', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($baramulla, [
            'Baramulla ', 'Sopore ', 'Uri ', 'Pattan ','Singhpora Pattan','Wagoora','Dangerpora','Chandoosa','Boniyar','Singhpora Kalan','Nehalpora','Kunze','Tangmarg','Rafiabad','Rohuma','Julla','Dangiwicha','Fatehgarh'
            ]);

        // 9. Bandipora
        $bandipora = District::updateOrCreate(
            ['code' => 'JK-BAN'],
            ['name' => 'Bandipora', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($bandipora, [
            'Bandipora ', 'Sumbal ', 'Gurez ','Hajin ','Quilmuqam'
        ]);

        // 10. Kupwara
        $kupwara = District::updateOrCreate(
            ['code' => 'JK-KUP'],
            ['name' => 'Kupwara', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kupwara, [
            'Chamkote','Kupwara','Handwara','Tangdar','Kralpora','Trehgam','Khumriyal','Sogam','Drugmullah','Langate','Mawar','Rajwar','Villgam'
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
        $jammu = District::updateOrCreate(
            ['code' => 'JK-JAM'],
            ['name' => 'Jammu', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($jammu, [
            'City Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone'
        ]);

        // 2. Samba
        $samba = District::updateOrCreate(
            ['code' => 'JK-SAM'],
            ['name' => 'Samba', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($samba, [
            'Samba Zone', 'Vijaypur Zone', 'Ghagwal Zone'
        ]);

        // 3. Kathua
        $kathua = District::updateOrCreate(
            ['code' => 'JK-KAT'],
            ['name' => 'Kathua', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kathua, [
            'Kathua Zone', 'Hiranagar Zone', 'Billawar Zone', 'Bani Zone'
        ]);

        // 4. Udhampur
        $udhampur = District::updateOrCreate(
            ['code' => 'JK-UDH'],
            ['name' => 'Udhampur', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($udhampur, [
            'Udhampur Zone', 'Chenani Zone', 'Ramnagar Zone'
        ]);

        // 5. Reasi
        $reasi = District::updateOrCreate(
            ['code' => 'JK-REA'],
            ['name' => 'Reasi', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($reasi, [
            'Reasi Zone', 'Katra Zone'
        ]);

        // 6. Rajouri
        $rajouri = District::updateOrCreate(
            ['code' => 'JK-RAJ'],
            ['name' => 'Rajouri', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($rajouri, [
            'Rajouri Zone', 'Nowshera Zone', 'Kalakote Zone'
        ]);

        // 7. Poonch
        $poonch = District::updateOrCreate(
            ['code' => 'JK-POO'],
            ['name' => 'Poonch', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($poonch, [
            'Poonch Zone', 'Surankote Zone', 'Mendhar Zone'
        ]);

        // 8. Doda
        $doda = District::updateOrCreate(
            ['code' => 'JK-DOD'],
            ['name' => 'Doda', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($doda, [
            'Doda Zone', 'Bhaderwah Zone', 'Thathri Zone'
        ]);

        // 9. Ramban
        $ramban = District::updateOrCreate(
            ['code' => 'JK-RAM'],
            ['name' => 'Ramban', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ramban, [
            'Ramban Zone', 'Banihal Zone'
        ]);

        // 10. Kishtwar
        $kishtwar = District::updateOrCreate(
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
        $leh = District::updateOrCreate(
            ['code' => 'LD-LEH'],
            ['name' => 'Leh', 'state' => 'Ladakh']
        );
        $this->createZones($leh, [
            'Leh Town Zone', 'Nubra Zone', 'Changthang Zone', 'Khaltse Zone'
        ]);

        // 2. Kargil
        $kargil = District::updateOrCreate(
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
            
            $zone = Zone::updateOrCreate(
                ['code' => $code],
                [
                    'district_id' => $district->id,
                    'name' => $zoneName,
                ]
            );

            if ($zone->wasRecentlyCreated) {
                $this->command->info("  + Created Zone: {$zoneName} ({$code})");
            } else {
                $this->command->line("  ~ Updated Zone: {$zoneName} ({$code})");
            }
        }
    }
}