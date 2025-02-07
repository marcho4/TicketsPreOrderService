using MatchesService.Enums;

namespace MatchesService.Models
{
    public class MatchCreateDto
    {
        public string TeamHome { get; set; }
        public string TeamAway { get; set; }
        public DateTime MatchDateTime { get; set; }
        public string Stadium { get; set; }
        public string MatchDescription { get; set; }
    }
}
