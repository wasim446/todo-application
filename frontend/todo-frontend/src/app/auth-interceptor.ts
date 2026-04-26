import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  // Skip login & register
  if (req.url.includes('/api/auth')) {
    return next(req);
  }

  const platformId = inject(PLATFORM_ID);

  let token: string | null = null;

  const isBrowser = isPlatformBrowser(platformId);

  if (isBrowser) {
    token = localStorage.getItem('token');
  }

  let authReq = req;

  console.log("Token in interceptor:", token);

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      console.log("INTERCEPTOR ERROR STATUS:", error.status);
      if (error.status === 401 || error.status === 403) {

        if (isBrowser) {
          console.log("Redirecting to login from interceptor");
          // Token expired or invalid
          localStorage.removeItem('token');

          // Redirect to login
          router.navigate(['/login']);
        }
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
