using System;
using IdentityModel;
using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class AssignmentMapperExtension
    {
        public static AssignmentDto ToDto(this Assignment assignment)
        {
            return new()
            {
                Id = assignment.ToString(),
                Name = assignment.Name,
                Description = assignment.Description,
                DueDate = assignment.DueDate.ToEpochTime(),
                Points = assignment.Points
            };
        }

        public static Assignment ToAssignment(this AssignmentDto assignmentDto)
        {
            var validId = Guid.TryParse(assignmentDto.Id, out var guid);
            if (!validId && !string.IsNullOrWhiteSpace(assignmentDto.Id)) throw new Exception("Invalid Assignment.Id");

            return new Assignment
            {
                Id = guid,
                Name = assignmentDto.Name,
                Description = assignmentDto.Description,
                DueDate = DateTimeOffset.FromUnixTimeMilliseconds(assignmentDto.DueDate).DateTime,
                Points = assignmentDto.Points
            };
        }
    }
}