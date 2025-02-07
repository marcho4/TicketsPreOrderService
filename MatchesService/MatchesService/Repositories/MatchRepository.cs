using Npgsql;
using System.Data;
using Dapper;

using MatchesService.Models;
using MatchesService.Database;
using Microsoft.EntityFrameworkCore;
namespace MatchesService.Repositories
{
    public class MatchRepository : IMatchRepository
    {
        private readonly ApplicationDbContext _context;

        public MatchRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        public async Task<Match> CreateMatchAsync(Match match)
        {
            _context.Matches.Add(match);
            await _context.SaveChangesAsync();
            return match;
        }

        public async Task<Match> UpdateMatchAsync(Match match)
        {
            var existingMatch = await _context.Matches.FindAsync(match.Id);
            if (existingMatch == null)
            {
                throw new KeyNotFoundException($"Match with ID {match.Id} not found.");
            }

            // Обновляем поля
            existingMatch.TeamHome = match.TeamHome;
            existingMatch.TeamAway = match.TeamAway;
            existingMatch.MatchDateTime = match.MatchDateTime;
            existingMatch.Stadium = match.Stadium;
            existingMatch.MatchDescription = match.MatchDescription;
            existingMatch.MatchStatus = match.MatchStatus;
            existingMatch.UpdatedAt = DateTime.UtcNow;

            _context.Matches.Update(existingMatch);
            await _context.SaveChangesAsync();

            return existingMatch;
        }

        public async Task<bool> DeleteMatchAsync(Guid matchId)
        {
            var match = await _context.Matches.FindAsync(matchId);
            if (match == null)
            {
                return false; // Матч не найден
            }

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();

            return true; // Матч успешно удален
        }

        public async Task<Match?> GetMatchByIdAsync(Guid matchId)
        {
            return await _context.Matches
                .FirstOrDefaultAsync(m => m.Id == matchId);
        }

        public async Task<IEnumerable<Match>> GetMatchesByOrganizerIdAsync(Guid organizerId)
        {
            return await _context.Matches
                .Where(m => m.OrganizerId == organizerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Match>> GetAllMatchesAsync()
        {
            return await _context.Matches
                .ToListAsync();
        }
    }
}
