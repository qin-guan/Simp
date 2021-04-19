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
    [Route("Classrooms/{classroomId}/Venues")]
    public class VenuesController : ControllerBase
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly ClassroomService _classroomService;
        private readonly LessonService _lessonService;

        public VenuesController(IAuthorizationService authorizationService, ClassroomService classroomService, LessonService lessonService)
        {
            _authorizationService = authorizationService;
            _classroomService = classroomService;
            _lessonService = lessonService;
        }

        [HttpGet]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues([FromRoute] string classroomId)
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

                await _classroomService.LoadVenuesAsync(classroom);

                return Ok(classroom.Venues.Select(v => v.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost("{venueId}/Lessons/{lessonId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<VenueDto>> AddVenueToLesson(
            [FromRoute] string classroomId,
            [FromRoute] string venueId,
            [FromRoute] string lessonId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var guid);
            if (!validId) return BadRequest();

            var validVenueId = Guid.TryParse(venueId, out var venueGuid);
            if (!validVenueId) return BadRequest();

            var validLessonGuid = Guid.TryParse(lessonId, out var lessonGuid);
            if (!validLessonGuid) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(guid);

                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                var venue = await _classroomService.FindVenueAsync(venueGuid);
                var lesson = await _lessonService.FindAsync(lessonGuid);
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
            [FromRoute] string classroomId,
            [FromBody] VenueDto venueDto)
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

        [HttpDelete("{venueId}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<bool>> DeleteVenue(
            [FromRoute] string classroomId,
            [FromRoute] string venueId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            var validId = Guid.TryParse(classroomId, out var classroomGuid);
            if (!validId) return BadRequest();

            var validVenueId = Guid.TryParse(venueId, out var venueGuid);
            if (!validVenueId) return BadRequest();

            try
            {
                var classroom = await _classroomService.FindAsync(classroomGuid);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsOwner");
                if (!authorization.Succeeded) return Forbid();

                var venue = await _classroomService.FindVenueAsync(venueGuid);

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