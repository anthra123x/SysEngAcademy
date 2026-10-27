import { Routes } from '@angular/router';
import { authGuard, guestGuard, teacherGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: {
      title: 'SysEng Academy — Aprende Programación e Ingeniería de Software',
      description: 'Plataforma interactiva con rutas de aprendizaje, cursos prácticos con editores de código en tiempo real, retos y asistente IA.',
    }
  },
  {
    path: 'rutas',
    loadComponent: () => import('./features/learning-paths/learning-paths.component').then(m => m.LearningPathsComponent),
    data: {
      title: 'Rutas de Aprendizaje Profesional — SysEng Academy',
      description: 'Explora rutas guiadas paso a paso desde algoritmos y backend hasta desarrollo web full-stack y arquitectura de sistemas.',
    }
  },
  {
    path: 'rutas/:slug',
    loadComponent: () => import('./features/learning-paths/learning-path-detail/learning-path-detail.component').then(m => m.LearningPathDetailComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent),
    data: {
      title: 'Catálogo de Cursos Interactivos — SysEng Academy',
      description: 'Cursos prácticos de ingeniería de software con laboratorios interactivos, lecciones multimedia y proyectos guiados.',
    }
  },
  {
    path: 'cursos/:slug',
    loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
  },
  {
    path: 'codelab',
    loadComponent: () => import('./features/codelab/codelab.component').then(m => m.CodelabComponent),
    canActivate: [authGuard],
    data: {
      title: 'CodeLab — Retos de Programación y Sandbox en Vivo | SysEng Academy',
      description: 'Pon a prueba tus habilidades de código con retos en tiempo real, validación automatizada y ranking global.',
    }
  },
  {
    path: 'codelab/:slug',
    loadComponent: () => import('./features/codelab/codelab-solver/codelab-solver.component').then(m => m.CodelabSolverComponent),
    canActivate: [authGuard]
  },
  {
    path: 'arena',
    redirectTo: 'codelab',
    pathMatch: 'full'
  },
  {
    path: 'arena/:slug',
    redirectTo: 'codelab/:slug'
  },
  {
    path: 'cursos/:slug/leccion/:lessonSlug',
    loadComponent: () => import('./features/courses/lesson-player/lesson-player.component').then(m => m.LessonPlayerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'asistente',
    redirectTo: '/?openByte=true',
    pathMatch: 'full'
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    data: {
      title: 'Mi Perfil de Aprendizaje — SysEng Academy',
      description: 'Consulta tus rachas de estudio, certificados, retos completados y estadísticas en SysEng Academy.',
    }
  },
  {
    path: 'clan',
    redirectTo: 'cursos',
    pathMatch: 'full'
  },
  {
    path: 'docente',
    loadComponent: () => import('./features/teacher/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
    canActivate: [teacherGuard]
  },
  {
    path: 'admin',
    redirectTo: 'docente',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    data: {
      title: 'Iniciar Sesión — SysEng Academy',
      description: 'Accede a tu cuenta de estudiante en SysEng Academy y continúa tu ruta de aprendizaje de software.',
    }
  },
  {
    path: 'auth/registro',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    data: {
      title: 'Crear Cuenta Gratis — SysEng Academy',
      description: 'Regístrate en SysEng Academy y empieza a aprender ingeniería de software de manera interactiva y gratuita.',
    }
  },
  {
    path: 'auth/verificar',
    loadComponent: () => import('./features/auth/verify/verify.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'auth/callback',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'auth/verify',
    redirectTo: 'auth/verificar'
  },
  { path: '**', redirectTo: '' }
];
