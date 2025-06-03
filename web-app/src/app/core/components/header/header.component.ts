import {Component, computed, HostListener, inject, signal} from '@angular/core';
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

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 650 && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  private userStore = inject(UserStoreService);
  private authService = inject(AuthService);

  currentUser = this.userStore.currentUser;

  isAuthenticated = signal(false);
  role = computed(() => this.currentUser()?.roleType ?? null);

  isMenuOpen = false;
  isTouchDevice = false;

  constructor() {
    this.authService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated.set(auth);
    });
  }

  logout() {
    this.userStore.clearUser();
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenuOnNavigate() {
    this.isMenuOpen = false;
  }
}
