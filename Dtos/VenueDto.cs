using System.ComponentModel.DataAnnotations;

namespace Simp.Dtos
{
    public class VenueDto
    {
        public string Id { get; set; }
        [Required] public string Name { get; set; }
    }
}