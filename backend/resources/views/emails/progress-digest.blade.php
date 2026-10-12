<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen de Progreso Académico - SysEng Academy</title>
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
    .stats-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px;
      margin: 15px 0 25px;
    }
    .stat-card {
      background: #080A10;
      border: 1px solid #1E293B;
      border-radius: 10px;
      padding: 16px 12px;
      text-align: center;
      width: 50%;
    }
    .stat-num {
      font-size: 26px;
      font-weight: 900;
      color: #00D9FF;
      font-family: 'Courier New', Courier, monospace;
    }
    .stat-num.accent-emerald {
      color: #0AE98A;
    }
    .stat-lbl {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 6px;
      font-family: 'Courier New', Courier, monospace;
    }
    .insight-card {
      background: rgba(0, 217, 255, 0.05);
      border: 1px solid rgba(0, 217, 255, 0.2);
      border-left: 4px solid #00D9FF;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .insight-title {
      color: #00D9FF;
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 4px;
      font-family: 'Courier New', Courier, monospace;
    }
    .insight-desc {
      color: #CBD5E1;
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
    }
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
      <div class="term-titlebar">
        <div class="term-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="term-title-text">syseng-analytics ~ weekly-digest // sysengacademy.site</span>
      </div>

      <div class="header">
        <div class="logo-badge">&lt;/&gt; REPORTE DE APRENDIZAJE</div>
        <h1 class="logo-title">SysEng<span>Academy</span></h1>
      </div>

      <div class="content">
        <h2 class="greeting">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        <p class="text">
          Durante esta semana has continuado afianzando tus fundamentos de programación. Aquí tienes el desglose de tu actividad y métricas clave en la plataforma:
        </p>

        <!-- Stats Grid (Email-safe table layout) -->
        <table class="stats-table">
          <tr>
            <td class="stat-card">
              <div class="stat-num">{{ $completedLessons ?? 6 }}</div>
              <div class="stat-lbl">Lecciones Superadas</div>
            </td>
            <td class="stat-card">
              <div class="stat-num accent-emerald">{{ $totalXp ?? 480 }} XP</div>
              <div class="stat-lbl">Puntos de Experiencia</div>
            </td>
          </tr>
          <tr>
            <td class="stat-card">
              <div class="stat-num" style="color: #FF9D33;">🔥 {{ $streakDays ?? 5 }} D</div>
              <div class="stat-lbl">Racha Consecutiva</div>
            </td>
            <td class="stat-card">
              <div class="stat-num">{{ $passedQuizzes ?? 2 }}</div>
              <div class="stat-lbl">Evaluaciones Aprobadas</div>
            </td>
          </tr>
        </table>

        <div class="insight-card">
          <div class="insight-title">💡 RECOMENDACIÓN PEDAGÓGICA</div>
          <p class="insight-desc">
            Se han añadido nuevos desafíos prácticos y casos de estudio. Mantener una rutina diaria de al menos 15 minutos incrementa la retención conceptual en un 40%.
          </p>
        </div>

        <a href="{{ $actionUrl ?? 'https://www.sysengacademy.site/cursos' }}" class="btn-action">
          Continuar Aprendiendo en SysEng →
        </a>
      </div>

      <div class="footer">
        © {{ date('Y') }} <a href="https://www.sysengacademy.site">SysEng Academy</a>. Formación Práctica en Ingeniería de Software.<br>
        Reporte generado y despachado automáticamente desde <strong>noreply@sysengacademy.site</strong>.
      </div>
    </div>
  </div>
</body>
</html>
