<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Salva tu Racha! - SysEng Academy</title>
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
      background: #FF9D33;
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
      color: #FF9D33;
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
    .alert-box {
      background: rgba(255, 107, 53, 0.08);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-left: 4px solid #FF9D33;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 22px 0;
    }
    .alert-title {
      color: #FF9D33;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 6px;
      font-family: 'Courier New', Courier, monospace;
    }
    .alert-desc {
      color: #CBD5E1;
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
    }
    .streak-container {
      background: radial-gradient(ellipse at center, rgba(255, 157, 51, 0.08) 0%, #06080E 100%);
      border: 2px dashed #FF9D33;
      border-radius: 10px;
      padding: 24px 20px;
      text-align: center;
      margin: 26px 0;
      box-shadow: 0 0 20px rgba(255, 157, 51, 0.1);
    }
    .streak-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #FF9D33;
      display: block;
      margin-bottom: 8px;
      font-family: 'Courier New', Courier, monospace;
    }
    .streak-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 42px;
      font-weight: 900;
      color: #FFFFFF;
      display: block;
      text-shadow: 0 0 14px rgba(255, 157, 51, 0.4);
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
    .meta-val { color: #FF9D33; font-weight: 700; }
    .btn-action {
      display: block;
      background: #FF9D33;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 8px;
      text-align: center;
      margin: 25px auto 10px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(255, 157, 51, 0.25);
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
        <span class="term-title-text">syseng-gamification ~ streak-daemon // sysengacademy.site</span>
      </div>

      <div class="header">
        <div class="logo-badge">🔥 ALERTA DE RACHA ACADÉMICA</div>
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
      </div>

      <div class="content">
        <h2 class="greeting">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        <p class="text">
          En Ingeniería de Software, la constancia diaria es el factor determinante para dominar la programación y la arquitectura de sistemas. Tu dedicación ha construido una gran racha:
        </p>

        <div class="streak-container">
          <span class="streak-label">// RACHA ACTUAL EN RIESGO //</span>
          <span class="streak-value">🔥 {{ $streakDays ?? 3 }} DÍAS</span>
        </div>

        <div class="alert-box">
          <div class="alert-title">⚠️ INACTIVIDAD DETECTADA EN LAS ÚLTIMAS 24 HORAS</div>
          <p class="alert-desc">
            Si no completas al menos una lección o evaluación antes de la medianoche, tu racha activa volverá a 0. ¡No dejes que se apague!
          </p>
        </div>

        <div class="meta-box">
          <div class="meta-item">
            <span class="meta-key">[ESTADO]</span>
            <span class="meta-val">Racha en Peligro de Reinicio</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[TIEMPO REQUERIDO]</span>
            <span class="meta-val">Menos de 10 minutos</span>
          </div>
          <div class="meta-item">
            <span class="meta-key">[OBJETIVO HOY]</span>
            <span class="meta-val">+10 XP para Asegurar Racha</span>
          </div>
        </div>

        <p class="text" style="font-size: 13px; color: #94A3B8;">
          Ingresa ahora mismo, resuelve un reto rápido de tu curso activo y mantén tu posición en el cuadro de honor de la academia.
        </p>

        <a href="{{ $actionUrl ?? 'https://www.sysengacademy.site/cursos' }}" class="btn-action">
          Salvar Mi Racha de Hoy →
        </a>
      </div>

      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Recordatorio automatizado enviado desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
