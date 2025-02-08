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
                entity.ToTable("matches");
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Id).HasColumnName("match_id");
                entity.Property(m => m.OrganizerId).HasColumnName("organizer_id");
                entity.Property(m => m.TeamHome).HasColumnName("team_home");
                entity.Property(m => m.TeamAway).HasColumnName("team_away");

                // Явно указываем тип timestamp with time zone
                entity.Property(m => m.MatchDateTime)
                    .HasColumnName("match_datetime")
                    .HasColumnType("timestamp with time zone");

                entity.Property(m => m.Stadium).HasColumnName("stadium");
                entity.Property(m => m.MatchDescription)
                    .HasColumnName("match_description");

                entity.Property(m => m.MatchStatus)
                    .HasColumnName("match_status")
                    .HasColumnType("matchstatus");

                // Явно указываем тип для остальных DateTime полей
                entity.Property(m => m.CreatedAt)
                    .HasColumnName("created_at")
                    .HasColumnType("timestamp with time zone");

                entity.Property(m => m.UpdatedAt)
                    .HasColumnName("updated_at")
                    .HasColumnType("timestamp with time zone");
            });
        }

    }
}
