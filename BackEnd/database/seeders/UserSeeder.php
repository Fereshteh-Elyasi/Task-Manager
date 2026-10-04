<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'سارا احمدی',
                'email' => 'sara@taskline.dev',
                'password' => '1234',
                'color' => '#6C4CF1',
                'role' => 'admin',
            ],
            [
                'name' => 'رضا کریمی',
                'email' => 'reza@taskline.dev',
                'password' => '1234',
                'color' => '#2FAE7C',
                'role' => 'member',
            ],
            [
                'name' => 'نگار محمدی',
                'email' => 'negar@taskline.dev',
                'password' => '1234',
                'color' => '#FF6B4A',
                'role' => 'member',
            ],
            [
                'name' => 'امیر رستمی',
                'email' => 'amir@taskline.dev',
                'password' => '1234',
                'color' => '#E0A419',
                'role' => 'guest',
            ],
            [
                'name' => 'فرشته الیاسی',
                'email' => 'fereshteh@taskline.dev',
                'password' => '1234',
                'color' => '#EC4899',
                'role' => 'member',
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }
    }
}
