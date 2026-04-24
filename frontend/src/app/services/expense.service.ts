import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiBaseUrl}/api/expense`;

  constructor(private http: HttpClient) { }

  uploadExpense(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, data);
  }

  getExpensesForRequest(travelRequestId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/request/${travelRequestId}`);
  }

  updateExpenseStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/status/${id}`, { status });
  }
}
