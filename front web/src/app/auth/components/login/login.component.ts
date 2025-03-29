import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    const userData: LoginRequest = this.loginForm.value;

    this.authService.login(userData).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.errorMessage.set('Credenciales incorrectas'),
    });
  }
}
