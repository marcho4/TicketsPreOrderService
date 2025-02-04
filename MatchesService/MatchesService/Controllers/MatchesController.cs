using MatchesService.Models;
using MatchesService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MatchesService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchController : ControllerBase
    {
        private readonly IMatchService _matchService;

        public MatchController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        [HttpPost("{organizerId}")]
        public async Task<ActionResult<MatchDto>> CreateMatch(Guid organizerId, [FromBody] MatchDto matchDto)
        {
            var createdMatch = await _matchService.CreateMatchAsync(matchDto, organizerId);
            return CreatedAtAction(nameof(GetMatch), new { matchId = createdMatch.Id }, createdMatch);
        }

        [HttpPut]
        public async Task<ActionResult<MatchDto>> UpdateMatch([FromBody] MatchDto matchDto)
        {
            var updatedMatch = await _matchService.UpdateMatchAsync(matchDto);
            return Ok(updatedMatch);
        }

        [HttpDelete("{matchId}/{organizerId}")]
        public async Task<IActionResult> DeleteMatch(Guid matchId, Guid organizerId)
        {
            var result = await _matchService.DeleteMatchAsync(matchId, organizerId);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("{matchId}")]
        public async Task<ActionResult<MatchDto>> GetMatch(Guid matchId)
        {
            var match = await _matchService.GetMatchByIdAsync(matchId);
            return match == null ? NotFound() : Ok(match);
        }

        [HttpGet("organizer/{organizerId}")]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetMatchesByOrganizer(Guid organizerId)
        {
            var matches = await _matchService.GetMatchesByOrganizerIdAsync(organizerId);
            return Ok(matches);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MatchDto>>> GetAllMatches()
        {
            var matches = await _matchService.GetAllMatchesAsync();
            return Ok(matches);
        }
    }
}
