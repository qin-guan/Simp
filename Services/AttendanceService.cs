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
        private readonly int _validDuration = 30;

        public AttendanceService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AttendanceVerification> GetVerificationCodeAsync(Lesson lesson)
        {
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

        public async Task<AttendanceVerification> CreateVerificationCodeAsync(Lesson lesson)
        {
            var attendance = await _dbContext.AttendanceVerifications.AddAsync(new AttendanceVerification
            {
                ExpiryDateTime = DateTime.Now.AddSeconds(_validDuration),
                Code = new Random().Next(10000, 99999),
                Lesson = lesson
            });
            await _dbContext.SaveChangesAsync();

            return attendance.Entity;
        }
    }
}