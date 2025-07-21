import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  } 
  else {
 
 // Optional: Custom message
    const queryParams = { message: 'Please login to access this page.' };

    // Return a redirect tree instead of calling router.navigate
    return router.createUrlTree(['/login'], { queryParams });
  }
};
