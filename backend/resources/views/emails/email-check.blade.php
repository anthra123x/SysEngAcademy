<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico de Recepción de Correo - SysEng Academy</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06080E;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #06080E;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #0C101A;
      border: 1px solid #1E293B;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
    }
    .term-titlebar {
      background: #080A10;
      padding: 11px 18px;
      border-bottom: 1px solid #1A2234;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .term-dots {
      display: inline-block;
      white-space: nowrap;
    }
    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }
    .term-title-text {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #64748B;
      letter-spacing: 0.5px;
    }
    .header {
      background: linear-gradient(180deg, #101626 0%, #0C101A 100%);
      padding: 30px 35px 20px;
      text-align: center;
      border-bottom: 1px solid #1A2234;
    }
    .logo-badge {
      display: inline-block;
      background: #0AE98A;
      color: #030712;
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-title span {
      color: #0AE98A;
    }
    .content {
      padding: 35px;
    }
    .greeting {
      font-size: 19px;
      font-weight: 700;
      color: #F8FAFC;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .text {
      font-size: 14px;
      line-height: 1.65;
      color: #94A3B8;
      margin-bottom: 22px;
    }
    .status-panel {
      background: #080A10;
      border: 1px solid #1E293B;
      border-left: 4px solid #0AE98A;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 22px 0;
    }
    .status-panel-title {
      color: #0AE98A;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 6px;
      font-family: 'Courier New', Courier, monospace;
    }
    .status-panel-desc {
      color: #CBD5E1;
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
    }
    .code-box {
      background-color: #06080E;
      border: 1px dashed #00D9FF;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .code-label {
      font-size: 11px;
      color: #00D9FF;
      font-family: 'Courier New', Courier, monospace;
      display: block;
      margin-bottom: 6px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .code-val {
      font-family: 'Courier New', Courier, monospace;
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 8px;
    }
    .meta-box {
      background-color: #0A0D16;
      border: 1px solid #1A2234;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 12px;
      color: #94A3B8;
      margin-bottom: 25px;
      line-height: 1.6;
      font-family: 'Courier New', Courier, monospace;
    }
    .meta-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .meta-item:last-child {
      margin-bottom: 0;
    }
    .meta-key { color: #64748B; }
    .meta-val { color: #0AE98A; font-weight: 700; }
    .btn-action {
      display: block;
      background: #0AE98A;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 8px;
      text-align: center;
      margin: 25px auto 10px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(10, 233, 138, 0.25);
    }
    .footer {
      background-color: #080A10;
      border-top: 1px solid #1A2234;
      padding: 24px 35px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.6;
    }
    .footer a {
      color: #00D9FF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="term-titlebar">
        <div class="term-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="term-title-text">syseng-diagnostics ~ ping-pong // mailbox-validation</span>
      </div>

      <div class="header">
        <img 
          src="https://www.sysengacademy.site/icons/icon-192x192.png" 
          alt="SysEng Academy" 
          style="width: 50px; height: 50px; border-radius: 12px; display: inline-block; margin-bottom: 10px; border: 1px solid rgba(10, 233, 138, 0.35);"
        />
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
        <div class="logo-badge" style="margin-top: 8px;">VERIFICACIÓN DE BUZÓN</div>
      </div>

      <div class="content">
        <h2 class="greeting">Comprobación de Recepción Exitosa</h2>
        <p class="text">
          Hola, <strong>{{ $userName ?? 'Usuario' }}</strong>. Este correo confirma que tu buzón <code>{{ $userEmail }}</code> recibe correctamente las comunicaciones, credenciales y alertas académicas de <strong>SysEng Academy</strong>.
        </p>

        <div class="status-panel">
          <div class="status-panel-title">✓ PRUEBA DE RECEPCIÓN COMPLETADA</div>
          <p class="status-panel-desc">
            La conexión entre el servidor de despacho de la academia (<code>sysengacademy.site</code>) y tu proveedor de correo está funcionando a la perfección.
          </p>
        </div>

        @if(!empty($checkCode))
          <div class="code-box">
            <span class="code-label">// CÓDIGO DE VALIDACIÓN DE BUZÓN //</span>
            <span class="code-val">{{ $checkCode }}</span>
          </div>
        @endif

        <div class="meta-box">
          <div class="meta-item">
            <span class="meta-key">[DESPACHO]</span>
            <span class="meta-val">{{ date('Y-m-d H:i:s') }} UTC</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[REMITENTE]</span>
            <span class="meta-val">noreply@sysengacademy.site</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[CANAL]</span>
            <span class="meta-val">Resend REST API (HTTPS TLS 1.3)</span>
          </div>
        </div>

        <a href="{{ $actionUrl ?? 'https://www.sysengacademy.site/perfil' }}" class="btn-action">
          Regresar a Mi Perfil →
        </a>
      </div>

      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Prueba de conectividad iniciada desde la plataforma web.
      </div>
    </div>
  </div>
</body>
</html>
