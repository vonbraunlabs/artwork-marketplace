import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Listing Details</h1>
      <p>This component will display full listing information and purchase button.</p>
      <a routerLink="/listings" class="btn-primary">Back to Marketplace</a>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 4rem auto;
      padding: 2rem;
    }
  `]
})
export class ListingDetailsComponent {}
