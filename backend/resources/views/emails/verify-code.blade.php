<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta en SysEng Academy</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #08090D;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #08090D;
      padding: 40px 15px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #0E131F;
      border: 1px solid #1E293B;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(180deg, #141B2D 0%, #0E131F 100%);
      padding: 30px 35px 20px;
      border-bottom: 1px solid #1E293B;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      background: #00D9FF;
      color: #030712;
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
      font-size: 14px;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .logo-title {
      font-size: 22px;
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
      font-size: 18px;
      font-weight: 700;
      color: #F8FAFC;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .text {
      font-size: 14px;
      line-height: 1.65;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .code-container {
      background-color: #06080E;
      border: 2px dashed #0AE98A;
      border-radius: 10px;
      padding: 24px 20px;
      text-align: center;
      margin: 28px 0;
      box-shadow: inset 0 0 16px rgba(10, 233, 138, 0.08);
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
    .security-note {
      background-color: #121826;
      border-left: 3px solid #00D9FF;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #94A3B8;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    .btn-action {
      display: block;
      width: fit-content;
      margin: 25px auto 10px;
      background: #00D9FF;
      color: #030712;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
      text-align: center;
    }
    .footer {
      background-color: #090C14;
      border-top: 1px solid #161F2E;
      padding: 20px 35px;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">&lt;/&gt;</div>
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
      </div>

      <div class="content">
        <h2 class="greeting">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        <p class="text">
          Bienvenido a <strong>SysEng Academy</strong>. Tu cuenta ha sido registrada con éxito.
          Para validar tu correo institucional y activar tu acceso a las clases, laboratorios interactivos y evaluación de nivel, ingresa el siguiente código de activación en la plataforma:
        </p>

        <div class="code-container">
          <span class="code-label">// CÓDIGO DE VERIFICACIÓN //</span>
          <span class="code-value">{{ $verifyCode }}</span>
        </div>

        <div class="security-note">
          ⏱ <strong>Vigencia:</strong> Este código expira en 24 horas.<br>
          🛡️ <strong>Seguridad:</strong> Si tú no solicitaste crear esta cuenta, puedes desestimar este mensaje con total seguridad.
        </div>

        <a href="{{ $verifyUrl ?? config('app.frontend_url', 'http://localhost:4200') }}/auth/registro?verifyEmail={{ urlencode($userEmail ?? '') }}" class="btn-action">
          Confirmar y Activar Cuenta →
        </a>
      </div>

      <div class="footer">
        SysEng Academy · Plataforma de Formación Práctica en Ingeniería de Software<br>
        <em>"A programar se aprende programando."</em>
      </div>
    </div>
  </div>
</body>
</html>
