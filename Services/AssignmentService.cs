using System.Collections.Generic;
using System.Threading.Tasks;
using Simp.Data;
using Simp.Models;

namespace Simp.Services
{
    public class AssignmentService
    {
        private readonly ApplicationDbContext _dbContext;

        public AssignmentService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Assignment>> FindByLessonAsync(Lesson lesson)
        {
            await _dbContext.Entry(lesson).Collection(l => l.Assignments).LoadAsync();
            return lesson.Assignments;
        }

        public async Task<Assignment> CreateAsync(Assignment assignment)
        {
            var newAssignment = await _dbContext.Assignments.AddAsync(assignment);
            return newAssignment.Entity;
        }
    }
}