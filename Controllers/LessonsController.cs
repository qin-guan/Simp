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
    [Route("[controller]/{classroomId}")]
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
            [FromRoute] string classroomId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(guid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lessons = await _lessonService.FindByClassroomAsync(guid);
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

        [HttpGet("{lessonId}")]
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

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);
                await _lessonService.LoadTeachersAsync(lesson);

                return Ok(lesson.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpGet("{lessonId}/Code")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<int>> GetAttendanceCode(
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

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);

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
        [HttpGet("{lessonId}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult> GetUserLessonAttendance(
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

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);
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
        [HttpGet("{lessonId}/Attendees")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAttendees(
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

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);
                await _lessonService.LoadAttendeesAsync(lesson);

                return Ok(lesson.Attendees.ToList().Select(a => a.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
        
        [HttpGet("{lessonId}/Venue")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetVenue(
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

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);
                await _lessonService.LoadVenueAsync(lesson);

                if (lesson.Venue is null)
                {
                    return Ok();
                }

                return Ok(lesson.Venue.ToDto());
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
            [FromRoute] string classroomId,
            [FromBody] LessonDto lessonDto
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(guid);

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

        [HttpPost("{lessonId}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> CreateUserAttendance(
            [FromRoute] string classroomId,
            [FromRoute] string lessonId,
            [FromBody] int code
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validClassroomId = Guid.TryParse(classroomId, out var classroomGuid);
            if (!validClassroomId) return BadRequest();

            var validLessonId = Guid.TryParse(lessonId, out var lessonGuid);
            if (!validLessonId) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);

                var success = await _attendanceService.CreateUserAttendanceAsync(lesson, user, code);

                return Ok(success);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpDelete("{lessonId}/Attendance")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> RemoveUserAttendence(
            [FromRoute] string classroomId,
            [FromRoute] string lessonId,
            [FromBody] string userId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validClassroomId = Guid.TryParse(classroomId, out var classroomGuid);
            if (!validClassroomId) return BadRequest();

            var validLessonId = Guid.TryParse(lessonId, out var lessonGuid);
            if (!validLessonId) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");

                if (!authorization.Succeeded) return Forbid();

                var lesson = await _lessonService.FindAsync(lessonGuid);
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