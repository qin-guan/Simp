using System;
using System.Collections.Generic;

namespace Simp.Models
{
    public class Venue
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Classroom Classroom { get; set; }
        public List<Lesson> Lessons { get; set; }
    }
}