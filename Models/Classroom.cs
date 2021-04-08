using System;
using System.Collections.Generic;

namespace Simp.Models
{
    public class Classroom
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        
        public ICollection<ApplicationUser> Users { get; set; }
    }
}