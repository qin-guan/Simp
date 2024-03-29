﻿using System;
using System.Collections.Generic;

namespace Simp.Models
{
    public class Assignment
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public int Points { get; set; }
        public Lesson Lesson { get; set; }
        public ApplicationUser Creator { get; set; }
        public List<Submission> Submissions { get; set; }
        public ICollection<ApplicationUser> CompletedUsers { get; set; }
    }
}