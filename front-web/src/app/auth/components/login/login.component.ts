import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {LoginRequest} from '../../models/login.model';
import {customEmailValidator} from '../../../shared/validators/forms.validator';
import {UserStoreService} from '../../../core/services/user-store.service';
import {UserRole} from '../../../core/models/user.role.enum';

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
  private userStore = inject(UserStoreService);
  private fb = inject(NonNullableFormBuilder);

  errorMessage = signal<boolean | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, customEmailValidator]],
    password: ['', [Validators.required, Validators.minLength(16)]],
  });

  login() {
    const userData: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(userData).subscribe({
      next: () => {
        const userRole = this.userStore.getRoleFromToken();

        switch (userRole) {
          case UserRole.PLAYER:
            this.router.navigate(['/rooms']).then();
            break;
          case UserRole.OWNER:
            this.router.navigate(['/sport-spaces']).then();
            break;
          case UserRole.ADMIN:
            this.router.navigate(['/dashboard']).then();
            break;
          default:
            this.router.navigate(['/unauthorized']).then();
        }
      },
      error: () => this.errorMessage.set(true)
    });
  }
}
