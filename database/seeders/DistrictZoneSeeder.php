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

        // Clear application cache to ensure fresh data is served
        $this->command->info('Clearing application cache...');
        \Illuminate\Support\Facades\Cache::forget('districts:all');
        \Illuminate\Support\Facades\Cache::forget('districts:Jammu and Kashmir');
        \Illuminate\Support\Facades\Cache::forget('districts:Ladakh');
        \Illuminate\Support\Facades\Cache::forget('zones:all');
        // Ideally we should clear all zone caches, but a full flush is safer here
        $this->command->call('cache:clear');
        $this->command->info('✓ Application cache cleared.');
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
            'BATMALOO','GULAB BAGH','HAWAL','IDDGAH','NISHAT','RAINAWARI','SRINAGAR','ZALDAGAR' 
        ]);

        // 2. Ganderbal
        $ganderbal = District::updateOrCreate(
            ['code' => 'JK-GAN'],
            ['name' => 'Ganderbal', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ganderbal, [
            'Ganderbal ', 'HARIGANWAN ', 'KANGAN ', 'TULMULLA '
        ]);

        // 3. Budgam
        $budgam = District::updateOrCreate(
            ['code' => 'JK-BUD'],
            ['name' => 'Budgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($budgam, [
            'Budgam ', 'Beerwah ', 'Khansahib ','Khag','B K PORA','CHADOORA','CHARAR-I-SHARIF','DREYGAM','HARDUPANZOO','MAGAM','NAGAM','NARBAL','NURBAL','SOIBUGH'
        ]);

        // 4. Anantnag
        $anantnag = District::updateOrCreate(
            ['code' => 'JK-ANA'],
            ['name' => 'Anantnag', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($anantnag, [
            'Anantnag ', 'Bijbehara ','AISHMUQAM','ACHABAL','BIDDER','DORU','MATTAN','QAZIGUND','SHANGAS','SRIGUFWARA','VAILLO','VERINAG'
        ]);

        // 5. Kulgam
        $kulgam = District::updateOrCreate(
            ['code' => 'JK-KUL'],
            ['name' => 'Kulgam', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kulgam, [
            'Kulgam ', 'DEVSAR ', 'DH PORA ', 'H C GAM ', 'QAIMOH ', 'YARIPORA '
        ]);

        // 6. Pulwama
        $pulwama = District::updateOrCreate(
            ['code' => 'JK-PUL'],
            ['name' => 'Pulwama', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($pulwama, [
            'Pulwama ', 'Pampore ', 'Tral ','AWANTIPORA','KAKPORA','SHADIMARG','TAHAB'
        ]);

        // 7. Shopian
        $shopian = District::updateOrCreate(
            ['code' => 'JK-SHO'],
            ['name' => 'Shopian', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($shopian, [
            'IMAMSHAIB','SHOPIAN','KEEGAM','VEHIL'
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
            'AKHNOOR','ARINA','BHALWAL','BISHNAH','CHOWKI CHOURA','DANSAL','GANDHI NAGAR','JAMMU','JOURIAN','KHOUR','MARH','MIRAN SAHIB','PURMANDAL','RS PORA','SATWARI','VIJAYPUR'
        ]);

        // 2. Samba
        $samba = District::updateOrCreate(
            ['code' => 'JK-SAM'],
            ['name' => 'Samba', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($samba, [
            'GHAGWAL','PURMANDAL','RAMGRAH','SAMBA','VIJAYPUR'
        ]);

        // 3. Kathua
        $kathua = District::updateOrCreate(
            ['code' => 'JK-KAT'],
            ['name' => 'Kathua', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kathua, [
            'BANI','BARNOTI','BASHOLI','BHADDU','BILLAWAR','HIRANAGAR','KATHUA','LAKHANPUR','MAHANPUR','MARHEEN','SALLAN'
        ]);

        // 4. Udhampur
        $udhampur = District::updateOrCreate(
            ['code' => 'JK-UDH'],
            ['name' => 'Udhampur', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($udhampur, [
            'BABEY','CHENANI','DUDU','GHORDI','JIB','KULWANTA','MAJALTA','PANCHARI','RAMNAGAR','TIKRI','UDHAMPUR'
        ]);

        // 5. Reasi
        $reasi = District::updateOrCreate(
            ['code' => 'JK-REA'],
            ['name' => 'Reasi', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($reasi, [
            'ARNAS','CHASSANA','CHINKAH','MAHORE','POUNI','REASI'
        ]);

        // 6. Rajouri
        $rajouri = District::updateOrCreate(
            ['code' => 'JK-RAJ'],
            ['name' => 'Rajouri', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($rajouri, [
            'BALJARALLAN','DANDSAR','DOONGI BRAHMANA','DRHAL','KALKOTE','KHAWAS','KOTRANKA','LOWER HATHAL','MANJAKOTE','MOGLA','NOWSHERA','PEERI','RAJOURI','SUNDER BANI','THANAMANDI'
        ]);

        // 7. Poonch
        $poonch = District::updateOrCreate(
            ['code' => 'JK-POO'],
            ['name' => 'Poonch', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($poonch, [
            'BAFLIAZ','BALKOTE','HARNI','KUNIYIAN','MANDI','MANKOTE','MENDHAR','NANGALI','POONCH','SATHRA','SURANKOTE'
        ]);

        // 8. Doda
        $doda = District::updateOrCreate(
            ['code' => 'JK-DOD'],
            ['name' => 'Doda', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($doda, [
            'ASSAR','BHADERWAH','BHALESSA','BHALLA','BHATYAS','DODA','GHAT','GUNDA','THATHRI'
        ]);

        // 9. Ramban
        $ramban = District::updateOrCreate(
            ['code' => 'JK-RAM'],
            ['name' => 'Ramban', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($ramban, [
            'BANIHAL','BATOTE','GOOL','KHARI','RAMBAN','UKHRAL'
        ]);

        // 10. Kishtwar
        $kishtwar = District::updateOrCreate(
            ['code' => 'JK-KIS'],
            ['name' => 'Kishtwar', 'state' => 'Jammu and Kashmir']
        );
        $this->createZones($kishtwar, [
            'DRABSHALLA','INDERWAL','KISHTWAR','MARWAH','NAGSENI','PADDAR'
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
            $zoneName = trim($zoneName);
            $code = strtoupper($district->code . '-Z' . str_pad($index + 1, 2, '0', STR_PAD_LEFT));

            // Remove if any duplicate found (Same name, different code)
            $duplicates = Zone::where('district_id', $district->id)
                ->where('name', $zoneName)
                ->where('code', '!=', $code)
                ->get();

            if ($duplicates->isNotEmpty()) {
                foreach ($duplicates as $duplicate) {
                    $duplicate->delete();
                    $this->command->warn("  - Deleted duplicate zone: {$duplicate->name} ({$duplicate->code})");
                }
            }
            
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