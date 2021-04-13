using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Simp.Data;
using Simp.Models;

namespace Simp.Services
{
    public class LessonService
    {
        private readonly ApplicationDbContext _dbContext;

        public LessonService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Lesson> FindAsync(Guid lessonId)
        {
            return await _dbContext.Lessons.FindAsync(lessonId);
        }

        public async Task<IEnumerable<Lesson>> FindByClassroomAsync(Guid classroomId)
        {
            var classroom = await _dbContext.Classrooms.FindAsync(classroomId);
            return await FindByClassroomAsync(classroom);
        }

        public async Task<IEnumerable<Lesson>> FindByClassroomAsync(Classroom classroom)
        {
            await _dbContext.Entry(classroom).Collection(c => c.Lessons).LoadAsync();
            return classroom.Lessons;
        }

        public async Task<Lesson> LoadTeachersAsync(Lesson lesson)
        {
            await _dbContext.Entry(lesson).Collection(l => l.Teachers).LoadAsync();
            return lesson;
        }
        public async Task<Lesson> CreateAsync(Lesson lesson)
        {
            var newLesson = await _dbContext.Lessons.AddAsync(lesson);
            await _dbContext.SaveChangesAsync();
            return newLesson.Entity;
        }

        public async Task AddTeacherAsync(Lesson lesson, ApplicationUser user)
        {
            await _dbContext.Entry(lesson).Collection(l => l.Teachers).LoadAsync();
            lesson.Teachers.Add(user);
            await _dbContext.SaveChangesAsync();
        }
    }
}