import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {UserStoreService} from '../../../core/services/user-store.service';
import {UserProfile} from '../models/profile.model';
import {map, tap} from 'rxjs';
import {AuthService} from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.baseUrl;
  private userStore = inject(UserStoreService);
  private userId: number | null = this.userStore.getUserIdFromToken();

  getUserInfo() {
    if (!this.userId) throw new Error("User ID not found.");
    return this.http.get<any>(`${this.baseUrl}/users/${this.userId}`).pipe(
      map((user: any) => {
        return {
          name: user.name,
          email: user.email,
          roleType: user.roleType as 'PLAYER' | 'OWNER',
        } as UserProfile;
      })
    );
  }

  changeName(name: string) {
    if (!this.userId) throw new Error("User ID not found.");
    return this.http.put(`${this.baseUrl}/users/name/${this.userId}`, { name });
  }

  changeEmail(newEmail: string) {
    if (!this.userId) throw new Error("User ID not found.");
    return this.http.put(`${this.baseUrl}/users/email/${this.userId}`, { newEmail }).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }

  changePassword(newPassword: string) {
    if (!this.userId) throw new Error("User ID not found.");
    return this.http.put(`${this.baseUrl}/users/password/${this.userId}`, { newPassword }).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }
}
