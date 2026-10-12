<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Language" content="es">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Cuenta - SysEng Academy</title>
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
      padding: 36px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #0C101A;
      border: 1px solid #1E293B;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
    }
    .header {
      background: linear-gradient(180deg, #101626 0%, #0C101A 100%);
      padding: 32px 30px 24px;
      text-align: center;
      border-bottom: 1px solid #1A2234;
    }
    .logo-img {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: inline-block;
      margin-bottom: 12px;
      border: 1px solid rgba(0, 217, 255, 0.35);
      box-shadow: 0 4px 16px rgba(0, 217, 255, 0.2);
    }
    .logo-title {
      font-size: 23px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-title span {
      color: #00D9FF;
    }
    .badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #0AE98A;
      background: rgba(10, 233, 138, 0.1);
      border: 1px solid rgba(10, 233, 138, 0.25);
      padding: 3px 10px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px 30px;
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
    .btn-container {
      text-align: center;
      margin: 26px 0 20px;
    }
    .btn-action {
      display: inline-block;
      background: #00D9FF;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 10px;
      text-align: center;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 18px rgba(0, 217, 255, 0.35);
    }
    .subtext {
      font-size: 12px;
      color: #64748B;
      text-align: center;
      margin-top: 8px;
      margin-bottom: 24px;
    }
    .divider {
      border: 0;
      height: 1px;
      background: #1A2234;
      margin: 24px 0;
    }
    .code-container {
      background: radial-gradient(ellipse at center, rgba(10, 233, 138, 0.06) 0%, #06080E 100%);
      border: 2px dashed #0AE98A;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 18px 0;
      box-shadow: 0 0 24px rgba(10, 233, 138, 0.1);
    }
    .code-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0AE98A;
      display: block;
      margin-bottom: 8px;
      font-family: 'Courier New', Courier, monospace;
    }
    .code-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #0AE98A;
      display: block;
      text-shadow: 0 0 12px rgba(10, 233, 138, 0.45);
    }
    .info-box {
      background-color: #0A0D16;
      border: 1px solid #1A2234;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #94A3B8;
      margin-top: 20px;
      line-height: 1.6;
    }
    .footer {
      background-color: #080A10;
      border-top: 1px solid #1A2234;
      padding: 22px 30px;
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
      <!-- Header con Logo Oficial -->
      <div class="header">
        <img 
          src="https://www.sysengacademy.site/icons/icon-192x192.png" 
          alt="SysEng Academy Logo" 
          class="logo-img"
        />
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
        <div class="badge">Acceso Seguro de Estudiante</div>
      </div>

      <!-- Contenido Principal -->
      <div class="content">
        <h2 class="greeting">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        <p class="text">
          Has recibido este mensaje para activar tu cuenta de estudiante o confirmar tu acceso en <strong>SysEng Academy</strong>.
        </p>

        <!-- Opción 1: Botón de Un Clic Directo al Perfil -->
        <div class="btn-container">
          <a href="{{ $verifyUrl ?? 'https://www.sysengacademy.site/perfil' }}" class="btn-action">
            {{ $actionText ?? 'Verificar y Acceder a mi Perfil →' }}
          </a>
        </div>
        <p class="subtext">
          Al hacer clic, tu cuenta quedará verificada al instante y entrarás directamente a tu perfil.
        </p>

        <hr class="divider">

        <!-- Opción 2: Código Manual de 6 Dígitos -->
        <p class="text" style="margin-bottom: 8px; text-align: center;">
          O si prefieres, introduce este código de verificación en la página de registro:
        </p>
        <div class="code-container">
          <span class="code-label">CÓDIGO DE ACTIVACIÓN</span>
          <span class="code-value">{{ $verifyCode }}</span>
        </div>

        <div class="info-box">
          ⏱️ <strong>Vigencia:</strong> Este código y enlace expirarán en 30 minutos por seguridad.<br>
          🛡️ <strong>Aviso de Privacidad:</strong> Si no reconoces este registro, puedes ignorar este correo; tu información permanece protegida.
        </div>
      </div>

      <!-- Pie de página -->
      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Enviado de forma segura desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
