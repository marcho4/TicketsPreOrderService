using MatchesService.Enums;

namespace MatchesService.Models
{
    public class MatchDto
    {
        public Guid Id { get; set; }
        public Guid OrganizerId { get; set; }
        public string TeamHome { get; set; }
        public string TeamAway { get; set; }
        public DateTime MatchDateTime { get; set; }
        public string Stadium { get; set; }
        public string MatchDescription { get; set; }
        public MatchStatus MatchStatus { get; set; }
    }
}
