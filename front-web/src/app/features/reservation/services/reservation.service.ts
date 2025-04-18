import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {ReservationRequest} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  createReservation(reservation: ReservationRequest) {
    return this.http.post<void>(`${this.baseUrl}/reservations/create`, reservation);
  }
}
