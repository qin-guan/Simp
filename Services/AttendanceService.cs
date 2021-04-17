using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Simp.Data;
using Simp.Models;

namespace Simp.Services
{
    public class AttendanceService
    {
        private readonly ApplicationDbContext _dbContext;
        private const int ValidDuration = 30;

        public AttendanceService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AttendanceVerification> GetVerificationCodeAsync(Lesson lesson)
        {
            await CleanUpAsync(lesson).ConfigureAwait(false);

            var existingQueryable = _dbContext.AttendanceVerifications.Where(av => av.Lesson.Id == lesson.Id);
            var hasExisting = await existingQueryable.AnyAsync();
            if (!hasExisting) return await CreateVerificationCodeAsync(lesson);
            {
                var latest = await existingQueryable.MaxAsync(av => av.ExpiryDateTime);
                if (latest < DateTime.Now)
                {
                    return await CreateVerificationCodeAsync(lesson);
                }

                return await existingQueryable.Where(av => av.ExpiryDateTime == latest).SingleOrDefaultAsync();
            }
        }

        private async Task<AttendanceVerification> CreateVerificationCodeAsync(Lesson lesson)
        {
            var attendance = await _dbContext.AttendanceVerifications.AddAsync(new AttendanceVerification
            {
                ExpiryDateTime = DateTime.Now.AddSeconds(ValidDuration),
                Code = new Random().Next(10000, 99999),
                Lesson = lesson
            });
            await _dbContext.SaveChangesAsync();

            return attendance.Entity;
        }

        private async Task CleanUpAsync(Lesson lesson)
        {
            var queryable = _dbContext.AttendanceVerifications.Include(av => av.Lesson)
                .Where(av => av.Lesson.Id == lesson.Id);
            _dbContext.AttendanceVerifications.RemoveRange(queryable.Where(av => DateTime.Now > av.ExpiryDateTime));
            await _dbContext.SaveChangesAsync();
        }

        public async Task<bool> CreateUserAttendanceAsync(Lesson lesson, ApplicationUser user, int code)
        {
            var lessonVerifications = _dbContext.AttendanceVerifications.Include(av => av.Lesson)
                .Where(av => av.Lesson.Id == lesson.Id);
            var latestTime = await lessonVerifications.MaxAsync(l => l.ExpiryDateTime);
            if (DateTime.Now > latestTime)
            {
                return false;
            }

            var latestCode = await lessonVerifications.Where(l => l.ExpiryDateTime == latestTime).SingleAsync();
            if (code != latestCode.Code)
            {
                return false;
            }

            await _dbContext.Entry(user).Collection(u => u.AttendedLessons).LoadAsync();
            user.AttendedLessons.Add(lesson);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task DeleteUserAttendanceAsync(Lesson lesson, ApplicationUser user)
        {
            await _dbContext.Entry(user).Collection(u => u.AttendedLessons).LoadAsync();
            if (!user.AttendedLessons.Contains(lesson)) return;

            user.AttendedLessons.Remove(lesson);
            await _dbContext.SaveChangesAsync();
        }
    }
}