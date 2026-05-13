# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["TravelManagementAPI.csproj", "./"]
RUN dotnet restore "TravelManagementAPI.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "TravelManagementAPI.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "TravelManagementAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Prevent Status 139 crashes on some Linux hosts
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true

# Create uploads folder
RUN mkdir -p /app/wwwroot/uploads

# Expose port 80 (Render uses 80/10000 by default)
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "TravelManagementAPI.dll"]
