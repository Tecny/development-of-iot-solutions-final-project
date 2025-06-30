import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {RegisterRequest} from '../../models/register.interface';
import {customEmailValidator} from '../../../shared/validators/forms.validator';
import {ToastrService} from 'ngx-toastr';
import {ThemeService} from '../../../shared/services/theme.service';

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
  private themeService = inject(ThemeService);

  isLoadingSubmitRequest = signal(false);
  errorMessage = signal<string | null>(null);

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
    if (this.registerForm.invalid || this.isLoadingSubmitRequest()) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoadingSubmitRequest.set(true);
    const userData: RegisterRequest = this.registerForm.getRawValue();

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoadingSubmitRequest.set(false);
        this.router.navigate(['/login']).then();
        this.toastService.success('Registro exitoso', 'Éxito');
      },
      error: (error) => {
        this.isLoadingSubmitRequest.set(false);
        let mensaje = 'Registro fallido';
        if (error.status === 400 && error.error?.message) {
          switch (error.error.message) {
            case 'User with this email already exists':
              mensaje = 'Ya existe un usuario con este correo electrónico';
              break;
            default:
              mensaje = error.error.message;
          }
        }
        this.errorMessage.set(mensaje);
        this.toastService.error(mensaje, 'Error');
      },
    });
  }

  get isDarkTheme() {
    return this.themeService.isDarkTheme;
  }
}
