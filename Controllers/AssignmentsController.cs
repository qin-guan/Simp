﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Simp.Data;
using Simp.Dtos;
using Simp.Extensions.Mappers;
using Simp.Filters;
using Simp.Models;
using Simp.Services;

namespace Simp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("Classrooms/{classroomId:guid}/Lessons/{lessonId:guid}/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly AssignmentService _assignmentService;
        private readonly ClassroomService _classroomService;
        private readonly LessonService _lessonService;
        private readonly IAuthorizationService _authorizationService;
        private readonly ApplicationDbContext _dbContext;

        public AssignmentsController(AssignmentService assignmentService, ClassroomService classroomService, LessonService lessonService, IAuthorizationService authorizationService, ApplicationDbContext dbContext)
        {
            _assignmentService = assignmentService;
            _classroomService = classroomService;
            _lessonService = lessonService;
            _authorizationService = authorizationService;
            _dbContext = dbContext;
        }

        [HttpGet]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetLessonAssignments(
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
                var assignments = await _assignmentService.FindByLessonAsync(lesson);

                return Ok(assignments.Select(a => a.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
        
        [HttpGet("{assignmentId:guid}")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<AssignmentDto>> GetAssignment(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId,
            [FromRoute] Guid assignmentId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");
                if (!authorization.Succeeded) return Forbid();

                var assignment = await _assignmentService.FindAsync(assignmentId);
                
                return Ok(assignment.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
        
        [HttpGet("{assignmentId:guid}/Submissions")]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<SubmissionDto>> GetSubmission(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId,
            [FromRoute] Guid assignmentId
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");
        
            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");
                if (!authorization.Succeeded) return Forbid();

                var assignment = await _dbContext.Assignments.Where(a => a.Id == assignmentId)
                    .Include(a => a.Submissions.Where(s => s.User.Id == user.Id)).SingleAsync();
        
                return Ok(assignment.Submissions.Select(s => s.ToDto()));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }

        [HttpPost]
        [ServiceFilter(typeof(AddUserDataServiceFilter))]
        public async Task<ActionResult<AssignmentDto>> CreateLessonAssignmentAsync(
            [FromRoute] Guid classroomId,
            [FromRoute] Guid lessonId,
            [FromBody] AssignmentDto assignmentDto
        )
        {
            var user = (ApplicationUser) HttpContext.Items["ApplicationUser"];
            Debug.Assert(user != null, nameof(user) + " != null");

            try
            {
                var classroom = await _classroomService.FindAsync(classroomId);
                var authorization = await _authorizationService.AuthorizeAsync(User, classroom, "IsInClassroom");
                if (!authorization.Succeeded) return Forbid();

                var assignment = await _assignmentService.CreateAsync(assignmentDto.ToAssignment());
                var lesson = await _lessonService.FindAsync(lessonId);
                await _lessonService.AddAssignmentAsync(lesson, assignment);

                return Ok(assignment.ToDto());
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest();
            }
        }
    }
}