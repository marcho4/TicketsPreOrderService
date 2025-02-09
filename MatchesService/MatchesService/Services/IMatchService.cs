using MatchesService.Models;

namespace MatchesService.Services
{
    public interface IMatchService
    {
        Task<MatchDto> CreateMatchAsync(MatchCreateDto matchDto, Guid organizerId);
        Task<MatchDto> UpdateMatchAsync(MatchUpdateDto matchDto, Guid matchId);
        Task<bool> DeleteMatchAsync(Guid matchId, Guid organizerId);
        Task<MatchDto> GetMatchByIdAsync(Guid matchId);
        Task<IEnumerable<MatchDto>> GetMatchesByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<MatchDto>> GetAllMatchesAsync();
    }

}
