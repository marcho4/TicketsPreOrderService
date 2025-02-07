using AutoMapper;

namespace MatchesService.Models
{
    public class CreateMatchProfile : Profile
    {
        public CreateMatchProfile()
        {
            CreateMap<Match, MatchCreateDto>().ReverseMap();

        }
    }
}
