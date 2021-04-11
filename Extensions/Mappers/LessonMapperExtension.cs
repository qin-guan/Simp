using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using IdentityModel;
using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class LessonMapperExtension
    {
        public static LessonDto ToDto(this Lesson lesson)
        {
            return new LessonDto
            {
                Id = lesson.Id.ToString(),
                Name = lesson.Name,
                Description = lesson.Description,
                LessonType = lesson.LessonType.ToString(),
                StartDate = lesson.StartDate.ToEpochTime(),
                EndDate = lesson.EndDate.ToEpochTime(),
                MeetingUri = lesson.MeetingUri.ToString(),
                Teachers = lesson.Teachers is null
                    ? new List<string>()
                    : lesson.Teachers.ToList().Select(t => t.Id.ToString())
            };
        }

        public static Lesson ToLesson(this LessonDto lessonDto)
        {
            var validType = Enum.TryParse(lessonDto.LessonType, out LessonType lessonType);
            if (!validType) throw new Exception("Invalid Lesson.LessonType");

            var validId = Guid.TryParse(lessonDto.Id, out var id);
            if (!validId && !string.IsNullOrWhiteSpace(lessonDto.Id)) throw new Exception("Invalid Classroom.Id");

            return new Lesson
            {
                Id = id,
                Name = lessonDto.Name,
                Description = lessonDto.Description,
                LessonType = lessonType,
                StartDate = DateTimeOffset.FromUnixTimeMilliseconds(lessonDto.StartDate).DateTime,
                EndDate = DateTimeOffset.FromUnixTimeMilliseconds(lessonDto.EndDate).DateTime,
                MeetingUri = Uri.IsWellFormedUriString(lessonDto.MeetingUri, UriKind.Absolute)
                    ? new Uri(lessonDto.MeetingUri)
                    : new Uri($"https://meet.jit.si/{Guid.NewGuid()}")
            };
        }
    }
}