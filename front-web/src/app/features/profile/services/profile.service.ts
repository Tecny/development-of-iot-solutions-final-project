import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
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

  getUserInfo() {
    return this.http.get<any>(`${this.baseUrl}/users/me`).pipe(
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
    return this.http.put(`${this.baseUrl}/users/name`, { name });
  }

  changeEmail(newEmail: string) {
    return this.http.put(`${this.baseUrl}/users/email`, { newEmail }).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }

  changePassword(newPassword: string) {
    return this.http.put(`${this.baseUrl}/users/password`, { newPassword }).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }
}
