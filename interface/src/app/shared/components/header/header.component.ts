import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Web3Service } from '../../../core/web3/web3.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  walletConnected = false;
  walletAddress = '';

  constructor(
    private authService: AuthService,
    private web3Service: Web3Service
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    this.web3Service.account$.subscribe(account => {
      this.walletConnected = !!account;
      this.walletAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';
    });
  }

  async connectWallet(): Promise<void> {
    try {
      await this.web3Service.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
