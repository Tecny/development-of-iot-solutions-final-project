import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ProfileService} from '../../services/profile.service';
import {UserProfile} from '../../models/profile.model';

@Component({
  selector: 'app-view-profile',
  imports: [],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  userInfo = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.profileService.getUserInfo().subscribe({
      next: (user) => {
        this.userInfo.set(user);
      },
      error: () => this.userInfo.set(null),
    });
  }
}
