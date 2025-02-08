using AutoMapper;
using MatchesService.Enums;
using MatchesService.Models;
using MatchesService.Repositories;
using MatchesService.Validators;


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
            var validator = new MatchCreateDtoValidator();

            var validationResult = await validator.ValidateAsync(matchDto);

            if (!validationResult.IsValid)
            {
                var errors = string.Join(",", validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var match = _mapper.Map<Models.Match>(matchDto);
            match.Id = Guid.NewGuid();
            match.OrganizerId = organizerId;
            match.MatchStatus = MatchStatus.pending;
            match.CreatedAt = DateTime.UtcNow;
            match.UpdatedAt = DateTime.UtcNow;

            var createdMatch = await _matchRepository.CreateMatchAsync(match);
            return createdMatch;
        }

        public async Task<Match> UpdateMatchAsync(MatchUpdateDto matchDto, Guid matchId)
        {
            var updatedMatch = await _matchRepository.UpdateMatchAsync(matchDto, matchId);
            return updatedMatch;
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

        public async Task<Match> GetMatchByIdAsync(Guid matchId)
        {
            var match = await _matchRepository.GetMatchByIdAsync(matchId);
            return match;
        }

        public async Task<IEnumerable<Match>> GetMatchesByOrganizerIdAsync(Guid organizerId)
        {
            var matches = await _matchRepository.GetMatchesByOrganizerIdAsync(organizerId);
            return matches;
        }

        public async Task<IEnumerable<Match>> GetAllMatchesAsync()
        {
            var matches = await _matchRepository.GetAllMatchesAsync();
            return matches;
        }
    }
}
