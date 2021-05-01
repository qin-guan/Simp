using System;

namespace Simp.Models
{
    public class Submission
    {
        public Guid Id { get; set; }
        public Uri Link { get; set; }
        public bool Approved { get; set; }
        public string ApprovalDescription { get; set; }
        public Assignment Assignment { get; set; }
        public ApplicationUser User { get; set; }
    }
}