using System;
using System.Collections.Generic;

namespace Simp.Models
{
    public class Lesson
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public LessonType LessonType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Uri MeetingUri { get; set; }
        
        public Classroom Classroom { get; set; }
        public Venue Venue { get; set; }
        public ICollection<ApplicationUser> Teachers { get; set; }
        public ICollection<ApplicationUser> Attendees { get; set; }
    }
}