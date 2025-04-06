import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ProfileService} from '../../services/profile.service';
import {UserProfile} from '../../models/profile.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-view-profile',
  imports: [
    ReactiveFormsModule
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
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

    if (!passwordControl?.valid) {
      passwordControl?.markAsTouched();
      console.error('Invalid or too short password.');
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

  logout() {
    this.authService.logout();
  }
}

