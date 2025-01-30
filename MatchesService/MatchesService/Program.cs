using Npgsql;
using Microsoft.Extensions.Logging;
namespace MatchesService
{


    public class Program
    {
        public static void Main(string[] args)
        {

            


            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            
            // Вызов скрипта создания БД
            string connectionString = "Host=localhost;Port=5432;Username=matches_user;Password=matches_pass;Database=matches_db";
            string sqlScriptPath = "Database/init.sql";
            string sqlScript = File.ReadAllText(sqlScriptPath);

            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand(sqlScript, connection))
                {
                    command.ExecuteNonQuery();
                }
            }






            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }

    }
}
