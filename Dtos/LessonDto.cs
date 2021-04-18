using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Simp.Models;

namespace Simp.Dtos
{
    public class LessonDto
    {
        public string Id { get; set; }
        [Required] public string Name { get; set; }
        public string Description { get; set; }
        [Required] public string LessonType { get; set; }
        [Required] public long StartDate { get; set; }
        [Required] public long EndDate { get; set; }
        public string MeetingUri { get; set; }
        public IEnumerable<UserDto> Teachers { get; set; }
    }
}