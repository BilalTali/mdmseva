<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->line('');
        $this->command->line('═══════════════════════════════════════════════════════');
        $this->command->info('Starting MDM System Database Seeding');
        $this->command->line('═══════════════════════════════════════════════════════');
        $this->command->line('');

        // CRITICAL: Order matters!
        // 1. Roles must be created first (needed for admin user)
        // 2. Districts and Zones must be created second (needed for admin user location)
        // 3. Admin user depends on both roles and districts/zones
        
        $this->call([
            RoleSeeder::class,           // Step 1: Create roles (admin, school)
            DistrictZoneSeeder::class,   // Step 2: Create districts and zones
            AdminUserSeeder::class,      // Step 3: Create admin user
            
            // Add any additional seeders below this line
            // Example: TestSchoolSeeder::class,
        ]);

        $this->command->line('');
        $this->command->line('═══════════════════════════════════════════════════════');
        $this->command->info('✓ Database seeding completed successfully!');
        $this->command->line('═══════════════════════════════════════════════════════');
        $this->command->line('');
        $this->command->info('Summary:');
        $this->command->line('- Roles: 2 (admin, school)');
        $this->command->line('- Districts: 22 (20 J&K + 2 Ladakh)');
        $this->command->line('- Zones: ~70 educational zones');
        $this->command->line('- Admin User: 1 (admin@jk-mdm.local)');
        $this->command->line('');
        $this->command->info('Next Steps:');
        $this->command->line('1. Login with admin credentials');
        $this->command->line('2. Change the default password');
        $this->command->line('3. Start managing schools!');
        $this->command->line('');
    }
}