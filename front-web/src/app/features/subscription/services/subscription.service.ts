import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getSubscriptionInfo() {
    return this.http.get<any>(`${this.baseUrl}/subscriptions`);
  }
}
