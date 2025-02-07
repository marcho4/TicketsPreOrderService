using MatchesService.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatchesService.Models
{
    public class Match
    {
        public Guid Id { get; set; }
        public Guid OrganizerId { get; set; }
        public string TeamHome { get; set; }
        public string TeamAway { get; set; }
        public DateTime MatchDateTime { get; set; }
        public string Stadium { get; set; }
        public string MatchDescription { get; set; }
        public MatchStatus MatchStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
