import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule
  ],
  template: `
    <div class="recover-password">
      <h1>Reset Password</h1>
      <p>Please enter your new password</p>
      <form [formGroup]="recoverPasswordForm" (ngSubmit)="onSubmit()">
        <input type="password" formControlName="password" placeholder="Password" required />
        <input type="password" formControlName="confirmPassword" placeholder="Confirm Password" required />
        <button type="submit" [disabled]="recoverPasswordForm.invalid">Update new password</button>
      </form>
      @if (recoverPasswordForm.get('password')?.invalid && (recoverPasswordForm.get('password')?.dirty || recoverPasswordForm.get('password')?.touched)) {
        @if (recoverPasswordForm.get('password')?.errors?.['required']) {
          <small>La contraseña es obligatoria</small>
        } @else {
          @if (recoverPasswordForm.get('password')?.errors?.['minlength']) {
            <small>La contraseña debe tener al menos 16 caracteres</small>
          }
          @else  {
            <small>La contraseña debe incluir una mayúscula, un número y un carácter especial</small>
          }
        }
      }
      @if (passwordsDoNotMatch) {
        <p class="error">Passwords do not match</p>
      }
    </div>
  `,
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token: string | null = null;

  recoverPasswordForm = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(16),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{16,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  get passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.recoverPasswordForm.value;
    return password !== confirmPassword && this.recoverPasswordForm.touched;
  }

  onSubmit() {
    if (this.recoverPasswordForm.valid && !this.passwordsDoNotMatch) {
      const { password } = this.recoverPasswordForm.getRawValue();

      if (!this.token) {
        console.error('Token no disponible');
        return;
      }

      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          console.log('Password updated');
          this.router.navigate(['/login']).then();
        },
        error: (err) => {
          console.error('Error updating password:', err);
        }
      });
    }
  }
}
