import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {RegisterRequest} from '../../models/register.interface';
import {customEmailValidator} from '../../../shared/validators/forms.validator';
import {ToastrService} from 'ngx-toastr';

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
  private toastService = inject(ToastrService);

  isLoading = signal(false);
  errorMessage = signal<boolean | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, customEmailValidator()]],
    password: ['', [
      Validators.required,
      Validators.minLength(16),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{16,}$/)
    ]],
    role: ['', [Validators.required]],
  });

  register() {
    if (this.registerForm.invalid || this.isLoading()) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const userData: RegisterRequest = this.registerForm.getRawValue();

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']).then();
        this.toastService.success('Registro exitoso', 'Éxito');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(true);
        this.toastService.error('Registro fallido', 'Error');
      },
    });
  }
}
