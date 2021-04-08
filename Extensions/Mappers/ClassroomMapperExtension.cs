using System;
using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class ClassroomMapperExtension
    {
        public static ClassroomDto ToDto(this Classroom classroom)
        {
            return new ClassroomDto
            {
                Id = classroom.ToString(),
                Name = classroom.Name
            };
        }

        public static Classroom ToClassroom(this ClassroomDto classroomDto)
        {
            var validId = Guid.TryParse(classroomDto.Id, out var id);
            if (!validId && !string.IsNullOrWhiteSpace(classroomDto.Id)) throw new Exception("Invalid Classroom.Id");

            return new Classroom
            {
                Id = id,
                Name = classroomDto.Name
            };
        }
    }
}