using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Simp.Dtos;
using Simp.Extensions.Mappers;
using Simp.Filters;
using Simp.Models;
using Simp.Services;

namespace Simp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ClassroomsController : ControllerBase
    {
        private readonly ClassroomService _classroomService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuthorizationService _authorizationService;

        public ClassroomsController(ClassroomService classroomService, UserManager<ApplicationUser> userManager,
            IAuthorizationService authorizationService)
        {
            _classroomService = classroomService;
            _userManager = userManager;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<ClassroomDto>>> GetClassrooms()
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classrooms = await _classroomService.FindByUserAsync(user);

                return Ok(classrooms.Select(classroom => classroom.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{classroomId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<ClassroomDto>> GetClassroom([FromRoute] Guid classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classrooms = (await _classroomService.FindByUserAsync(user)).ToList();
                if (classrooms.All(c => c.Id != classroomId)) return Forbid();

                return Ok(classrooms.SingleOrDefault(c => c.Id == classroomId).ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{classroomId:guid}/Users")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetClassroomUsers([FromRoute] Guid classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                await _classroomService.LoadUsersAsync(classroom);

                return Ok(classroom.Users.ToList().Select(u => u.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{classroomId:guid}/Privileged")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> GetIsClassroomOwner([FromRoute] Guid classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                return Ok(authorization.Succeeded);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{classroomId:guid}/Code")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<int>> GetClassroomJoinCode([FromRoute] Guid classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                return Ok(classroom.JoinCode);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("Join/{joinCode:int}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<ClassroomDto>> JoinClassroom([FromRoute] int joinCode)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            if (joinCode.ToString().Length != 5) return BadRequest();

            try
            {
                var userClassrooms = await _classroomService.FindByUserAsync(user);
                var userInClassroom = userClassrooms.Where(c => c.JoinCode == joinCode).ToList();
                if (userInClassroom.Any()) return Ok(userInClassroom.SingleOrDefault().ToDto());

                var classrooms = (await _classroomService.FindByJoinCodeAsync(joinCode)).ToList();
                switch (classrooms.Count)
                {
                    case 0:
                        return NotFound();
                    case > 1:
                        return Conflict();
                }

                var classroom = classrooms.FirstOrDefault();
                await _classroomService.AddUserAsync(classroom, user);

                return Ok(classroom.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<ClassroomDto>> CreateClassroom(
            [FromBody] ClassroomDto classroomDto
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = classroomDto.ToClassroom();
                var newClassroom = await _classroomService.CreateAsync(classroom);

                await _classroomService.AddUserAsync(newClassroom, user);
                await _userManager.AddClaimAsync(user, new Claim($"Classroom/{classroom.Id.ToString()}/Owner", "true"));

                return Ok(newClassroom.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpDelete("{classroomId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> DeleteClassroom(
            [FromRoute] Guid classroomId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();
                
                await _classroomService.DeleteAsync(classroom);

                return Ok(true);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
    }
}