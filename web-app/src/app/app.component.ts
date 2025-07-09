import {Component, effect, inject, signal} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './core/components/header/header.component';
import {AuthService} from './auth/services/auth.service';
import {LoadingService} from './core/services/loading.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dtaquito';

  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  isAuthenticated = signal(false);
  private isNavigating = signal(false);
  isLoading = signal(false);

  constructor() {
    this.authService.isAuthenticated().subscribe((auth) => {
      this.isAuthenticated.set(auth);
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating.set(false);
      }
    });

    effect(() => {
      this.isLoading.set(
        this.isNavigating() || this.loadingService.isLoading()
      );
    });
  }
}
