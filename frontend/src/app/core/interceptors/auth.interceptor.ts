import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const user = authService.user();

  const headersConfig: Record<string, string> = {};
  if (token) {
    headersConfig['Authorization'] = `Bearer ${token}`;
  }
  if (user) {
    if (user.email) headersConfig['X-User-Email'] = user.email;
    if (user.name) headersConfig['X-User-Name'] = encodeURIComponent(user.name);
  }

  const authReq = Object.keys(headersConfig).length > 0
    ? req.clone({ setHeaders: headersConfig })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !token?.startsWith('syseng_jwt_')) {
        authService.clearSession(false);
      }
      return throwError(() => error);
    })
  );
};
