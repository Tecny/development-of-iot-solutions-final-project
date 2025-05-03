import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './core/components/header/header.component';
import {AuthService} from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dtaquito';

  private authService = inject(AuthService);

  constructor() {
    this.authService.checkAuth();
  }
}
