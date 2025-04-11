import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {SportSpace} from '../models/sport-space.model';

@Injectable({
  providedIn: 'root'
})
export class SportSpaceService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getSportSpaces() {
    return this.http.get<SportSpace[]>(`${this.baseUrl}/sport-spaces/all`);
  }

  getSportSpaceById(id: number) {
    return this.http.get<SportSpace>(`${this.baseUrl}/sport-spaces/${id}`);
  }

  getMySportSpaces() {
    return this.http.get<SportSpace[]>(`${this.baseUrl}/sport-spaces/my-space`);
  }

  canAddSportSpace() {
    return this.http.get<{ canAdd: boolean }>(`${this.baseUrl}/sport-spaces/can-add-sport-space`);
  }
}
