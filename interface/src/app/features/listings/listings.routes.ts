import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const LISTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./browse/listings-browse.component').then(m => m.ListingsBrowseComponent)
  },
  {
    path: 'create',
    canActivate: [authGuard],
    loadComponent: () => import('./create/listing-create.component').then(m => m.ListingCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./details/listing-details.component').then(m => m.ListingDetailsComponent)
  },
  {
    path: ':id/purchase',
    canActivate: [authGuard],
    loadComponent: () => import('./purchase/listing-purchase.component').then(m => m.ListingPurchaseComponent)
  }
];
