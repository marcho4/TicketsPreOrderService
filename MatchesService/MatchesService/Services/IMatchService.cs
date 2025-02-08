using MatchesService.Models;

namespace MatchesService.Services
{
    public interface IMatchService
    {
        Task<Match> CreateMatchAsync(MatchCreateDto matchDto, Guid organizerId);
        Task<Match> UpdateMatchAsync(MatchUpdateDto matchDto, Guid matchId);
        Task<bool> DeleteMatchAsync(Guid matchId, Guid organizerId);
        Task<Match> GetMatchByIdAsync(Guid matchId);
        Task<IEnumerable<Match>> GetMatchesByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<Match>> GetAllMatchesAsync();
    }

}
