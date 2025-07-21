import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getMemoryToken();

  // Clone the request with token if available
  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If token expired and refresh cookie exists
      if (error.status === 401 && !req.url.includes('/refresh-token')) {
        return auth.refreshAccessToken().pipe(
          switchMap(res => {
            auth.setMemoryToken(res.accessToken);
            const retriedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              }
            });
            return next(retriedReq); // Retry original request with new token
          }),
          catchError(err => {
            console.error('Refresh token failed, logging out.');
            auth.logout();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
