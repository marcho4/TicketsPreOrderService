using AutoMapper;
using MatchesService.Enums;
using MatchesService.Models;

namespace MatchesService.Mappers
{
    public class MatchCreateDtoProfile : Profile
    {
        public MatchCreateDtoProfile()
        {
            CreateMap<MatchCreateDto, Match>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Id генерируется на сервере
                .ForMember(dest => dest.OrganizerId, opt => opt.Ignore()) // OrganizerId задается отдельно
                .ForMember(dest => dest.MatchStatus, opt => opt.MapFrom(src => MatchStatus.pending.ToString()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow)) // Время создания
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow)); // Время обновления
        }
    }
}
