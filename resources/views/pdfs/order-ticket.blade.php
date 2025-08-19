<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 10px;
        }
        body {
            font-family: monospace, sans-serif;
            font-size: 12px;
            width: 70mm;
            margin: 0 auto;
        }
        .title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .subtitle {
            text-align: center;
            font-size: 12px;
            margin-bottom: 10px;
        }
        .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        .items {
            width: 100%;
        }
        .items td {
            padding: 2px 0;
        }
        .right {
            text-align: right;
        }
        .center {
            text-align: center;
        }
        .total {
            font-weight: bold;
            font-size: 13px;
        }
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 11px;
        }
    </style>
</head>

<body>
    <div class="title">Ticket de Vente</div>
    <div class="subtitle">#{{ $order->reference }}</div>
    <div>Date: {{ $order->created_at->format('d/m/Y H:i') }}</div>

    <div class="line"></div>

    <table class="items">
        @foreach ($order->products as $product)
            <tr>
                <td>{{ $product->name }} x{{ $product->pivot->quantity ?? 1 }}</td>
                <td class="right">
                    {{ number_format(($product->pivot->price ?? 0) * ($product->pivot->quantity ?? 1), 0, ',', ' ') }} FCFA
                </td>
            </tr>
        @endforeach
    </table>

    <div class="line"></div>

    <table class="items">
        <tr>
            <td class="total">TOTAL</td>
            <td class="right total">{{ number_format($order->amount, 0, ',', ' ') }} FCFA</td>
        </tr>
    </table>

    <div class="line"></div>

    <div class="footer">
        Merci pour votre achat !<br>
        À bientôt 👋
    </div>
</body>

</html>