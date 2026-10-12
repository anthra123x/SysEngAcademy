<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - SysEng Academy</title>
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
      background: #00D9FF;
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
      color: #00D9FF;
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
    .code-container {
      background: radial-gradient(ellipse at center, rgba(10, 233, 138, 0.05) 0%, #06080E 100%);
      border: 2px dashed #0AE98A;
      border-radius: 10px;
      padding: 24px 20px;
      text-align: center;
      margin: 28px 0;
      box-shadow: 0 0 20px rgba(10, 233, 138, 0.08);
    }
    .code-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0AE98A;
      display: block;
      margin-bottom: 10px;
      font-family: 'Courier New', Courier, monospace;
    }
    .code-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #0AE98A;
      display: block;
      text-shadow: 0 0 12px rgba(10, 233, 138, 0.4);
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
    .meta-val { color: #00D9FF; font-weight: 700; }
    .btn-action {
      display: block;
      background: #00D9FF;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 8px;
      text-align: center;
      margin: 25px auto 10px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(0, 217, 255, 0.25);
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
      <!-- Top simulated terminal bar -->
      <div class="term-titlebar">
        <div class="term-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="term-title-text">syseng-auth ~ verification-daemon // sysengacademy.site</span>
      </div>

      <!-- Header with branding -->
      <div class="header">
        <div class="logo-badge">&lt;/&gt; CREDENCIALES ACADÉMICAS</div>
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
      </div>

      <!-- Main Content -->
      <div class="content">
        <h2 class="greeting">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        <p class="text">
          Has recibido este mensaje para validar tu cuenta o autorizar una operación segura en la plataforma de <strong>SysEng Academy</strong>.
          Por favor utiliza el siguiente código de 6 dígitos para completar tu solicitud:
        </p>

        <!-- Verification Code Display -->
        <div class="code-container">
          <span class="code-label">// CÓDIGO DE VERIFICACIÓN //</span>
          <span class="code-value">{{ $verifyCode }}</span>
        </div>

        <!-- Telemetry & Security Metadata -->
        <div class="meta-box">
          <div class="meta-item">
            <span class="meta-key">[ESTADO]</span>
            <span class="meta-val">Código Activo &amp; Generado</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[VIGENCIA]</span>
            <span class="meta-val">Expira en 30 minutos</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[SERVIDOR]</span>
            <span class="meta-val">noreply@sysengacademy.site (SPF/DKIM OK)</span>
          </div>
        </div>

        <p class="text" style="font-size: 12px; color: #64748B; margin-bottom: 20px;">
          🛡️ <strong>Aviso de Privacidad:</strong> Si tú no solicitaste este código, tu cuenta permanece protegida. Puedes ignorar este mensaje con total seguridad.
        </p>

        <a href="{{ $verifyUrl ?? 'https://www.sysengacademy.site/login' }}" class="btn-action">
          Acceder a SysEng Academy →
        </a>
      </div>

      <!-- Footer -->
      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Mensaje transaccional enviado automáticamente desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
