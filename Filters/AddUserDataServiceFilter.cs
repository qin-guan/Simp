using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Filters;

using Simp.Models;

namespace Simp.Filters
{
    public class AddUserDataServiceFilter : IAsyncActionFilter
    {
        private readonly UserManager<ApplicationUser> _userManager;
        public AddUserDataServiceFilter(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }
        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            if (context.HttpContext.User.HasClaim(claim => claim.Type == ClaimTypes.NameIdentifier))
            {
                var user = await _userManager.FindByIdAsync(
                    context.HttpContext.User.Claims.Single(claim =>
                        claim.Type == ClaimTypes.NameIdentifier
                    ).Value
                );

                context.HttpContext.Items.Add("ApplicationUser", user);
            }

            await next();
        }

    }
}