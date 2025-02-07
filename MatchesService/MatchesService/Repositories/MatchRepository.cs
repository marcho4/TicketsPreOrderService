using Npgsql;
using System.Data;
using Dapper;

using MatchesService.Models;
namespace MatchesService.Repositories
{
    public class MatchRepository : IMatchRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public MatchRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }


        public async Task<Match> CreateMatchAsync(Match match)
        {
            const string sql = @"
            INSERT INTO Matches 
            (match_id, organizer_id, team_home, team_away, match_datetime, stadium, match_description, created_at, updated_at)
            VALUES 
            (@Id, @OrganizerId, @TeamHome, @TeamAway, @MatchDateTime, @Stadium, @MatchDescription, @CreatedAt, @UpdatedAt)
            RETURNING *";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                return await connection.QuerySingleAsync<Match>(sql, match);
            }
        }

        public async Task<Match> UpdateMatchAsync(Match match)
        {
            const string sql = @"
            UPDATE Matches SET 
            team_home = @TeamHome, 
            team_away = @TeamAway, 
            match_datetime = @MatchDateTime, 
            stadium = @Stadium, 
            match_description = @MatchDescription, 
            match_status = @MatchStatus,
            updated_at = CURRENT_TIMESTAMP
            WHERE match_id = @Id
            RETURNING *";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                return await connection.QuerySingleAsync<Match>(sql, match);
            }
        }

        public async Task<bool> DeleteMatchAsync(Guid matchId)
        {
            const string sql = "DELETE FROM Matches WHERE match_id = @MatchId";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                var rowsAffected = await connection.ExecuteAsync(sql, new { MatchId = matchId });
                return rowsAffected > 0;
            }
        }

        public async Task<Match> GetMatchByIdAsync(Guid matchId)
        {
            const string sql = "SELECT * FROM Matches WHERE match_id = @MatchId";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                return await connection.QuerySingleOrDefaultAsync<Match>(sql, new { MatchId = matchId });
            }
        }

        public async Task<IEnumerable<Match>> GetMatchesByOrganizerIdAsync(Guid organizerId)
        {
            const string sql = "SELECT * FROM Matches WHERE organizer_id = @OrganizerId";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                return await connection.QueryAsync<Match>(sql, new { OrganizerId = organizerId });
            }
        }

        public async Task<IEnumerable<Match>> GetAllMatchesAsync()
        {
            const string sql = "SELECT * FROM Matches";

            using (var connection = await _dataSource.OpenConnectionAsync())
            {
                return await connection.QueryAsync<Match>(sql);
            }
        }
    }
}
