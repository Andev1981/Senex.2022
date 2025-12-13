<h2>Fallo en Emisión de Boleta Electrónica</h2>
<p>Se ha producido un error persistente al intentar emitir el documento tributario en el SII.</p>

<table style="width: 100%; border-collapse: collapse;">
    <tr>
        <td><strong>ID Interno:</strong></td>
        <td>#{{ $invoice->id }}</td>
    </tr>
    <tr>
        <td><strong>Paciente:</strong></td>
        <td>{{ $patientName }}</td>
    </tr>
    <tr>
        <td><strong>Monto Total:</strong></td>
        <td>${{ $amount_clp }}</td>
    </tr>
    <tr>
        <td><strong>Causa del Error:</strong></td>
        <td style="color: red;">{{ $error }}</td>
    </tr>
</table>

<p><strong>Acción requerida:</strong> Por favor, ingresa al panel administrativo para reintentar el envío manualmente o revisar la configuración del CAF/Certificado Digital.</p>

<a href="{{ url('/admin/invoices/'.$invoice->id) }}" 
   style="background: #e3342f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
   Ver Detalle de Factura
</a>