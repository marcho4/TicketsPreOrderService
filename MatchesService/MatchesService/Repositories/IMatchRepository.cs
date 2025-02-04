using System.Text.RegularExpressions;

namespace MatchesService.Repositories
{
    public interface IMatchRepository
    {
        Task<Models.Match> CreateMatchAsync(Models.Match match);
        Task<Models.Match> UpdateMatchAsync(Models.Match match);
        Task<bool> DeleteMatchAsync(Guid matchId);
        Task<Models.Match> GetMatchByIdAsync(Guid matchId);
        Task<IEnumerable<Models.Match>> GetMatchesByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<Models.Match>> GetAllMatchesAsync();
    }
}
