import { Component, OnInit } from '@angular/core';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.css']
})
export class ApprovalComponent implements OnInit {
  pendingRequests: any[] = [];
  loading = false;
  displayedColumns: string[] = ['userName', 'department', 'fromLocation', 'toLocation', 'travelDate', 'requestedBudget', 'actualExpense', 'status', 'actions'];
  currentUser: any;

  constructor(private travelService: TravelService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.loading = true;
    this.travelService.getAllTravelRequests().subscribe(
      data => {
        this.pendingRequests = data.filter((req: any) => 
          req.status === 'Pending' || req.status === 'BillSubmitted'
        );
        this.loading = false;
      },
      error => {
        console.error('Error loading pending requests', error);
        this.loading = false;
      }
    );
  }

  approveRequest(id: number): void {
    this.travelService.approveTravelRequest(id).subscribe(
      () => {
        this.loadPendingRequests();
      },
      error => {
        console.error('Error approving request', error);
      }
    );
  }

  rejectRequest(id: number): void {
    this.travelService.rejectTravelRequest(id).subscribe(
      () => {
        this.loadPendingRequests();
      },
      error => {
        console.error('Error rejecting request', error);
      }
    );
  }

  validateBill(id: number, isValid: boolean): void {
    this.travelService.validateBill(id, isValid).subscribe({
      next: () => {
        this.loadPendingRequests();
      },
      error: (err) => {
        console.error('Error validating bill', err);
      }
    });
  }
}
