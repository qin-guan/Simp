using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
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

        public ClassroomsController(ClassroomService classroomService)
        {
            _classroomService = classroomService;
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

                await _classroomService.AddUser(newClassroom, user);
                
                return Ok(newClassroom.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
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