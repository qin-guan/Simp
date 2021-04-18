﻿using System.ComponentModel.DataAnnotations;

namespace Simp.Dtos
{
    public class ClassroomDto
    {
        public string Id { get; set; }
        [Required] public string Name { get; set; }
    }
}