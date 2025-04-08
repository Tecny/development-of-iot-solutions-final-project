import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environment/environment';
import {RegisterRequest} from '../models/register.model';
import {LoginRequest} from '../models/login.model';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Router} from '@angular/router';
import {UserStoreService} from '../../core/services/user-store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userStore = inject(UserStoreService);
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private isChecked = false;
  private baseUrl = environment.baseUrl;

  constructor() {
    this.checkAuth();
  }

  login(loginRequest: LoginRequest) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/authentication/sign-in`, loginRequest).pipe(
      tap((response) => {
        document.cookie = `tokenCookie=${response.token}; path=/`;
        this.isLoggedIn.next(true);
      })
    );
  }

  register(registerRequest: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/users/sign-up`, registerRequest);
  }

  checkAuth(): void {
    if (!this.isChecked) {
      this.isChecked = true;
      const token = this.userStore.getUserIdFromToken();
      this.isLoggedIn.next(!!token);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/authentication/log-out`, {}).subscribe({
      next: () => {
        document.cookie = 'tokenCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        this.isLoggedIn.next(false);
        this.router.navigate(['/login']).then();
      },
      error: () => {
        console.error('Error during logout.');
      }
    });
  }
}
