using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Simp.Data;
using Simp.Models;
using Simp.Services;

namespace Simp.Authorization
{
    public class IsOwnerAuthorizationHandler :
        AuthorizationHandler<IsOwnerRequirement, Classroom>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public IsOwnerAuthorizationHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
            IsOwnerRequirement requirement,
            Classroom classroom
        )
        {
            if (context.User.Identity == null) return;
            
            var user = await _userManager.FindByIdAsync(context.User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (user is null) return;

            var claims = await _userManager.GetClaimsAsync(user);
            if (claims.Any(c => c.Type == $"Classroom/{classroom.Id.ToString()}/Owner"))
            {
                context.Succeed(requirement);
            }
        }
    }
}