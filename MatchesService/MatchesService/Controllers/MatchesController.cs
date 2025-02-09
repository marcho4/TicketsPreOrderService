using FluentValidation;
using MatchesService.Models;
using MatchesService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MatchesService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class matchController : ControllerBase
    {
        private readonly IMatchService _matchService;

        public matchController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        [HttpPost("create_match/{organizerId}")]
        public async Task<ActionResult<MatchDto>> CreateMatch(Guid organizerId, [FromBody] MatchCreateDto matchDto)
        {
            try
            {
                var createdMatch = await _matchService.CreateMatchAsync(matchDto, organizerId);
                return CreatedAtAction(nameof(GetMatch), new { matchId = createdMatch.Id }, createdMatch);
            }
            catch (ValidationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Произошла внутренняя ошибка сервера");
            }
        }

        [HttpPut("update_match/{matchId}")]
        public async Task<ActionResult<MatchDto>> UpdateMatch(Guid matchId, [FromBody] MatchUpdateDto matchDto)
        {
            var updatedMatch = await _matchService.UpdateMatchAsync(matchDto, matchId);
            return Ok(updatedMatch);
        }

        [HttpDelete("delete_match/{matchId}/{organizerId}")]
        public async Task<IActionResult> DeleteMatch(Guid matchId, Guid organizerId)
        {
            var result = await _matchService.DeleteMatchAsync(matchId, organizerId);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("get_match/{matchId}")]
        public async Task<ActionResult<MatchDto>> GetMatch(Guid matchId)
        {
            var match = await _matchService.GetMatchByIdAsync(matchId);
            return match == null ? NotFound() : Ok(match);
        }

        [HttpGet("get_organizer_matches/{organizerId}")]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetMatchesByOrganizer(Guid organizerId)
        {
            var matches = await _matchService.GetMatchesByOrganizerIdAsync(organizerId);
            return Ok(matches);
        }

        [HttpGet("get_all_matches")]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetAllMatches()
        {
            var matches = await _matchService.GetAllMatchesAsync();
            return Ok(matches);
        }
    }
}
