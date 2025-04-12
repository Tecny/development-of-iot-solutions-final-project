import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ProfileService} from '../../services/profile.service';
import {UserProfile} from '../../models/user-profile.model';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../auth/services/auth.service';
import {customEmailValidator} from '../../../../shared/validators/forms.validator';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-view-profile',
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    FormsModule,
    TitleCasePipe
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  userInfo = signal<UserProfile | null>(null);

  profileForm!: FormGroup;

  editingName = false;
  editingEmail = false;
  editingPassword = false;

  showRechargeModal = false;

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.profileService.getUserInfo().subscribe({
      next: (user) => {
        this.userInfo.set(user);
        this.initForm(user);
      },
      error: () => this.userInfo.set(null),
    });
  }

  initForm(user: UserProfile) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, customEmailValidator()]],
      password: ['', [
        Validators.required,
        Validators.minLength(16),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/)
      ]],
      amount: ['', [Validators.required, Validators.min(1)]],
    });
  }

  updateName() {
    const nameControl = this.profileForm.get('name');
    const name = nameControl?.value.trim();
    const currentName = this.userInfo()?.name;

    if (!nameControl?.valid) {
      nameControl?.markAsTouched();
      console.error('Invalid or empty name.');
      return;
    }

    if (name === currentName) {
      console.error('New name must be different.');
      return;
    }

    this.profileService.changeName(name).subscribe({
      next: () => {
        console.log('Name updated successfully.');
        this.editingName = false;
        this.loadUserInfo();
        nameControl.reset();
      },
      error: () => console.error('Error updating name.')
    });
  }

  updateEmail() {
    const emailControl = this.profileForm.get('email');
    const email = emailControl?.value.trim();
    const currentEmail = this.userInfo()?.email;

    if (!emailControl?.valid) {
      emailControl?.markAsTouched();
      console.error('Invalid or empty email.');
      return;
    }

    if (email === currentEmail) {
      console.error('New email must be different.');
      return;
    }

    this.profileService.changeEmail(email).subscribe({
      next: () => {
        console.log('Email updated successfully.');
        this.editingEmail = false;
        this.loadUserInfo();
        emailControl.reset();
      },
      error: () => console.error('Error updating email.')
    });
  }

  updatePassword() {
    const passwordControl = this.profileForm.get('password');
    const password = passwordControl?.value;

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{16,}$/;

    if (!passwordControl?.valid || !passwordPattern.test(password)) {
      passwordControl?.markAsTouched();
      console.error('Invalid or too short password. Must contain at least one uppercase letter, one number, and one special character.');
      return;
    }

    this.profileService.changePassword(password).subscribe({
      next: () => {
        console.log('Password updated successfully.');
        this.editingPassword = false;
        passwordControl.reset();
      },
      error: () => console.error('Error updating password.')
    });
  }

  openRechargeModal() {
    this.showRechargeModal = true;
  }

  closeRechargeModal() {
    this.showRechargeModal = false;
    this.profileForm.get('amount')?.reset();
  }

  recharge() {
    const amountControl = this.profileForm.get('amount');
    const amount = amountControl?.value;
    this.closeRechargeModal();

    this.profileService.rechargeCredits(amount).subscribe({
      next: (response) => {
        const approvalUrl = response.approval_url;
        const paymentWindow = window.open(approvalUrl, 'PayPal Payment', 'width=800, height=600');
        if (paymentWindow) {
          const interval = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(interval);
              this.loadUserInfo();
            }
          }, 1000);
        } else {
          console.error('No se pudo abrir la ventana de pago.');
        }
      },
      error: () => console.error('Error during recharge.')
    });
  }

  logout() {
    this.authService.logout();
  }
}

