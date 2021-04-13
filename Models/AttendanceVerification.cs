using System;

namespace Simp.Models
{
    public class AttendanceVerification
    {
        public Guid Id { get; set; }
        public DateTime ExpiryDateTime { get; set; }
        public int Code { get; set; }
        public Lesson Lesson { get; set; }
    }
}