import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environment/environment';
import {RegisterRequest} from '../models/register.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  register(registerRequest: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/users/sign-up`, registerRequest);
  }
}


