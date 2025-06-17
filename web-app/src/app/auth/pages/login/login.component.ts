import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login.interface';
import {customEmailValidator} from '../../../shared/validators/forms.validator';
import {ModalComponent} from '../../../shared/components/modal/modal.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private toastService = inject(ToastrService);

  showRecoverModal = false;

  isLoadingSubmitRequest = signal(false);
  correctMessage = signal<boolean | null>(null);
  errorMessage = signal<boolean | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator()]],
    password: ['', Validators.required],
  });

  recoverPasswordForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator()]],
  });

  login() {
    if (this.loginForm.invalid || this.isLoadingSubmitRequest()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoadingSubmitRequest.set(true);
    const userData: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(userData).subscribe({
      next: () => {
        this.isLoadingSubmitRequest.set(false);
        this.router.navigate(['/home']).then();
        this.toastService.success('Inicio de sesión correcto', 'Éxito');
      },
      error: () => {
        this.isLoadingSubmitRequest.set(false);
        this.errorMessage.set(true);
        this.toastService.error('Inicio de sesión fallido', 'Error');
      }
    });
  }

  openRecoverModal() {
    this.showRecoverModal = true;
  }

  closeRecoverModal() {
    this.showRecoverModal = false;
    this.recoverPasswordForm.reset();
  }

  forgotPassword(email: string) {
    if (this.recoverPasswordForm.invalid || this.isLoadingSubmitRequest()) {
      this.recoverPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoadingSubmitRequest.set(true);
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.recoverPasswordForm.reset();
        this.showRecoverModal = false;
        this.isLoadingSubmitRequest.set(false);
        this.toastService.success('Se envió un enlace de recuperación a tu correo', 'Éxito');
      },
      error: () => {
        this.isLoadingSubmitRequest.set(false);
        this.errorMessage.set(true);
        this.toastService.error('Error al enviar el correo de recuperación', 'Error');
      }
    })
  }
}
