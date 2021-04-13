using System;
using System.Collections.Generic;
using Simp.Models;

namespace Simp.Dtos
{
    public class LessonDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string LessonType { get; set; }
        public long StartDate { get; set; }
        public long EndDate { get; set; }
        public string MeetingUri { get; set; }
        public IEnumerable<UserDto> Teachers { get; set; }
    }
}