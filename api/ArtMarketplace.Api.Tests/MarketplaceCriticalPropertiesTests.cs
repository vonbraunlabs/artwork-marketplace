using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using ArtMarketplace.Api.Controllers;
using ArtMarketplace.Api.Models;

namespace ArtMarketplace.Api.Tests;

/// <summary>
/// Critical Property Tests for Marketplace - Real validation
/// These tests will FAIL if properties are violated by future changes
/// </summary>
public class MarketplaceCriticalPropertiesTests
{
    [Fact]
    public void Property11_ListingsCreateEndpoint_RequiresAuthorization()
    {
        var method = typeof(ListingsController).GetMethod("CreateListing");
        var hasAuthorize = method?.GetCustomAttribute<AuthorizeAttribute>() != null ||
                          typeof(ListingsController).GetCustomAttribute<AuthorizeAttribute>() != null;
        
        Assert.True(hasAuthorize, "POST /api/listings must require [Authorize]");
    }

    [Fact]
    public void Property11_ListingsCancelEndpoint_RequiresAuthorization()
    {
        var method = typeof(ListingsController).GetMethod("CancelListing");
        var hasAuthorize = method?.GetCustomAttribute<AuthorizeAttribute>() != null ||
                          typeof(ListingsController).GetCustomAttribute<AuthorizeAttribute>() != null;
        
        Assert.True(hasAuthorize, "DELETE /api/listings/{id} must require [Authorize]");
    }

    [Fact]
    public void Property12_MarketplaceListingModel_HasTokenIdField()
    {
        var tokenIdProperty = typeof(MarketplaceListing).GetProperty("TokenId");
        
        Assert.NotNull(tokenIdProperty);
        Assert.Equal(typeof(string), tokenIdProperty.PropertyType);
    }

    [Fact]
    public void Property13_MarketplaceListingModel_HasPriceField()
    {
        var priceProperty = typeof(MarketplaceListing).GetProperty("Price");
        
        Assert.NotNull(priceProperty);
        Assert.True(priceProperty.PropertyType == typeof(decimal) || 
                   priceProperty.PropertyType == typeof(double),
                   "MarketplaceListing must have Price field");
    }

    [Fact]
    public void Property16_MarketplaceListingModel_HasIsActiveField()
    {
        var isActiveProperty = typeof(MarketplaceListing).GetProperty("IsActive");
        
        Assert.NotNull(isActiveProperty);
        Assert.Equal(typeof(bool), isActiveProperty.PropertyType);
    }

    [Fact]
    public void Property16_MarketplaceListingModel_HasCancelledAtField()
    {
        var cancelledAtProperty = typeof(MarketplaceListing).GetProperty("CancelledAt");
        
        Assert.NotNull(cancelledAtProperty);
    }

    [Fact]
    public void Property51_MarketplaceEventListenerService_Exists()
    {
        var assembly = typeof(ListingsController).Assembly;
        var serviceType = assembly.GetTypes()
            .FirstOrDefault(t => t.Name.Contains("MarketplaceEventListener"));
        
        Assert.NotNull(serviceType);
    }

    [Fact]
    public void Property53_ListingValidationService_Exists()
    {
        var assembly = typeof(ListingsController).Assembly;
        var serviceType = assembly.GetTypes()
            .FirstOrDefault(t => t.Name.Contains("ListingValidation"));
        
        Assert.NotNull(serviceType);
    }

    [Fact]
    public void Property52_MarketplaceListingModel_HasSoldAtField()
    {
        var soldAtProperty = typeof(MarketplaceListing).GetProperty("SoldAt");
        
        Assert.NotNull(soldAtProperty);
    }

    [Fact]
    public void Property15_ListingsController_HasSearchEndpoint()
    {
        var methods = typeof(ListingsController).GetMethods(BindingFlags.Public | BindingFlags.Instance);
        var hasSearchOrGetListings = methods.Any(m => 
            m.Name.Contains("Search") || 
            (m.Name == "GetListings" && m.GetParameters().Length > 0));
        
        Assert.True(hasSearchOrGetListings, "ListingsController must have search/filter capability");
    }

    [Fact]
    public void Property12_MarketplaceListingModel_HasArtworkIdField()
    {
        var artworkIdProperty = typeof(MarketplaceListing).GetProperty("ArtworkId");
        
        Assert.NotNull(artworkIdProperty);
    }
}

