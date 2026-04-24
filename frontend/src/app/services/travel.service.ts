import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private apiUrl = `${environment.apiBaseUrl}/api/travel`;

  constructor(private http: HttpClient) { }

  createTravelRequest(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, formData);
  }

  getAllTravelRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  approveTravelRequest(id: number, approvedBudget?: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${id}`, { approvedBudget });
  }

  rejectTravelRequest(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reject/${id}`, {});
  }

  getTravelRequestsByUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-requests`);
  }

  submitBill(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/submit-bill/${id}`, formData);
  }

  validateBill(id: number, isValid: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/validate-bill/${id}`, isValid);
  }
}
