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
    public class IsInClassroomAuthorizationHandler :
        AuthorizationHandler<IsInClassroomRequirement, Classroom>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ClassroomService _classroomService;

        public IsInClassroomAuthorizationHandler(
            UserManager<ApplicationUser> userManager,
            ClassroomService classroomService
        )
        {
            _userManager = userManager;
            _classroomService = classroomService;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
            IsInClassroomRequirement requirement,
            Classroom classroom
        )
        {
            if (context.User.Identity == null) return;

            var user = await _userManager.FindByIdAsync(context.User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (user is null) return;

            var classrooms = await _classroomService.FindByUserAsync(user);

            if (classrooms.Any(c => c.Id == classroom.Id)) context.Succeed(requirement);
        }
    }
}