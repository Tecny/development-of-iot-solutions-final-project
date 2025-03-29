import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environment/environment';
import {RegisterRequest} from '../models/register.model';
import {LoginRequest} from '../models/login.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private isLoggedIn = signal<boolean>(false);
  private baseUrl = environment.baseUrl;

  constructor() {
    this.checkAuth();
  }

  login(loginRequest: LoginRequest) {
    return this.http.post(`${this.baseUrl}/authentication/sign-in`, loginRequest).pipe(
      tap(() => this.isLoggedIn.set(true))
    );
  }

  register(registerRequest: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/users/sign-up`, registerRequest);
  }

  checkAuth(): void {
    this.http.get<{ authenticated: boolean }>(`${this.baseUrl}/authentication/is-authenticated`).subscribe({
      next: (response) => this.isLoggedIn.set(response.authenticated),
      error: () => this.isLoggedIn.set(false)
    });
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
}


