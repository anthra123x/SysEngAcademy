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
    .status-card {
      background-color: #06080E;
      border: 1px solid #0AE98A;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .status-title {
      color: #0AE98A;
      font-weight: 700;
      font-size: 16px;
      margin: 0 0 8px 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .status-desc {
      color: #94A3B8;
      font-size: 13px;
      margin: 0;
    }
    .action-btn {
      display: block;
      background: #00D9FF;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      padding: 14px 20px;
      border-radius: 8px;
      margin: 28px 0 10px;
      letter-spacing: 0.5px;
    }
    .footer {
      background-color: #080A10;
      padding: 24px 35px;
      border-top: 1px solid #1E293B;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">&lt;/&gt; SYSENG ACADEMY</div>
        <h1 class="logo-title">Seguridad de la <span>Cuenta</span></h1>
      </div>
      <div class="content">
        <h2 class="greeting">Hola, {{ $userName }}</h2>
        <p class="text">
          Te confirmamos que la contraseña de tu cuenta en <strong>SysEng Academy</strong> (asociada al correo <code>{{ $userEmail }}</code>) ha sido actualizada satisfactoriamente.
        </p>
        <div class="status-card">
          <p class="status-title">✓ CONTRASEÑA ACTUALIZADA</p>
          <p class="status-desc">Esta modificación se realizó exitosamente desde la plataforma.</p>
        </div>
        <p class="text">
          Si fuiste tú quien realizó este cambio, puedes ignorar este mensaje. Si <strong>NO</strong> solicitaste este cambio, te recomendamos restablecer tu acceso de inmediato para proteger tu expediente académico.
        </p>
        <a href="{{ $actionUrl ?? 'https://frontend-nine-rho-xxvp7yeoqa.vercel.app/login' }}" class="action-btn">
          Iniciar Sesión en SysEng Academy →
        </a>
      </div>
      <div class="footer">
        © {{ date('Y') }} SysEng Academy. Todos los derechos reservados.<br>
        Mensaje transaccional enviado desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
