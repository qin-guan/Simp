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
    public class LessonsController : ControllerBase
    {
        private readonly LessonService _lessonService;
        private readonly ClassroomService _classroomService;

        private readonly IAuthorizationService _authorizationService;

        public LessonsController(LessonService lessonService, ClassroomService classroomService,
            IAuthorizationService authorizationService)
        {
            _lessonService = lessonService;
            _classroomService = classroomService;

            _authorizationService = authorizationService;
        }

        [HttpGet("{classroomId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetLessons(
            [FromRoute] string classroomId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var classroom = await _classroomService.FindAsync(guid);
            var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

            if (!authorization.Succeeded) return Forbid();
            
            var lessons = await _lessonService.FindByClassroomAsync(guid);
            lessons = await Task.WhenAll(lessons.Select(async l => await _lessonService.LoadTeachersAsync(l)));
            var lessonDtos = lessons.Select(l => l.ToDto());

            return Ok(lessonDtos);
        }
        
        [HttpGet("{classroomId}/{lessonId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetLesson(
            [FromRoute] string classroomId,
            [FromRoute] string lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validClassroomId = Guid.TryParse(classroomId, out var classroomGuid);
            if (!validClassroomId) return BadRequest();

            var validLessonId = Guid.TryParse(lessonId, out var lessonGuid);
            if (!validLessonId) return BadRequest();
            
            var classroom = await _classroomService.FindAsync(classroomGuid);
            var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

            if (!authorization.Succeeded) return Forbid();

            var lesson = await _lessonService.FindAsync(lessonGuid);

            return Ok(lesson.ToDto());
        }

        [HttpPost("{classroomId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<LessonDto>> CreateLesson(
            [FromRoute] string classroomId,
            [FromBody] LessonDto lessonDto
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var classroom = await _classroomService.FindAsync(guid);

            try
            {
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = lessonDto.ToLesson();
                lesson = await _lessonService.CreateAsync(lesson);
                
                await _classroomService.AddLessonAsync(classroom, lesson);
                lesson = await _lessonService.LoadTeachersAsync(lesson);
                
                return Ok(lesson.ToDto());
            }
            catch (Exception e)
            {
                return BadRequest();
            }
        }
    }
}