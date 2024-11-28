import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Add the access token if it exists
  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `${accessToken}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      //console.log('Token Interceptor Error:', error);
      // If 401 Unauthorized, try to refresh the token
      if (
        error.status === 401 &&
        !req.url.includes('/login') &&
        !req.url.includes('/refreshtoken')
      ) {
        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            // Store new tokens
            authService.storeTokens(tokens.accessToken, tokens.refreshToken);

            // Retry the original request with the new access token
            return next(
              req.clone({
                setHeaders: {
                  Authorization: `${tokens.accessToken}`,
                },
              })
            );
          }),
          catchError((refreshError) => {
            //console.error('Token refresh failed:', refreshError);
            if (refreshError.status === 401 || refreshError.status === 403) {
              authService.logout(); // Ensure logout logic removes tokens
              window.location.href = '/login'; // Redirect to login page
            }
            return throwError(
              () => new Error('Token refresh failed, please log in again.')
            );
          })
        );
      }
      const errorMessage =
        error.error?.message || error.message || 'Unknown error occurred';
      return throwError(() => new Error(errorMessage));
    })
  );
};
