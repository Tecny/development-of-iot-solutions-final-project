import {Component, inject} from '@angular/core';
import {UserStoreService} from '../../services/user-store.service';
import {Router} from '@angular/router';
import {UserRole} from '../../models/user.role.enum';

@Component({
  standalone: true,
  template: ''
})
export class RedirectComponent {
  private userStore = inject(UserStoreService);
  private router = inject(Router);

  constructor() {
    const role = this.userStore.getRoleFromToken();

    switch (role) {
      case UserRole.PLAYER:
        this.router.navigateByUrl('/rooms').then();
        break;
      case UserRole.OWNER:
        this.router.navigateByUrl('/sport-spaces').then();
        break;
      case UserRole.ADMIN:
        this.router.navigateByUrl('/bank-transfer').then();
        break;
      default:
        this.router.navigateByUrl('/login').then();
        break;
    }
  }
}
