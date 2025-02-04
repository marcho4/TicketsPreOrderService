using AutoMapper;

namespace MatchesService.Models
{
    public class MatchProfile : Profile
    {
        public MatchProfile()
        {
            CreateMap<Match, MatchDto>().ReverseMap();
        }
    }
}
