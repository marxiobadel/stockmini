<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Number;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Désactive la protection contre l'attribution de masse sur tous les modèles Eloquent
        Model::unguard();

        // Supprime l'enveloppe "data" par défaut dans les ressources JSON (API)
        JsonResource::withoutWrapping();

        // Définit la langue utilisée pour le formatage des nombres (ex. : séparateur décimal, milliers)
        Number::useLocale(App::getLocale());

        // Définit la devise par défaut à utiliser pour le formatage monétaire (ici : Franc CFA - XAF)
        Number::useCurrency('XAF');
    }
}
