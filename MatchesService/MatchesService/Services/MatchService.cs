using AutoMapper;
using FluentValidation;
using MatchesService.Enums;
using MatchesService.Models;
using MatchesService.Repositories;
using MatchesService.Validators;
using Microsoft.Extensions.Logging;

namespace MatchesService.Services
{
    public class MatchService : IMatchService
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<MatchService> _logger;

        public MatchService(IMatchRepository matchRepository, IMapper mapper, ILogger<MatchService> logger)
        {
            _matchRepository = matchRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<MatchDto> CreateMatchAsync(MatchCreateDto matchDto, Guid organizerId)
        {
            try
            {
                var validator = new MatchCreateDtoValidator();
                var validationResult = await validator.ValidateAsync(matchDto);

                if (!validationResult.IsValid)
                {
                    var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                    _logger.LogError("Ошибка валидации при создании матча: {Errors}", errors);
                    throw new ValidationException(errors);
                }

                var match = _mapper.Map<Models.Match>(matchDto);
                match.Id = Guid.NewGuid();
                match.OrganizerId = organizerId;
                match.MatchStatus = MatchStatus.pending;
                match.CreatedAt = DateTime.UtcNow;
                match.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation("Создание нового матча с ID: {MatchId} для организатора: {OrganizerId}", match.Id, organizerId);
                var createdMatch = await _matchRepository.CreateMatchAsync(match);
                return _mapper.Map<MatchDto>(createdMatch);
            }
            catch (ValidationException)
            {
                // Повторно выбрасываем для обработки в контроллере
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании матча для организатора {OrganizerId}: {Message}", organizerId, ex.Message);
                throw new ApplicationException($"Не удалось создать матч: {ex.Message}", ex);
            }
        }

        public async Task<MatchDto> UpdateMatchAsync(MatchUpdateDto matchDto, Guid matchId)
        {
            try
            {
                _logger.LogInformation("Обновление матча с ID: {MatchId}", matchId);
                var existingMatch = await _matchRepository.GetMatchByIdAsync(matchId);
                if (existingMatch == null)
                {
                    _logger.LogWarning("Матч с ID {MatchId} не найден при попытке обновления", matchId);
                    throw new KeyNotFoundException($"Матч с ID {matchId} не найден");
                }

                var updatedMatch = await _matchRepository.UpdateMatchAsync(matchDto, matchId);
                return _mapper.Map<MatchDto>(updatedMatch);
            }
            catch (KeyNotFoundException)
            {
                // Повторно выбрасываем для обработки в контроллере
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении матча {MatchId}: {Message}", matchId, ex.Message);
                throw new ApplicationException($"Не удалось обновить матч: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteMatchAsync(Guid matchId, Guid organizerId)
        {
            try
            {
                _logger.LogInformation("Удаление матча с ID: {MatchId} организатором: {OrganizerId}", matchId, organizerId);
                var match = await _matchRepository.GetMatchByIdAsync(matchId);
                
                if (match == null)
                {
                    _logger.LogWarning("Матч с ID {MatchId} не найден при попытке удаления", matchId);
                    return false;
                }
                
                if (match.OrganizerId != organizerId)
                {
                    _logger.LogWarning("Попытка удаления матча {MatchId} организатором {OrganizerId}, который не является владельцем", matchId, organizerId);
                    return false;
                }
                
                return await _matchRepository.DeleteMatchAsync(matchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении матча {MatchId}: {Message}", matchId, ex.Message);
                throw new ApplicationException($"Не удалось удалить матч: {ex.Message}", ex);
            }
        }

        public async Task<MatchDto> GetMatchByIdAsync(Guid matchId)
        {
            try
            {
                _logger.LogInformation("Получение матча по ID: {MatchId}", matchId);
                var match = await _matchRepository.GetMatchByIdAsync(matchId);
                
                if (match == null)
                {
                    _logger.LogWarning("Матч с ID {MatchId} не найден", matchId);
                    return null;
                }
                
                return _mapper.Map<MatchDto>(match);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении матча {MatchId}: {Message}", matchId, ex.Message);
                throw new ApplicationException($"Не удалось получить информацию о матче: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<MatchDto>> GetMatchesByOrganizerIdAsync(Guid organizerId)
        {
            try
            {
                _logger.LogInformation("Получение матчей для организатора: {OrganizerId}", organizerId);
                var matches = await _matchRepository.GetMatchesByOrganizerIdAsync(organizerId);
                return _mapper.Map<IEnumerable<MatchDto>>(matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении матчей для организатора {OrganizerId}: {Message}", organizerId, ex.Message);
                throw new ApplicationException($"Не удалось получить матчи организатора: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<MatchDto>> GetAllMatchesAsync()
        {
            try
            {
                _logger.LogInformation("Получение всех матчей");
                var matches = await _matchRepository.GetAllMatchesAsync();
                return _mapper.Map<IEnumerable<MatchDto>>(matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении всех матчей: {Message}", ex.Message);
                throw new ApplicationException($"Не удалось получить список матчей: {ex.Message}", ex);
            }
        }
    }
}
