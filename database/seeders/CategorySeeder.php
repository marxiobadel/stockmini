<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $categories = [
            [
                'name' => 'Fruits et Légumes',
                'description' => 'Produits frais, locaux ou importés : pommes, tomates, carottes, etc.',
                'created_at' => $now,
                'updated_at' => $now->copy()->addMinutes(2),
            ],
            [
                'name' => 'Produits laitiers',
                'description' => 'Lait, yaourts, fromages, beurre et autres produits laitiers.',
                'created_at' => $now->copy()->addMinutes(5),
                'updated_at' => $now->copy()->addMinutes(7),
            ],
            [
                'name' => 'Viandes et Poissons',
                'description' => 'Viandes rouges, volailles, charcuterie, poissons et fruits de mer.',
                'created_at' => $now->copy()->addMinutes(10),
                'updated_at' => $now->copy()->addMinutes(12),
            ],
            [
                'name' => 'Épicerie salée',
                'description' => 'Pâtes, riz, conserves, huiles, sauces, condiments, etc.',
                'created_at' => $now->copy()->addMinutes(15),
                'updated_at' => $now->copy()->addMinutes(17),
            ],
            [
                'name' => 'Épicerie sucrée',
                'description' => 'Biscuits, confiseries, chocolats, miels, confitures et pâtisseries.',
                'created_at' => $now->copy()->addMinutes(20),
                'updated_at' => $now->copy()->addMinutes(22),
            ],
            [
                'name' => 'Boissons',
                'description' => 'Eaux, jus, sodas, thés, cafés, boissons alcoolisées.',
                'created_at' => $now->copy()->addMinutes(25),
                'updated_at' => $now->copy()->addMinutes(27),
            ],
            [
                'name' => 'Produits surgelés',
                'description' => 'Légumes, plats cuisinés, viandes, desserts et glaces surgelés.',
                'created_at' => $now->copy()->addMinutes(30),
                'updated_at' => $now->copy()->addMinutes(32),
            ],
            [
                'name' => 'Produits bio',
                'description' => "Aliments issus de l'agriculture biologique, certifiés sans produits chimiques.",
                'created_at' => $now->copy()->addMinutes(35),
                'updated_at' => $now->copy()->addMinutes(37),
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}
