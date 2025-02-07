using AutoMapper;
using MatchesService.Enums;
using MatchesService.Models;
using MatchesService.Repositories;
using System.Text.RegularExpressions;


namespace MatchesService.Services
{
    public class MatchService : IMatchService
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IMapper _mapper;

        public MatchService(IMatchRepository matchRepository, IMapper mapper)
        {
            _matchRepository = matchRepository;
            _mapper = mapper;
        }

        public async Task<Models.Match> CreateMatchAsync(MatchCreateDto matchDto, Guid organizerId)
        {
            var match = _mapper.Map<Models.Match>(matchDto);
            match.Id = Guid.NewGuid();
            match.OrganizerId = organizerId;
            match.MatchStatus = MatchStatus.pending;
            match.CreatedAt = DateTime.UtcNow;
            match.UpdatedAt = DateTime.UtcNow;

            var createdMatch = await _matchRepository.CreateMatchAsync(match);
            return createdMatch;
        }

        public async Task<MatchDto> UpdateMatchAsync(MatchDto matchDto)
        {
            var match = _mapper.Map<Models.Match>(matchDto);
            var updatedMatch = await _matchRepository.UpdateMatchAsync(match);
            return _mapper.Map<MatchDto>(updatedMatch);
        }

        public async Task<bool> DeleteMatchAsync(Guid matchId, Guid organizerId)
        {
            var match = await _matchRepository.GetMatchByIdAsync(matchId);
            if (match == null || match.OrganizerId != organizerId)
            {
                return false;
            }
            return await _matchRepository.DeleteMatchAsync(matchId);
        }

        public async Task<MatchDto> GetMatchByIdAsync(Guid matchId)
        {
            var match = await _matchRepository.GetMatchByIdAsync(matchId);
            return _mapper.Map<MatchDto>(match);
        }

        public async Task<IEnumerable<MatchDto>> GetMatchesByOrganizerIdAsync(Guid organizerId)
        {
            var matches = await _matchRepository.GetMatchesByOrganizerIdAsync(organizerId);
            return _mapper.Map<IEnumerable<MatchDto>>(matches);
        }

        public async Task<IEnumerable<MatchDto>> GetAllMatchesAsync()
        {
            var matches = await _matchRepository.GetAllMatchesAsync();
            return _mapper.Map<IEnumerable<MatchDto>>(matches);
        }
    }
}
