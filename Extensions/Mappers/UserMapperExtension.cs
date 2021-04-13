using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class UserMapperExtension
    {
        public static UserDto ToDto(this ApplicationUser user)
        {
            return new UserDto
            {
                Id = user.Id.ToString(),
                Name = user.UserName,
            };
        }
    }
}