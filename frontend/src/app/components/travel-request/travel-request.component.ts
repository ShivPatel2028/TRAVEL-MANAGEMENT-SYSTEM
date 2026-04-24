import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-travel-request',
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.css']
})
export class TravelRequestComponent implements OnInit {
  travelForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  constructor(
    private formBuilder: FormBuilder,
    private travelService: TravelService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.travelForm = this.formBuilder.group({
      fromLocation: ['', [Validators.required, Validators.minLength(2)]],
      toLocation: ['', [Validators.required, Validators.minLength(2)]],
      travelDate: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      returnDate: ['', Validators.required],
      requestedBudget: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get f() {
    return this.travelForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.travelForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    Object.keys(this.travelForm.value).forEach(key => {
      let value = this.travelForm.value[key];
      if (value instanceof Date) {
        const userTimezoneOffset = value.getTimezoneOffset() * 60000;
        value = new Date(value.getTime() - userTimezoneOffset).toISOString().split('T')[0];
      }
      formData.append(key, value);
    });

    this.travelService.createTravelRequest(formData).subscribe(
      response => {
        this.loading = false;
        this.success = 'Travel request created successfully!';
        this.travelForm.reset();
        this.submitted = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error => {
        this.loading = false;
        this.error = error.error?.message || 'Error creating travel request';
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
