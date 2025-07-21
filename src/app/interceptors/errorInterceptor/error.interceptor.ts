//Purpose: Catch HTTP errors (like 401 Unauthorized), log them, redirect user, etc.

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      console.error('HTTP Error:', err);
      if (err.status === 401) {
        const protectedRoutes = ['/dashboard', '/profile', '/projects', '/echarts-summary', '/chartjs-summary', '/highcharts-summary']; 
        if (protectedRoutes.some(r => router.url.startsWith(r))) {
        router.navigate([''], {
          // queryParams: { message: 'Session expired. Please log in again.' }
        });
      }
    }

      return throwError(() => err);
    })
  );
};
