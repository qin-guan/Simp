using System;
using System.Threading.Tasks;
using Simp.Data;
using Simp.Models;

namespace Simp.Services
{
    public class VenueService
    {
        private readonly ApplicationDbContext _dbContext;

        public VenueService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Venue> FindAsync(Guid guid)
        {
            return await _dbContext.Venues.FindAsync(guid);
        }

        public async Task<Venue> CreateAsync(Venue venue)
        {
            var newVenue = await _dbContext.Venues.AddAsync(venue);
            await _dbContext.SaveChangesAsync();
            return newVenue.Entity;
        }

        public async Task<Venue> LoadLessonsAsync(Venue venue)
        {
            await _dbContext.Entry(venue).Collection(v => v.Lessons).LoadAsync();
            return venue;
        }

        public async Task DeleteVenueAsync(Venue venue)
        {
            _dbContext.Venues.Remove(venue);
            await _dbContext.SaveChangesAsync();
        }
    }
}