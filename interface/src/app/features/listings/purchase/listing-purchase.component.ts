import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing-purchase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Purchase Artwork</h1>
      <p>This component will handle Web3 integration for NFT purchase via MetaMask.</p>
      <p><strong>Features to implement:</strong></p>
      <ul>
        <li>Connect wallet (MetaMask)</li>
        <li>Approve ERC-20 tokens</li>
        <li>Call smart contract purchaseArtwork()</li>
        <li>Transaction progress tracking</li>
        <li>Purchase receipt</li>
      </ul>
      <a routerLink="/listings" class="btn-primary">Back to Marketplace</a>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 4rem auto;
      padding: 2rem;
    }
    ul {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    li {
      margin: 0.5rem 0;
    }
  `]
})
export class ListingPurchaseComponent {}
