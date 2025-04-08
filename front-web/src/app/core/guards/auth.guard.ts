import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {Observable} from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Observable<boolean>((observer) => {
    authService.isAuthenticated().subscribe({
      next: (isAuthenticated) => {
        if (!isAuthenticated) {
          console.log('Not authenticated');
          router.navigate(['/login']).then();
          observer.next(false);
        } else {
          console.log('Authenticated');
          observer.next(true);
        }
        observer.complete();
      },
      error: () => {
        observer.next(false);
        observer.complete();
      }
    });
  });
};
