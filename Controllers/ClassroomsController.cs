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

        public ClassroomsController(ClassroomService classroomService, UserManager<ApplicationUser> userManager)
        {
            _classroomService = classroomService;
            _userManager = userManager;
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