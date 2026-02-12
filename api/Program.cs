using Microsoft.EntityFrameworkCore;
using ArtMarketplace.Api.Data;
using ArtMarketplace.Api.Services;
using ArtTokenization.Shared.Client;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MarketplaceDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0))));

// HTTP Client for Tokenization API
builder.Services.AddHttpClient<ITokenizationApiClient, TokenizationApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["TokenizationApi:BaseUrl"] ?? "http://localhost:5001");
});

// Background Services
builder.Services.AddHostedService<MarketplaceEventListenerService>();
builder.Services.AddHostedService<ListingValidationService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
