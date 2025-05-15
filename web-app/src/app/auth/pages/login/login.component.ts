import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login.interface';
import {customEmailValidator} from '../../../shared/validators/forms.validator';

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

  showEmailInputForgotPassword = false;

  errorMessage = signal<boolean | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator()]],
    password: ['', [Validators.required, Validators.minLength(16)]],
  });

  recoverPasswordForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator()]],
  });

  login() {
    const userData: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(userData).subscribe({
      next: () => {
        this.router.navigate(['/home']).then();
      },
      error: () => {
        this.errorMessage.set(true);
      }
    });
  }

  toggleForgotPassword() {
    this.showEmailInputForgotPassword = !this.showEmailInputForgotPassword;
  }

  forgotPassword(email: string) {
    if (this.recoverPasswordForm.invalid) {
      return;
    }
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.showEmailInputForgotPassword = false;
        this.recoverPasswordForm.reset();
        console.log('Password reset email sent');
      },
      error: (error) => {
        console.error('Error sending password reset email', error);
      }
    })
  }
}
