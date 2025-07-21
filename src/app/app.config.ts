import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

import { authInterceptor }  from './interceptors/authInterceptor/auth.interceptor';
import { errorInterceptor } from './interceptors/errorInterceptor/error.interceptor';

import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from './services/auth/auth.service';

export function restoreSessionFactory(authService: AuthService) {
  return () => authService.restoreSession();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
      {
      provide: APP_INITIALIZER,
      useFactory: restoreSessionFactory,
      deps: [AuthService],
      multi: true
    },
     provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    importProvidersFrom(MatNativeDateModule)
  ]
};
