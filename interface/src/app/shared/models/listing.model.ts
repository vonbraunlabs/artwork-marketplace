export interface MarketplaceListing {
  listingId: string;
  artworkId: string;
  tokenId: string;
  sellerUserId: string;
  sellerWalletAddress: string;
  price: number;
  paymentToken: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  soldAt?: string;
  cancelledAt?: string;
  artwork?: {
    title: string;
    description?: string;
    artistName: string;
    images?: string[];
  };
}

export interface CreateListingRequest {
  artworkId: string;
  tokenId: string;
  price: number;
  paymentToken: string;
  category?: string;
}

export interface SearchListingsRequest {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}
