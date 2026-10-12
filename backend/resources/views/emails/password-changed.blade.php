<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seguridad de tu cuenta en SysEng Academy</title>
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
    .status-card {
      background-color: #080A10;
      border: 1px solid #0AE98A;
      border-left: 4px solid #0AE98A;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .status-title {
      color: #0AE98A;
      font-weight: 700;
      font-size: 14px;
      margin: 0 0 6px 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .status-desc {
      color: #CBD5E1;
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
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
    .action-btn {
      display: block;
      background: #00D9FF;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      padding: 13px 28px;
      border-radius: 8px;
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
      <div class="term-titlebar">
        <div class="term-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="term-title-text">syseng-security ~ passwd-daemon // sysengacademy.site</span>
      </div>

      <div class="header">
        <div class="logo-badge">&lt;/&gt; ALERTA DE SEGURIDAD</div>
        <h1 class="logo-title">Seguridad de la <span>Cuenta</span></h1>
      </div>

      <div class="content">
        <h2 class="greeting">Hola, {{ $userName ?? 'Estudiante' }}</h2>
        <p class="text">
          Te confirmamos que la contraseña de tu cuenta en <strong>SysEng Academy</strong> (<code>{{ $userEmail }}</code>) ha sido actualizada satisfactoriamente.
        </p>

        <div class="status-card">
          <p class="status-title">✓ CONTRASEÑA ACTUALIZADA EXITOSAMENTE</p>
          <p class="status-desc">El cambio fue validado y persistido de manera segura con cifrado bcrypt.</p>
        </div>

        <div class="meta-box">
          <div class="meta-item">
            <span class="meta-key">[ACCIÓN]</span>
            <span class="meta-val">Actualización de Credencial</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[ESTADO]</span>
            <span class="meta-val">Sesiones Previas Invalidadas</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[ORIGEN]</span>
            <span class="meta-val">sysengacademy.site</span>
          </div>
        </div>

        <p class="text" style="font-size: 12px; color: #64748B; margin-bottom: 20px;">
          🛡️ <strong>¿No fuiste tú?</strong> Si no realizaste esta modificación, te recomendamos solicitar un restablecimiento urgente desde la página de inicio de sesión para salvaguardar tu perfil.
        </p>

        <a href="{{ $actionUrl ?? 'https://www.sysengacademy.site/login' }}" class="action-btn">
          Iniciar Sesión con Nueva Contraseña →
        </a>
      </div>

      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Notificación de seguridad despachada desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
