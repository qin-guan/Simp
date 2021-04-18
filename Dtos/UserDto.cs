using System.ComponentModel.DataAnnotations;

namespace Simp.Dtos
{
    public class UserDto
    {
        [Required]
        public string Id { get; set; }
        public string Name { get; set; }
    }
}