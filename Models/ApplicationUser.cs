using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Simp.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public ICollection<Classroom> Classrooms { get; set; }
        public ICollection<Lesson> TeachingLessons { get; set; }
        public ICollection<Lesson> AttendedLessons { get; set; }
    }
}