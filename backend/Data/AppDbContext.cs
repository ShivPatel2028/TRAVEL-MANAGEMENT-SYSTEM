// File: backend/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using TravelManagementAPI.Models;

namespace TravelManagementAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<TravelRequest> TravelRequests { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<RequestLog> RequestLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<TravelRequest>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.TravelRequests)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.TravelRequest)
                      .WithMany(t => t.Expenses)
                      .HasForeignKey(e => e.TravelRequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Bill>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.TravelRequest)
                      .WithMany(t => t.Bills)
                      .HasForeignKey(e => e.TravelRequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RequestLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.TravelRequest)
                      .WithMany(t => t.Logs)
                      .HasForeignKey(e => e.TravelRequestId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
