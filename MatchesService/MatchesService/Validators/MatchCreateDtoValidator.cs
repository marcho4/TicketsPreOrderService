using FluentValidation;
using MatchesService.Models;
namespace MatchesService.Validators
{
    public class MatchCreateDtoValidator : AbstractValidator<MatchCreateDto>
    {
        public MatchCreateDtoValidator()
        {
            RuleFor(x => x.MatchDateTime)
                .GreaterThan(DateTime.UtcNow.AddDays(1))
                .WithMessage("Матч можно создать только на дату, которая наступит более чем через 24 часа");

            RuleFor(x => x.TeamHome)
                .NotEmpty()
                .WithMessage("Название домашней команды обязательно");

            RuleFor(x => x.TeamAway)
                .NotEmpty()
                .WithMessage("Название гостевой команды обязательно");

            RuleFor(x => x.Stadium)
                .NotEmpty()
                .WithMessage("Название стадиона обязательно");
        }
    }
}
