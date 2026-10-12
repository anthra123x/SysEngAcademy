import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const user = authService.user();

  const setHeaders: Record<string, string> = {};
  if (token) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }
  if (user?.email) {
    setHeaders['X-User-Email'] = user.email;
  }

  const authReq = Object.keys(setHeaders).length > 0
    ? req.clone({ setHeaders })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.clearSession(false);
      }
      return throwError(() => error);
    })
  );
};
