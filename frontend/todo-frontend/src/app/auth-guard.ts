import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const AuthGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Allow during SSR (very important)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  try {
    // Safe localStorage access
    const token = localStorage.getItem('token');

    if (!token) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Decode JWT & Check Expiry
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.exp) {
      // Invalid token structure
      localStorage.removeItem('token');
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const expiryTime = payload.exp * 1000; // convert to milliseconds
    const currentTime = new Date().getTime();

    // Expired Token Check
    if (expiryTime < currentTime) {
      localStorage.removeItem('token');

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Token valid
    return true;

  } catch (error) {

    //
    console.error('AuthGuard Error:', error);
    localStorage.removeItem('token');

    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
};