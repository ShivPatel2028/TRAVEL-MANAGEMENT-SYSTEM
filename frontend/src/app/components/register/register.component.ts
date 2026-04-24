import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      employeeId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      department: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all required fields correctly.';
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.successMessage = 'Registration successful! You can now log in.';
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed';
        this.successMessage = '';
      }
    });
  }
}
