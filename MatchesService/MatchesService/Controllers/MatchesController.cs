using FluentValidation;
using MatchesService.Models;
using MatchesService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;

namespace MatchesService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class matchController : ControllerBase
    {
        private readonly IMatchService _matchService;
        private readonly ILogger<matchController> _logger;

        public matchController(IMatchService matchService, ILogger<matchController> logger)
        {
            _matchService = matchService;
            _logger = logger;
        }

        [HttpPost("create_match/{organizerId}")]
        [ProducesResponseType(typeof(MatchDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MatchDto>> CreateMatch(Guid organizerId, [FromBody] MatchCreateDto matchDto)
        {
            try
            {
                _logger.LogInformation("Запрос на создание матча для организатора {OrganizerId}", organizerId);
                var createdMatch = await _matchService.CreateMatchAsync(matchDto, organizerId);
                return StatusCode(StatusCodes.Status201Created, createdMatch);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Ошибка валидации при создании матча: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status201Created, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.Created,
                    Message = "Ошибка валидации данных",
                    Details = ex.Message
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при создании матча: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status201Created, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.Created,
                    Message = "Ошибка при создании матча",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при создании матча: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status201Created, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.Created,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }

        [HttpPut("update_match/{matchId}")]
        [ProducesResponseType(typeof(MatchDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MatchDto>> UpdateMatch(Guid matchId, [FromBody] MatchUpdateDto matchDto)
        {
            try
            {
                _logger.LogInformation("Запрос на обновление матча {MatchId}", matchId);
                var updatedMatch = await _matchService.UpdateMatchAsync(matchDto, matchId);
                return StatusCode(StatusCodes.Status200OK, updatedMatch);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Матч с ID {MatchId} не найден при обновлении: {Message}", matchId, ex.Message);
                return NotFound(new ErrorResponse
                {
                    StatusCode = HttpStatusCode.NotFound,
                    Message = "Матч не найден",
                    Details = ex.Message
                });
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Ошибка валидации при обновлении матча {MatchId}: {Message}", matchId, ex.Message);
                return BadRequest(new ErrorResponse
                {
                    StatusCode = HttpStatusCode.BadRequest,
                    Message = "Ошибка валидации данных",
                    Details = ex.Message
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при обновлении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Ошибка при обновлении матча",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при обновлении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }

        [HttpDelete("delete_match/{matchId}/{organizerId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteMatch(Guid matchId, Guid organizerId)
        {
            try
            {
                _logger.LogInformation("Запрос на удаление матча {MatchId} организатором {OrganizerId}", matchId, organizerId);
                var result = await _matchService.DeleteMatchAsync(matchId, organizerId);
                
                if (!result)
                {
                    return NotFound(new ErrorResponse
                    {
                        StatusCode = HttpStatusCode.NotFound,
                        Message = "Матч не найден или организатор не имеет прав на удаление",
                        Details = $"Матч с ID {matchId} не найден или организатор с ID {organizerId} не является владельцем"
                    });
                }
                
                return StatusCode(StatusCodes.Status204NoContent);
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при удалении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Ошибка при удалении матча",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при удалении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }

        [HttpGet("get_match/{matchId}")]
        [ProducesResponseType(typeof(MatchDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<MatchDto>> GetMatch(Guid matchId)
        {
            try
            {
                _logger.LogInformation("Запрос на получение матча {MatchId}", matchId);
                var match = await _matchService.GetMatchByIdAsync(matchId);
                
                if (match == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        StatusCode = HttpStatusCode.NotFound,
                        Message = "Матч не найден",
                        Details = $"Матч с ID {matchId} не найден"
                    });
                }
                
                return StatusCode(StatusCodes.Status200OK, match);
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при получении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Ошибка при получении матча",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при получении матча {MatchId}: {Message}", matchId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }

        [HttpGet("get_organizer_matches/{organizerId}")]
        [ProducesResponseType(typeof(IEnumerable<MatchDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetMatchesByOrganizer(Guid organizerId)
        {
            try
            {
                _logger.LogInformation("Запрос на получение матчей организатора {OrganizerId}", organizerId);
                var matches = await _matchService.GetMatchesByOrganizerIdAsync(organizerId);
                return StatusCode(StatusCodes.Status200OK, matches);
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при получении матчей организатора {OrganizerId}: {Message}", organizerId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Ошибка при получении матчей организатора",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при получении матчей организатора {OrganizerId}: {Message}", organizerId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }

        [HttpGet("get_all_matches")]
        [ProducesResponseType(typeof(IEnumerable<MatchDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetAllMatches()
        {
            try
            {
                _logger.LogInformation("Запрос на получение всех матчей");
                var matches = await _matchService.GetAllMatchesAsync();
                return StatusCode(StatusCodes.Status200OK, matches);
            }
            catch (ApplicationException ex)
            {
                _logger.LogError(ex, "Ошибка приложения при получении всех матчей: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Ошибка при получении списка матчей",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Необработанная ошибка при получении всех матчей: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = "Произошла внутренняя ошибка сервера",
                    Details = "Пожалуйста, обратитесь к администратору системы"
                });
            }
        }
    }

    public class ErrorResponse
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}
