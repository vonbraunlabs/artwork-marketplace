import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="gradient-text">Join the Marketplace</h1>
        <p class="subtitle">Create your account to start trading</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" formControlName="fullName" placeholder="John Doe">
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="your@email.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" formControlName="confirmPassword" placeholder="••••••••">
          </div>

          @if (error) {
            <div class="alert-error">{{ error }}</div>
          }

          @if (success) {
            <div class="alert-success">{{ success }}</div>
          }

          <button type="submit" [disabled]="registerForm.invalid || loading" class="btn btn-primary">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>

        <div class="footer">
          Already have an account? <a routerLink="/auth/login" class="link">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .auth-card {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
    }
    h1 {
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    .alert-error {
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .alert-success {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .footer {
      text-align: center;
      margin-top: 2rem;
      color: #666;
    }
    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
