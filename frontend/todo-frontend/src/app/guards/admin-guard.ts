import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // SSR Safety — allow render on server
  if (!isPlatformBrowser(platformId)) {
    return true;
    //  return router.createUrlTree(['/login']);
  }

  try {

    const token = localStorage.getItem('token');

    // No token → go login
    if (!token) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Decode JWT safely
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Expiry check
    if (!payload.exp) {
      localStorage.removeItem('token');
      localStorage.clear();
      return router.createUrlTree(['/login']);
    }

    const expiry = payload.exp * 1000;
    if (Date.now() > expiry) {
      localStorage.removeItem('token');
      localStorage.clear();
      return router.createUrlTree(['/login']);
    }

    // Role check (THIS is where it goes properly)
    const roles = payload.role || payload.roles;

    if (!roles || !roles.includes('ROLE_ADMIN')) {
      return router.createUrlTree(['/dashboard']);
    }

    // Admin allowed
    return true;

  } catch (error) {

    console.error('AdminGuard Error:', error);
     localStorage.clear();
    localStorage.removeItem('token');

    return router.createUrlTree(['/login']);
  }
};