import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="gradient-text">Welcome Back</h1>
        <p class="subtitle">Sign in to browse and trade artworks</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="your@email.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>

          @if (error) {
            <div class="alert-error">{{ error }}</div>
          }

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn btn-primary">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="footer">
          Don't have an account? <a routerLink="/auth/register" class="link">Sign up</a>
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
