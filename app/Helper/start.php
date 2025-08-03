<?php

use Illuminate\Support\Number;

if (! function_exists('toCurrency')) {
    function toCurrency(int|float $amount)
    {
        return Number::currency($amount);
    }
}
