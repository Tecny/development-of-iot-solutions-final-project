import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {RegisterRequest} from '../../models/register.model';
import {customEmailValidator} from '../../../shared/validators/custom-email.validator';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  errorMessage = signal<boolean | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, customEmailValidator]],
    password: ['', [
      Validators.required,
      Validators.minLength(16),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{16,}$/)
    ]],
    role: ['', [Validators.required]],
  });

  register() {
    const userData: RegisterRequest = this.registerForm.getRawValue();

    this.authService.register(userData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.errorMessage.set(true),
    });
  }
}
