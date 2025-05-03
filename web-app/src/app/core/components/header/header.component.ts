import {Component, computed, inject, signal} from '@angular/core';
import {UserStoreService} from '../../services/user-store.service';
import {AuthService} from '../../../auth/services/auth.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  private userStore = inject(UserStoreService);
  private authService = inject(AuthService);

  currentUser = this.userStore.currentUser;

  isAuthenticated = signal(false);
  role = computed(() => this.currentUser()?.roleType ?? null);

  constructor() {
    this.authService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated.set(auth);
    });
  }

  logout() {
    this.userStore.clearUser();
    this.authService.logout();
  }
}
