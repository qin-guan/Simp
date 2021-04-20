using System;
using System.Linq;
using System.Collections.Generic;
using System.Diagnostics;
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
    [Route("Classrooms/{classroomId:guid}/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly ClassroomService _classroomService;
        private readonly LessonService _lessonService;
        private readonly VenueService _venueService;

        public VenuesController(IAuthorizationService authorizationService, ClassroomService classroomService, LessonService lessonService, VenueService venueService)
        {
            _authorizationService = authorizationService;
            _classroomService = classroomService;
            _lessonService = lessonService;
            _venueService = venueService;
        }

        [HttpGet]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues([FromRoute] Guid classroomId)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                await _classroomService.LoadVenuesAsync(classroom);

                return Ok(classroom.Venues.Select(v => v.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost("{venueId:guid}/Lessons/{lessonId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<VenueDto>> AddVenueToLesson(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid venueId,
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

                var venue = await _venueService.FindAsync(venueId);
                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.AddVenueAsync(lesson, venue);

                return Ok(venue.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<VenueDto>> CreateVenue(
            [FromRoute] Guid classroomId,
            [FromBody] VenueDto venueDto)
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                var venue = venueDto.ToVenue();
                venue = await _classroomService.CreateVenueAsync(venue);
                await _classroomService.AddVenueAsync(classroom, venue);

                return Ok(venue.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpDelete("{venueId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> DeleteVenue(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid venueId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                var venue = await _venueService.FindAsync(venueId);
                await _venueService.LoadLessonsAsync(venue);

                if (venue.Lessons.Count > 0)
                {
                    return Conflict();
                }
                
                await _classroomService.DeleteVenueAsync(venue);

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