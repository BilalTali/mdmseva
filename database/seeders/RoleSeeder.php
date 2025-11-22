<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates roles using Spatie Permission package
     * Note: Spatie's Role model only has: id, name, guard_name, created_at, updated_at
     */
    public function run(): void
    {
        $this->command->info('Seeding roles...');

        // Create Admin role
        Role::firstOrCreate(
            ['name' => 'admin'],
            ['guard_name' => 'web']
        );

        $this->command->info('✓ Admin role created/verified');

        // Create School role
        Role::firstOrCreate(
            ['name' => 'school'],
            ['guard_name' => 'web']
        );

        $this->command->info('✓ School role created/verified');

        // Create permissions if needed
        $this->createPermissions();

        $this->command->info('Roles seeding completed successfully!');
    }

    /**
     * Create permissions for the roles
     */
    private function createPermissions(): void
    {
        $this->command->info('Creating permissions...');

        $permissions = [
            // School permissions
            'view-own-data',
            'edit-own-data',
            'manage-rice-config',
            'manage-amount-config',
            'manage-daily-consumption',
            'generate-reports',
            'manage-bills',
            'submit-feedback',
            
            // Admin permissions
            'view-all-schools',
            'view-all-reports',
            'view-all-bills',
            'view-feedback',
            'manage-districts',
            'manage-zones',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web']
            );
        }

        // Assign permissions to roles
        $adminRole = Role::findByName('admin');
        $adminRole->syncPermissions([
            'view-all-schools',
            'view-all-reports',
            'view-all-bills',
            'view-feedback',
            'manage-districts',
            'manage-zones',
        ]);

        $schoolRole = Role::findByName('school');
        $schoolRole->syncPermissions([
            'view-own-data',
            'edit-own-data',
            'manage-rice-config',
            'manage-amount-config',
            'manage-daily-consumption',
            'generate-reports',
            'manage-bills',
            'submit-feedback',
        ]);

        $this->command->info('✓ Permissions created and assigned');
    }
}