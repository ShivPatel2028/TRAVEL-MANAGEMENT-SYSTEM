import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TravelService } from '../../services/travel.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseUploadComponent } from '../expense-upload/expense-upload.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  travelRequests: any[] = [];
  displayedColumns: string[] = ['userName', 'department', 'fromLocation', 'toLocation', 'travelDate', 'requestedBudget', 'actualExpense', 'status', 'actions'];
  apiUrl = environment.apiBaseUrl;
  loading = false;

  constructor(
    private authService: AuthService,
    private travelService: TravelService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadTravelRequests();
  }

  loadTravelRequests(): void {
    this.loading = true;
    if (this.currentUser.role === 'Admin' || this.currentUser.role === 'Manager') {
      this.travelService.getAllTravelRequests().subscribe(
        data => {
          this.travelRequests = data;
          this.loading = false;
        },
        error => {
          console.error('Error loading travel requests', error);
          this.loading = false;
        }
      );
    } else {
      this.travelService.getTravelRequestsByUser().subscribe(
        data => {
          this.travelRequests = data;
          this.loading = false;
        },
        error => {
          console.error('Error loading travel requests', error);
          this.loading = false;
        }
      );
    }
  }

  createTravelRequest(): void {
    this.router.navigate(['/travel-request']);
  }

  approveRequest(id: number): void {
    this.travelService.approveTravelRequest(id).subscribe(
      () => {
        this.loadTravelRequests();
      },
      error => {
        console.error('Error approving request', error);
      }
    );
  }

  rejectRequest(id: number): void {
    this.travelService.rejectTravelRequest(id).subscribe(
      () => {
        this.loadTravelRequests();
      },
      error => {
        console.error('Error rejecting request', error);
      }
    );
  }

  submitBill(id: number): void {
    const dialogRef = this.dialog.open(ExpenseUploadComponent, {
      width: '400px',
      data: { travelRequestId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTravelRequests();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
