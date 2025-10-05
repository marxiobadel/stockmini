<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 20px 0;
        }
        body {
            font-family: monospace, sans-serif;
            font-size: 15px;
            width: 90mm;
            margin: 0 auto;
        }
        .title {
            text-align: center;
            font-weight: 900;
            font-size: 20px;
            margin-bottom: 5px;
        }
        .subtitle {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        .items {
            width: 100%;
        }
        .items td {
            padding: 4px 0;
        }
        .right {
            text-align: right;
        }
        .center {
            text-align: center;
        }
        .total {
            font-weight: bold;
            font-size: 21px;
        }
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 15px;
        }
    </style>
</head>

<body>
    <div class="title">
        ETS Hadjorê (691299331 / 670316489)
    </div>
    <div style="font-weight: bold;" class="subtitle">
        Ticket N° #{{ $order->reference }}
    </div>
    <div style="font-weight: bold;">Date: {{ $order->created_at->format('d/m/Y H:i') }}</div>
    @if ($order->customer)
        <div style="font-weight: bold;">Client: {{ $order->customer->name }}</div>
    @endif
    <div class="line"></div>

    <table class="items" cellpadding="10">
        @foreach ($order->products as $product)
            <tr>
                <td style="font-weight: bold; text-transform: uppercase;">
                    {{ $product->name }} x{{ $product->pivot->quantity ?? 1 }}
                </td>
                <td class="right" style="font-weight: bold;">
                    {{ number_format(($product->pivot->price ?? 0) * ($product->pivot->quantity ?? 1), 0, ',', ' ') }} F
                </td>
            </tr>
        @endforeach
    </table>

    <div class="line"></div>

    <table class="items">
        <tr>
            <td class="total">TOTAL</td>
            <td class="right total">
                {{ number_format($order->amount, 0, ',', ' ') }} FCFA
            </td>
        </tr>
        <tr>
            <td class="total">TOTAL PAYE</td>
            <td class="right total">
                {{ number_format($order->total_paid, 0, ',', ' ') }} FCFA
            </td>
        </tr>
        <tr>
            <td class="total">RESTE</td>
            <td class="right total">
                {{ number_format($order->remaining, 0, ',', ' ') }} FCFA
            </td>
        </tr>
    </table>

    <div class="line"></div>

    <div class="footer">
        Merci pour votre achat.<br>
        À bientôt !
    </div>
</body>

</html>