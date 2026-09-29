<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡No dejes que se apague tu racha! - SysEng Academy</title>
  <style>
    body { margin: 0; padding: 0; background-color: #08090D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E2E8F0; }
    .wrapper { width: 100%; background-color: #08090D; padding: 40px 15px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #0E131F; border: 1px solid #1E293B; border-radius: 14px; overflow: hidden; }
    .header { background: #141B2D; padding: 25px 35px; border-bottom: 1px solid #1E293B; text-align: center; }
    .logo-badge { display: inline-block; background: #FF9D33; color: #030712; font-family: monospace; font-weight: 800; font-size: 13px; padding: 3px 8px; border-radius: 4px; }
    .logo-title { font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 8px 0 0; }
    .content { padding: 35px; }
    .alert-box { background: rgba(255, 71, 87, 0.12); border-left: 4px solid #FF4757; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
    .alert-title { color: #FF6B81; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
    .alert-desc { color: #CBD5E1; font-size: 13px; margin: 0; line-height: 1.5; }
    .btn-action { display: block; width: fit-content; margin: 25px auto 0; background: #FF9D33; color: #030712; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-align: center; }
    .footer { background-color: #090C14; border-top: 1px solid #161F2E; padding: 20px 35px; text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">🔥 ALERTA DE RACHA</div>
        <div class="logo-title">SysEng<span>Academy</span></div>
      </div>
      <div class="content">
        <h2 style="color: #F8FAFC; margin-top:0;">¡Hola, {{ $userName ?? 'Estudiante' }}!</h2>
        
        <div class="alert-box">
          <div class="alert-title">⚠️ Tienes actividades pendientes y tu racha está en riesgo</div>
          <p class="alert-desc">Han pasado más de 24 horas desde tu última sesión de programación. Tu racha activa de <strong>{{ $streakDays ?? 3 }} días</strong> podría reiniciarse.</p>
        </div>

        <p style="color: #94A3B8; line-height: 1.6; font-size: 14px;">
          En Ingeniería de Sistemas, la constancia diaria es la clave para dominar la programación. Solo te tomará 10 minutos resolver una lección o superar un reto rápido para salvar tu racha de hoy y no atrasarte en la materia.
        </p>

        <a href="{{ config('app.frontend_url', 'http://localhost:4200') }}/perfil?tab=streak" class="btn-action">
          Salvar Mi Racha de Hoy →
        </a>
      </div>
      <div class="footer">
        SysEng Academy · Recordatorios automáticos de actividad académica.
      </div>
    </div>
  </div>
</body>
</html>
