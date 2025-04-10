import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {catchError, map, of, take} from 'rxjs';
import {UserStoreService} from '../services/user-store.service';
import {UserRole} from '../models/user.role.enum';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const userStore = inject(UserStoreService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']).then();
        return false;
      }

      const requiredRoles: UserRole[] = route.data['roles'];
      const userRole = userStore.getRoleFromToken();

      if (requiredRoles && !requiredRoles.includes(<UserRole>userRole)) {
        router.navigate(['/unauthorized']).then();
        return false;
      }

      return true;
    }),
    catchError(() => {
      router.navigate(['/login']).then();
      return of(false);
    })
  );
};
