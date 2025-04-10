import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {UserStoreService} from '../../services/user-store.service';
import {AuthService} from '../../../auth/services/auth.service';
import {RouterLink} from '@angular/router';
import {UserRole} from '../../models/user.role.enum';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  protected readonly UserRole = UserRole;
  private userStore = inject(UserStoreService);
  private authService = inject(AuthService);

  isAuthenticated = signal(false);
  role = signal<UserRole | null>(null);

  constructor() {
    this.authService.isAuthenticated().subscribe((auth) => {
      this.isAuthenticated.set(auth);

      if (auth) {
        this.role.set(this.userStore.getRoleFromToken());
      } else {
        this.role.set(null);
      }
    });
  }
}
