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
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Database migration and seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.Users.Any())
    {
        dbContext.Users.AddRange(
            new TravelManagementAPI.Models.User
            {
                EmployeeId = "EMP001",
                Username = "admin",
                Name = "Admin User",
                Email = "admin@company.com",
                PhoneNumber = "9876543210",
                Department = "Administration",
                Designation = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Admin",
                IsActive = true,
                JoiningDate = new DateTime(2023, 1, 15)
            },
            new TravelManagementAPI.Models.User
            {
                EmployeeId = "EMP002",
                Username = "rahul",
                Name = "Rahul Sharma",
                Email = "rahul.sharma@company.com",
                PhoneNumber = "9876543211",
                Department = "Engineering",
                Designation = "Engineering Manager",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Manager",
                IsActive = true,
                JoiningDate = new DateTime(2023, 3, 10)
            },
            new TravelManagementAPI.Models.User
            {
                EmployeeId = "EMP003",
                Username = "priya",
                Name = "Priya Patel",
                Email = "priya.patel@company.com",
                PhoneNumber = "9876543212",
                Department = "Engineering",
                Designation = "Software Developer",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Employee",
                IsActive = true,
                JoiningDate = new DateTime(2024, 6, 1)
            },
            new TravelManagementAPI.Models.User
            {
                EmployeeId = "EMP004",
                Username = "finance",
                Name = "Finance Dept",
                Email = "finance@company.com",
                PhoneNumber = "9876543213",
                Department = "Finance",
                Designation = "Finance Manager",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Finance",
                IsActive = true,
                JoiningDate = new DateTime(2024, 8, 15)
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
app.UseCors("AllowClient");
app.UseMiddleware<JwtMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
