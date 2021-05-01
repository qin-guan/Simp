namespace Simp.Dtos
{
    public class SubmissionDto
    {
        public string Id { get; set; }
        public string Link { get; set; }
        public bool Approved { get; set; }
        public string ApprovalDescription { get; set; }
    }
}