import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ListingService } from '../../../core/api/listing.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="create-card">
        <h1>Create Listing</h1>
        <p class="subtitle">List your tokenized artwork for sale</p>

        @if (loadingArtworks) {
          <div class="loading">Loading your artworks...</div>
        }

        @if (!loadingArtworks && myArtworks.length === 0) {
          <div class="empty-state">
            <p>You don't have any artworks to list</p>
            <a routerLink="/artworks/register" class="btn-primary">Register Artwork First</a>
          </div>
        }

        @if (myArtworks.length > 0) {
          <form [formGroup]="listingForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Select Artwork *</label>
              <select formControlName="artworkId" (change)="onArtworkSelect()">
                <option value="">Choose an artwork</option>
                @for (artwork of myArtworks; track artwork.id) {
                  <option [value]="artwork.id">{{ artwork.title }}</option>
                }
              </select>
            </div>

            @if (selectedArtwork) {
              <div class="artwork-preview">
                @if (selectedArtwork.images?.[0]) {
                  <img [src]="selectedArtwork.images[0]" [alt]="selectedArtwork.title" class="preview-image">
                }
                <div class="preview-info">
                  <h3>{{ selectedArtwork.title }}</h3>
                  <p>{{ selectedArtwork.category }} • {{ selectedArtwork.creationYear }}</p>
                  <p class="royalty">Royalty: {{ selectedArtwork.royaltyPercentage }}%</p>
                </div>
              </div>
            }

            <div class="form-group">
              <label>Price *</label>
              <input type="number" formControlName="price" placeholder="0.00" step="0.01" min="0">
              <small>Set your listing price</small>
            </div>

            <div class="form-group">
              <label>Payment Token *</label>
              <select formControlName="paymentToken">
                <option value="USDC">USDC (USD Coin)</option>
                <option value="USDT">USDT (Tether)</option>
                <option value="DAI">DAI (Dai Stablecoin)</option>
              </select>
              <small>Stablecoin for payment</small>
            </div>

            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea formControlName="description" rows="4" placeholder="Add details about this listing..."></textarea>
            </div>

            @if (error) {
              <div class="alert-error">{{ error }}</div>
            }

            @if (success) {
              <div class="alert-success">{{ success }}</div>
            }

            <div class="form-actions">
              <button type="button" routerLink="/listings" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="listingForm.invalid || loading" class="btn-primary">
                {{ loading ? 'Creating...' : 'Create Listing' }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    .create-card {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
    }
    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f5f7fa;
      border-radius: 8px;
    }
    .empty-state p {
      color: #666;
      margin-bottom: 1rem;
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
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    small {
      display: block;
      color: #666;
      margin-top: 0.25rem;
      font-size: 0.875rem;
    }
    .artwork-preview {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .preview-image {
      width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
    .preview-info {
      flex: 1;
    }
    .preview-info h3 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    .preview-info p {
      color: #666;
      margin-bottom: 0.25rem;
    }
    .royalty {
      color: #667eea;
      font-weight: 600;
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
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }
    .btn-secondary:hover {
      background: #f5f7fa;
    }
  `]
})
export class ListingCreateComponent implements OnInit {
  listingForm: FormGroup;
  myArtworks: any[] = [];
  selectedArtwork: any = null;
  loadingArtworks = false;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private http: HttpClient,
    private router: Router
  ) {
    this.listingForm = this.fb.group({
      artworkId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      paymentToken: ['USDC', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadMyArtworks();
  }

  loadMyArtworks(): void {
    this.loadingArtworks = true;
    
    // Call Core API to get user's artworks
    this.http.get<any[]>(`${environment.coreApiUrl}/users/artworks`).subscribe({
      next: (artworks) => {
        // Filter only tokenized artworks (have tokenId)
        this.myArtworks = artworks.filter(a => a.tokenId);
        this.loadingArtworks = false;
      },
      error: (err) => {
        this.error = 'Failed to load your artworks.';
        this.loadingArtworks = false;
      }
    });
  }

  onArtworkSelect(): void {
    const artworkId = this.listingForm.value.artworkId;
    this.selectedArtwork = this.myArtworks.find(a => a.id === artworkId);
  }

  onSubmit(): void {
    if (this.listingForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const request = {
      artworkId: this.listingForm.value.artworkId,
      price: parseFloat(this.listingForm.value.price),
      paymentToken: this.listingForm.value.paymentToken,
      description: this.listingForm.value.description
    };

    this.listingService.create(request).subscribe({
      next: (listing) => {
        this.success = 'Listing created successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/listings', listing.id]), 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create listing. Please try again.';
        this.loading = false;
      }
    });
  }
}
