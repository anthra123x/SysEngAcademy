import { Routes } from '@angular/router';
import { authGuard, guestGuard, teacherGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'rutas',
    loadComponent: () => import('./features/learning-paths/learning-paths.component').then(m => m.LearningPathsComponent)
  },
  {
    path: 'rutas/:slug',
    loadComponent: () => import('./features/learning-paths/learning-path-detail/learning-path-detail.component').then(m => m.LearningPathDetailComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent)
  },
  {
    path: 'cursos/:slug',
    loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
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
    canActivate: [authGuard]
  },
  {
    path: 'clan',
    loadComponent: () => import('./features/clan/clan.component').then(m => m.ClanComponent),
    canActivate: [authGuard]
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
    canActivate: [guestGuard]
  },
  {
    path: 'auth/registro',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  { path: '**', redirectTo: '' }
];
