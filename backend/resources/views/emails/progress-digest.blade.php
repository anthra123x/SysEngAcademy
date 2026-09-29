<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resumen de Progreso - SysEng Academy</title>
  <style>
    body { margin: 0; padding: 0; background-color: #08090D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E2E8F0; }
    .wrapper { width: 100%; background-color: #08090D; padding: 40px 15px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #0E131F; border: 1px solid #1E293B; border-radius: 14px; overflow: hidden; }
    .header { background: #141B2D; padding: 25px 35px; border-bottom: 1px solid #1E293B; text-align: center; }
    .logo-badge { display: inline-block; background: #00D9FF; color: #030712; font-family: monospace; font-weight: 800; font-size: 13px; padding: 3px 8px; border-radius: 4px; }
    .logo-title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 8px 0 0; }
    .logo-title span { color: #00D9FF; }
    .content { padding: 35px; }
    .streak-badge { background: rgba(255, 136, 0, 0.15); border: 1px solid rgba(255, 136, 0, 0.4); color: #FF9D33; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 13px; display: inline-block; margin-bottom: 18px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 24px 0; }
    .stat-card { background: #06080E; border: 1px solid #1E293B; border-radius: 10px; padding: 16px; text-align: center; }
    .stat-num { font-size: 26px; font-weight: 800; color: #00D9FF; font-family: monospace; }
    .stat-lbl { font-size: 11px; color: #94A3B8; text-transform: uppercase; margin-top: 4px; }
    .btn-action { display: block; width: fit-content; margin: 25px auto 0; background: #0AE98A; color: #030712; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-align: center; }
    .footer { background-color: #090C14; border-top: 1px solid #161F2E; padding: 20px 35px; text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">&lt;/&gt;</div>
        <div class="logo-title">SysEng<span>Academy</span></div>
      </div>
      <div class="content">
        <div class="streak-badge">🔥 Racha de estudio: {{ $streakDays ?? 5 }} días</div>
        <h2 style="color: #F8FAFC; margin-top:0;">Tu Resumen de Avance Académico</h2>
        <p style="color: #94A3B8; line-height: 1.6; font-size: 14px;">
          ¡Hola, {{ $userName ?? 'Estudiante' }}! Durante esta semana has mantenido tu ritmo en los retos y módulos de clase. Aquí tienes tu estado actual en la plataforma:
        </p>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">{{ $completedLessons ?? 6 }}</div>
            <div class="stat-lbl">Lecciones Superadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color: #0AE98A;">{{ $totalXp ?? 480 }} XP</div>
            <div class="stat-lbl">Puntos de Experiencia</div>
          </div>
        </div>

        <p style="color: #94A3B8; line-height: 1.6; font-size: 14px;">
          Tu docente ha publicado nuevas actividades de práctica y desafíos en el temario. Continúa avanzando hoy para mantener tu racha activa y subir de nivel.
        </p>

        <a href="{{ config('app.frontend_url', 'http://localhost:4200') }}/cursos" class="btn-action">
          Continuar Aprendiendo →
        </a>
      </div>
      <div class="footer">
        SysEng Academy · Seguimiento continuo de aprendizaje en ingeniería de software.
      </div>
    </div>
  </div>
</body>
</html>
