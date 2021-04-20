using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
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
    [Route("Classrooms/{classroomId:guid}/[controller]")]
    public class LessonsController : ControllerBase
    {
        private readonly LessonService _lessonService;
        private readonly AttendanceService _attendanceService;
        private readonly ClassroomService _classroomService;

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuthorizationService _authorizationService;

        public LessonsController(
            LessonService lessonService,
            ClassroomService classroomService,
            AttendanceService attendanceService,
            UserManager<ApplicationUser> userManager,
            IAuthorizationService authorizationService
        )
        {
            _lessonService = lessonService;
            _classroomService = classroomService;
            _attendanceService = attendanceService;

            _userManager = userManager;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetLessons(
            [FromRoute] Guid classroomId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lessons = await _lessonService.FindByClassroomAsync(classroomId);
                lessons = await Task.WhenAll(lessons.Select(async l => await _lessonService.LoadTeachersAsync(l)));
                var lessonDtos = lessons.Select(l => l.ToDto());

                return Ok(lessonDtos);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{lessonId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetLesson(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.LoadTeachersAsync(lesson);

                return Ok(lesson.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{lessonId:guid}/Code")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<int>> GetAttendanceCode(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);

                var verificationCode = await _attendanceService.GetVerificationCodeAsync(lesson);

                return Ok(verificationCode.Code);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        /// <summary>
        /// This gets the individual users attendance for the lesson
        /// </summary>
        /// <param name="classroomId"></param>
        /// <param name="lessonId"></param>
        /// <returns></returns>
        [HttpGet("{lessonId:guid}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult> GetUserLessonAttendance(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.LoadAttendeesAsync(lesson);

                return Ok(lesson.Attendees.Contains(user));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        /// <summary>
        /// This gets the lessons attendees (users who registered attendance)
        /// </summary>
        /// <param name="classroomId"></param>
        /// <param name="lessonId"></param>
        /// <returns></returns>
        [HttpGet("{lessonId:guid}/Attendees")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAttendees(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.LoadAttendeesAsync(lesson);

                return Ok(lesson.Attendees.ToList().Select(a => a.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
        
        [HttpGet("{lessonId:guid}/Venue")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetVenue(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.LoadVenueAsync(lesson);

                return Ok(lesson.Venue is null ? new Venue().ToDto() : lesson.Venue.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
        
        [HttpPost]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<LessonDto>> CreateLesson(
            [FromRoute] Guid classroomId,
            [FromBody] LessonDto lessonDto
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");
            
            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = lessonDto.ToLesson();
                lesson = await _lessonService.CreateAsync(lesson);

                await _classroomService.AddLessonAsync(classroom, lesson);
                lesson = await _lessonService.LoadTeachersAsync(lesson);

                await _lessonService.AddTeacherAsync(lesson, user);

                return Ok(lesson.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost("{lessonId:guid}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> CreateUserAttendance(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId,
            [FromBody] int code
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(classroomId);

                var success = await _attendanceService.CreateUserAttendanceAsync(lesson, user, code);

                return Ok(success);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpDelete("{lessonId:guid}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> RemoveUserAttendence(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId,
            [FromBody] string userId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonId);
                var targetUser = await _userManager.FindByIdAsync(userId);

                await _attendanceService.DeleteUserAttendanceAsync(lesson, targetUser);

                return Ok();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
    }
}