import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListingService } from '../../../core/api/listing.service';

@Component({
  selector: 'app-listings-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Marketplace</h1>
        <a routerLink="/listings/create" class="btn-create">Create Listing</a>
      </div>

      <div class="filters">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (ngModelChange)="onSearch()"
          placeholder="Search artworks..."
          class="search-input">
        
        <select [(ngModel)]="categoryFilter" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="">All Categories</option>
          <option value="Painting">Painting</option>
          <option value="Sculpture">Sculpture</option>
          <option value="Photography">Photography</option>
          <option value="Digital">Digital Art</option>
          <option value="Other">Other</option>
        </select>

        <div class="price-filters">
          <input 
            type="number" 
            [(ngModel)]="minPrice" 
            (ngModelChange)="onFilterChange()"
            placeholder="Min price"
            class="price-input">
          <span>-</span>
          <input 
            type="number" 
            [(ngModel)]="maxPrice" 
            (ngModelChange)="onFilterChange()"
            placeholder="Max price"
            class="price-input">
        </div>

        <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()" class="filter-select">
          <option value="date">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      @if (loading) {
        <div class="loading">Loading listings...</div>
      }

      @if (error) {
        <div class="alert-error">{{ error }}</div>
      }

      @if (listings.length === 0 && !loading) {
        <div class="empty-state">
          <p>No listings found</p>
          <a routerLink="/listings/create" class="btn-primary">Create First Listing</a>
        </div>
      }

      @if (listings.length > 0) {
        <div class="listings-grid">
          @for (listing of listings; track listing.id) {
            <div class="listing-card" [routerLink]="['/listings', listing.id]">
              @if (listing.artwork?.images?.[0]) {
                <img [src]="listing.artwork.images[0]" [alt]="listing.artwork.title" class="listing-image">
              } @else {
                <div class="no-image">No Image</div>
              }
              
              <div class="listing-content">
                <h3>{{ listing.artwork?.title || 'Untitled' }}</h3>
                <p class="artist">{{ listing.artwork?.artistName }}</p>
                <p class="category">{{ listing.artwork?.category }}</p>
                
                <div class="listing-footer">
                  <div class="price">
                    <span class="amount">{{ listing.price | number:'1.2-2' }}</span>
                    <span class="currency">{{ listing.paymentToken }}</span>
                  </div>
                  @if (listing.artwork?.isVerified) {
                    <span class="badge-verified">✓ Verified</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        @if (totalPages > 1) {
          <div class="pagination">
            <button 
              (click)="previousPage()" 
              [disabled]="currentPage === 1"
              class="btn-page">
              Previous
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button 
              (click)="nextPage()" 
              [disabled]="currentPage === totalPages"
              class="btn-page">
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2.5rem;
    }
    .btn-create {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn-create:hover {
      transform: translateY(-2px);
    }
    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
    }
    .search-input, .filter-select, .price-input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    .search-input:focus, .filter-select:focus, .price-input:focus {
      outline: none;
      border-color: #667eea;
    }
    .price-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .price-input {
      flex: 1;
    }
    .loading {
      text-align: center;
      padding: 4rem;
      color: #666;
    }
    .alert-error {
      background: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .empty-state p {
      color: #666;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    .btn-primary {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .listing-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .listing-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
    }
    .listing-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
    }
    .no-image {
      width: 100%;
      height: 250px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
    .listing-content {
      padding: 1.5rem;
    }
    .listing-content h3 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }
    .artist {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .category {
      color: #999;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .listing-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
    }
    .price {
      display: flex;
      flex-direction: column;
    }
    .amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }
    .currency {
      font-size: 0.875rem;
      color: #666;
    }
    .badge-verified {
      padding: 0.25rem 0.75rem;
      background: #66bb6a;
      color: white;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      padding: 2rem 0;
    }
    .btn-page {
      padding: 0.5rem 1.5rem;
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-page:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .page-info {
      color: #666;
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }
      .listings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ListingsBrowseComponent implements OnInit {
  listings: any[] = [];
  loading = false;
  error = '';
  
  searchQuery = '';
  categoryFilter = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'date';
  
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.loading = true;
    this.error = '';

    const filters = {
      search: this.searchQuery || undefined,
      category: this.categoryFilter || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.listingService.getAll(filters).subscribe({
      next: (response) => {
        this.listings = response.items || response;
        this.totalPages = response.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load listings.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadListings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadListings();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadListings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadListings();
    }
  }
}
