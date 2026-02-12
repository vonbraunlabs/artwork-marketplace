# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared projects
COPY ["shared/ArtTokenization.Shared.Models/ArtTokenization.Shared.Models.csproj", "shared/ArtTokenization.Shared.Models/"]
COPY ["shared/ArtTokenization.Shared.Client/ArtTokenization.Shared.Client.csproj", "shared/ArtTokenization.Shared.Client/"]

# Copy main project
COPY ["marketplace/api/ArtMarketplace.Api/ArtMarketplace.Api.csproj", "marketplace/api/ArtMarketplace.Api/"]
RUN dotnet restore "marketplace/api/ArtMarketplace.Api/ArtMarketplace.Api.csproj"

# Copy everything and build
COPY shared/ shared/
COPY marketplace/api/ marketplace/api/
WORKDIR "/src/marketplace/api/ArtMarketplace.Api"
RUN dotnet build "ArtMarketplace.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "ArtMarketplace.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5002
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ArtMarketplace.Api.dll"]
