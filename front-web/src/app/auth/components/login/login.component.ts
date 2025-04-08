import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login.model';
import {customEmailValidator} from '../../../shared/validators/custom-email.validator';

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

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  errorMessage = signal<boolean | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator]],
    password: ['', [Validators.required, Validators.minLength(16)]],
  });

  login() {
    const userData: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(userData).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => this.errorMessage.set(true)
    });
  }
}
