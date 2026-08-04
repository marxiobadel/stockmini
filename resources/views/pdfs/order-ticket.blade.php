<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 10px 0 20px;
        }
        body {
            font-family: monospace, sans-serif;
            font-size: 11px;
            width: 54mm; /*90*/
            margin: 0 auto;
        }
        .title {
            text-align: center;
            font-weight: 900;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .subtitle {
            text-align: center;
            font-size: 12px;
            margin-bottom: 15px;
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
            font-size: 14px;
        }
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 11px;
        }
    </style>
</head>

<body>
    <div class="title">
        SODAM SA (NIU : M042416719601D)
    </div>
    <div style="font-weight: bold;" class="subtitle">
        Ticket N° #{{ $order->reference }}
    </div>
    <div style="font-weight: bold;">Lieu: Nkolmesseng (Carrefour safari)</div>
    <div style="font-weight: bold;">Tel: 658287127</div>
    <div style="font-weight: bold;">Date (vente): {{ $order->created_at->format('d/m/Y H:i') }}</div>
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
