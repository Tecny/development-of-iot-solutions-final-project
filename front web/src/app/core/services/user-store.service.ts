import {Injectable} from '@angular/core';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  getUserIdFromToken(): number | null {
    const token = this.getCookie('tokenCookie');
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.userId || null;
    }
    return null;
  }

  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
