using MatchesService.Models;

namespace MatchesService.Services
{
    public interface IMatchService
    {
        Task<MatchDto> CreateMatchAsync(MatchDto matchDto, Guid organizerId);
        Task<MatchDto> UpdateMatchAsync(MatchDto matchDto);
        Task<bool> DeleteMatchAsync(Guid matchId, Guid organizerId);
        Task<MatchDto> GetMatchByIdAsync(Guid matchId);
        Task<IEnumerable<MatchDto>> GetMatchesByOrganizerIdAsync(Guid organizerId);
        Task<IEnumerable<MatchDto>> GetAllMatchesAsync();
    }

}
