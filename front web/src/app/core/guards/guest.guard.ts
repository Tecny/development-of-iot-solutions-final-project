import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {Observable} from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Observable<boolean>((observer) => {
    authService.checkAuth();

    setTimeout(() => {
      if (authService.isAuthenticated()) {
        router.navigate(['/dashboard']).then();
        observer.next(false);
      } else {
        observer.next(true);
      }
      observer.complete();
    }, 100);
  });
};
