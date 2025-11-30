<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding admin user...');

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'adminbilaltali@gmail.com'],
            [
                'name' => 'MDM System Administrator',
                'password' => Hash::make('Bilal@654321'),
                'phone' => '1234567890',
                'date_of_birth' => '1990-01-01',
                'udise_code' => 'ADMIN000001',  // Changed from 'udise'
                'state' => 'Jammu and Kashmir',
                'district_id' => 1,  // Changed from 'district', using ID for Srinagar
                'zone_id' => 1,      // Changed from 'zone', using ID
                'school_name' => 'MDM Administration',
                'school_type' => 'primary',
                'institute_address' => 'Government Office, Srinagar',
                'school_pincode' => '190001',
                'status' => 'active',  // Changed from 'is_active' boolean to 'active' enum
                'email_verified_at' => now(),  // Mark as verified
            ]
        );

        // Assign admin role using Spatie's method
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
            $this->command->info('✓ Admin role assigned to user');
        } else {
            $this->command->info('✓ Admin user already has admin role');
        }

        $this->command->info('Admin user seeding completed successfully!');
        $this->command->info("Email: admin@mdm.gov.in");
        $this->command->info("Password: Admin@123");
    }
}