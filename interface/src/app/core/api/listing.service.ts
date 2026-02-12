import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MarketplaceListing, ListingsResponse, CreateListingRequest, SearchListingsRequest } from '../../shared/models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  create(request: CreateListingRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  getAll(search?: SearchListingsRequest): Observable<ListingsResponse> {
    let params = new HttpParams();
    
    if (search?.category) params = params.set('category', search.category);
    if (search?.minPrice) params = params.set('minPrice', search.minPrice.toString());
    if (search?.maxPrice) params = params.set('maxPrice', search.maxPrice.toString());
    if (search?.page) params = params.set('page', search.page.toString());
    if (search?.pageSize) params = params.set('pageSize', search.pageSize.toString());

    return this.http.get<ListingsResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<MarketplaceListing> {
    return this.http.get<MarketplaceListing>(`${this.apiUrl}/${id}`);
  }

  cancel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMyListings(): Observable<MarketplaceListing[]> {
    return this.http.get<MarketplaceListing[]>(`${environment.apiUrl}/users/listings`);
  }
}
