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
                Id = assignment.Id.ToString(),
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

            if (assignmentDto.Points is > 100 or < 0)
                throw new Exception("Invalid Assignment.Points");

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