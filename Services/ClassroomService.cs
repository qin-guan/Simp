using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Simp.Data;
using Simp.Models;

namespace Simp.Services
{
    public class ClassroomService
    {
        private readonly ApplicationDbContext _dbContext;

        public ClassroomService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Classroom>> FindByUserAsync(ApplicationUser user)
        {
            await _dbContext.Entry(user).Collection(u => u.Classrooms).LoadAsync();
            return user.Classrooms;
        }

        public async Task AddUser(Classroom classroom, ApplicationUser user)
        {
            await _dbContext.Entry(classroom).Collection(c => c.Users).LoadAsync();
            classroom.Users.Add(user);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<Classroom> CreateAsync(Classroom classroom)
        {
            var newClassroom = await _dbContext.Classrooms.AddAsync(classroom);
            await _dbContext.SaveChangesAsync();

            return newClassroom.Entity;
        }

        public async Task DeleteAsync(Guid guid)
        {
            var classroom = await _dbContext.Classrooms.FindAsync(guid);
            _dbContext.Classrooms.Remove(classroom);
            await _dbContext.SaveChangesAsync();
        }
    }
}