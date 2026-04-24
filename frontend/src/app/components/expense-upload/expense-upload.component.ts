import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-expense-upload',
  templateUrl: './expense-upload.component.html',
  styleUrls: ['./expense-upload.component.css']
})
export class ExpenseUploadComponent {
  expenseForm: FormGroup;
  loading = false;
  error = '';
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private travelService: TravelService,
    public dialogRef: MatDialogRef<ExpenseUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { travelRequestId: number }
  ) {
    this.expenseForm = this.fb.group({
      expenses: this.fb.array([this.createExpenseItem()])
    });
  }

  get expenses(): FormArray {
    return this.expenseForm.get('expenses') as FormArray;
  }

  createExpenseItem(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required]
    });
  }

  addExpense(): void {
    this.expenses.push(this.createExpenseItem());
  }

  removeExpense(index: number): void {
    if (this.expenses.length > 1) {
      this.expenses.removeAt(index);
    }
  }

  onFileChange(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    
    const expensesValue = this.expenseForm.value.expenses.map((e: any) => {
      let value = e.date;
      if (value instanceof Date) {
        const userTimezoneOffset = value.getTimezoneOffset() * 60000;
        e.date = new Date(value.getTime() - userTimezoneOffset).toISOString().split('T')[0];
      }
      return e;
    });

    formData.append('expensesJson', JSON.stringify(expensesValue));

    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('receipts', this.selectedFiles[i]);
    }

    this.travelService.submitBill(this.data.travelRequestId, formData).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error submitting bills';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

