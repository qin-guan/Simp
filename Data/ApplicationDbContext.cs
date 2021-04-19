using System;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Simp.Models;

namespace Simp.Data
{
    public class ApplicationDbContext: SimpApiAuthorizationDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(
            DbContextOptions options,
            IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>()
                .HasMany(au => au.AttendedLessons)
                .WithMany(l => l.Attendees);
            builder.Entity<ApplicationUser>()
                .HasMany(au => au.TeachingLessons)
                .WithMany(l => l.Teachers);
            builder.Entity<ApplicationUser>()
                .HasMany(au => au.CompletedAssignments)
                .WithMany(a => a.CompletedUsers);
            builder.Entity<ApplicationUser>()
                .HasMany(au => au.CreatedAssignments)
                .WithOne(a => a.Creator);
        }

        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<AttendanceVerification> AttendanceVerifications { get; set; }
    }
}