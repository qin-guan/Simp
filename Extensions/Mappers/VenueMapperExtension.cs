using System;
using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class VenueMapperExtension
    {
        public static VenueDto ToDto(this Venue venue)
        {
            return new()
            {
                Id = venue.Id.ToString(),
                Name = venue.Name
            };
        }

        public static Venue ToVenue(this VenueDto venueDto)
        {
            var validId = Guid.TryParse(venueDto.Id, out var id);
            if (!validId && !string.IsNullOrWhiteSpace(venueDto.Id)) throw new Exception("Invalid Venue.Id");

            return new Venue
            {
                Id = id,
                Name = venueDto.Name
            };
        }
    }
}