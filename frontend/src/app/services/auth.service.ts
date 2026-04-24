import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());

  constructor(private http: HttpClient) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/user/profile`);
  }
}
