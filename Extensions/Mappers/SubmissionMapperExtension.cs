using Simp.Dtos;
using Simp.Models;

namespace Simp.Extensions.Mappers
{
    public static class SubmissionMapperExtension
    {
        public static SubmissionDto ToDto(this Submission submission)
        {
            return new()
            {
                Id = submission.Id.ToString(),
                Link = submission.Link.ToString(),
                Approved = submission.Approved,
                ApprovalDescription = submission.ApprovalDescription
            };
        }
    }
}