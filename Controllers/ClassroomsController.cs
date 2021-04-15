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

            var classrooms = await _classroomService.FindByUserAsync(user);

            return Ok(classrooms.Select(classroom => classroom.ToDto()));
        }

        [HttpGet("{classroomId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<ClassroomDto>> GetClassroom([FromRoute] string classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var classrooms = (await _classroomService.FindByUserAsync(user)).ToList();
            if (classrooms.All(c => c.Id != guid)) return Forbid();

            return Ok(classrooms.SingleOrDefault(c => c.Id == guid).ToDto());
        }

        [HttpGet("{classroomId}/Owner")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult> GetIsClassroomOwner([FromRoute] string classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var classroom = await _classroomService.FindAsync(guid);

            var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
            if (!authorization.Succeeded) return Forbid();

            return Ok();
        }

        [HttpGet("{classroomId}/Code")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<int>> GetClassroomJoinCode([FromRoute] string classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var classroom = await _classroomService.FindAsync(guid);

            var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
            if (!authorization.Succeeded) return Forbid();

            return Ok(classroom.JoinCode);
        }

        [HttpGet("Join/{joinCode}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<ClassroomDto>> JoinClassroom([FromRoute] string joinCode)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validCode = int.TryParse(joinCode, out var code);
            if (!validCode) return BadRequest();
            if (code.ToString().Length != 5) return BadRequest();

            var userClassrooms = await _classroomService.FindByUserAsync(user);
            var userInClassroom = userClassrooms.Where(c => c.JoinCode == code).ToList();
            if (userInClassroom.Any()) return Ok(userInClassroom.SingleOrDefault().ToDto());

            var classrooms = (await _classroomService.FindByJoinCodeAsync(code)).ToList();
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
            catch
            {
                return BadRequest();
            }
        }

        [HttpDelete("{classroomId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult> DeleteClassroom(
            [FromRoute] string classroomId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            await _classroomService.DeleteAsync(guid);

            return Ok();
        }
    }
}