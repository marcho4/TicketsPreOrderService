using MatchesService.Enums;
using MatchesService.Models;
using Microsoft.EntityFrameworkCore;

namespace MatchesService.Database
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Match> Matches { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка маппинга для enum
            modelBuilder.HasPostgresEnum<MatchStatus>();

            // Настройка таблицы Matches
            modelBuilder.Entity<Match>(entity =>
            {
                entity.ToTable("matches"); // Название таблицы в PostgreSQL
                entity.HasKey(m => m.Id); // Первичный ключ
                entity.Property(m => m.Id).HasColumnName("match_id"); // Маппинг на столбец
                entity.Property(m => m.OrganizerId).HasColumnName("organizer_id");
                entity.Property(m => m.TeamHome).HasColumnName("team_home");
                entity.Property(m => m.TeamAway).HasColumnName("team_away");
                entity.Property(m => m.MatchDateTime).HasColumnName("match_datetime");
                entity.Property(m => m.Stadium).HasColumnName("stadium");
                entity.Property(m => m.MatchDescription)
                .HasColumnName("match_description")
                .HasConversion<string>()
                .HasColumnType("matchstatus");
                entity.Property(m => m.MatchStatus).HasColumnName("match_status");
                entity.Property(m => m.CreatedAt).HasColumnName("created_at");
                entity.Property(m => m.UpdatedAt).HasColumnName("updated_at");
            });
        }

    }
}
