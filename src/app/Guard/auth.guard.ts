import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  let returnVar: boolean = false;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const localData = localStorage.getItem('accessToken');
    if (localData != null) {
      returnVar = true;
    } else {
      router.navigateByUrl('login');
      return false;
    }
  } else {
    // If localStorage is not available, redirect to login
    router.navigateByUrl('login');
    return false;
  }

  authService.setUserRole();
  // Fetch the required roles for the route (set in route's data)
  const expectedRoles = route.data['roles'];

  // Check if the user has any of the expected roles
  const userHasRole = authService.hasAnyRole(expectedRoles);

  if (!userHasRole) {
    // If user doesn't have the required roles, redirect to a login or error page
    router.navigateByUrl('/unauthorized'); // Redirect to an unauthorized or login page
    return false;
  }

  return returnVar;
};
