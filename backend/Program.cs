// File: backend/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TravelManagementAPI.Data;
using TravelManagementAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"]
    };
});

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.Users.Any())
    {
        dbContext.Users.AddRange(
            new TravelManagementAPI.Models.User
            {
                Name = "Admin User",
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Admin"
            },
            new TravelManagementAPI.Models.User
            {
                Name = "Manager User",
                Email = "manager@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Manager"
            },
            new TravelManagementAPI.Models.User
            {
                Name = "Employee User",
                Email = "employee@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Employee"
            },
            new TravelManagementAPI.Models.User
            {
                Name = "Finance User",
                Email = "finance@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Finance"
            }
        );
        dbContext.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads"
});
app.UseCors("AllowAngularClient");
app.UseMiddleware<JwtMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
