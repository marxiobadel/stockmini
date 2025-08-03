<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: monospace;
            font-size: 12px;
        }

        .title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
    </style>
</head>

<body>
    <div class="title">Ticket de Vente #{{ $order->reference }}</div>
    Date: {{ $order->created_at->format('d/m/Y H:i') }}

    <div class="line"></div>

    @foreach ($order->products as $product)
        {{ $product->name }}
        x{{ $product->pivot->quantity ?? 1 }}
        {{ number_format($product->pivot->price, 0, ',', ' ') }} FCFA
        <br>
    @endforeach

    <div class="line"></div>
    TOTAL: {{ number_format($order->amount, 0, ',', ' ') }} FCFA
</body>

</html>
