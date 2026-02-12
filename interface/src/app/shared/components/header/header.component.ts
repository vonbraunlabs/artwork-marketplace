import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Web3Service } from '../../../core/web3/web3.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎨</span>
          <span class="logo-text">Art Marketplace</span>
        </a>
        <nav>
          <a routerLink="/listings" class="nav-link">Browse</a>
          @if (currentUser$ | async; as user) {
            <a routerLink="/listings/create" class="nav-link">Create Listing</a>
            <a routerLink="/profile" class="nav-link">Profile</a>
            <button (click)="logout()" class="btn-secondary">Logout</button>
          } @else {
            <a routerLink="/auth/login" class="nav-link">Login</a>
            <button routerLink="/auth/register" class="btn-primary">Get Started</button>
          }
          @if (account$ | async; as account) {
            <div class="wallet-badge">
              <span class="wallet-icon">🔗</span>
              <span class="wallet-address">{{ account.slice(0, 6) }}...{{ account.slice(-4) }}</span>
            </div>
          } @else {
            <button (click)="connectWallet()" class="btn-wallet">Connect Wallet</button>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem 0;
      box-shadow: 0 2px 20px rgba(102, 126, 234, 0.3);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.5rem;
      transition: transform 0.2s;
    }
    .logo:hover {
      transform: scale(1.05);
    }
    .logo-icon {
      font-size: 2rem;
    }
    nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-link {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-link:hover {
      color: white;
    }
    .btn-primary {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.3);
    }
    .btn-wallet {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-wallet:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
    }
    .wallet-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .wallet-icon {
      font-size: 1.2rem;
    }
    .wallet-address {
      color: white;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
  `]
})
export class HeaderComponent {
  currentUser$ = this.authService.currentUser$;
  account$ = this.web3Service.account$;

  constructor(
    private authService: AuthService,
    private web3Service: Web3Service
  ) {}

  logout(): void {
    this.authService.logout();
  }

  async connectWallet(): Promise<void> {
    try {
      await this.web3Service.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }
}
