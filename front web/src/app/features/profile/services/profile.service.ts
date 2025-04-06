import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {UserStoreService} from '../../../core/services/user-store.service';
import {UserProfile} from '../models/profile.model';
import {map} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

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


}
