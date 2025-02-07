using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using Serilog;
using Serilog.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using MatchesService.Repositories;
using MatchesService.Services;
using MatchesService.Models;
using Dapper;
using Npgsql;
using MatchesService.Enums;
using MatchesService.Mappers;
using MatchesService.Database;
using Microsoft.EntityFrameworkCore;

namespace MatchesService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Настройка Serilog
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File("logs/match-service-.log", rollingInterval: Serilog.RollingInterval.Day)
                .CreateLogger();

            try
            {
                Log.Information("Starting up the application");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Application start-up failed");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }

    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // Конфигурация контроллеров с Newtonsoft.Json
            services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });



            
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection"), o => o.MapEnum<MatchStatus>("matchstatus")));




            // Конфигурация Swagger
            services.AddSwaggerGen(ConfigureSwaggerGen);

            // Конфигурация AutoMapper с указанием сборки
            services.AddAutoMapper(config => { config.AddProfile(new MatchProfile()); },Assembly.GetExecutingAssembly());


            services.AddAutoMapper(config => { config.AddProfile(new MatchCreateDtoProfile()); }, Assembly.GetExecutingAssembly());

            services.AddScoped<IMatchRepository, MatchRepository>();

            services.AddScoped<IMatchService, MatchService>();

            // Здоровье сервера
            services.AddHealthChecks();

            // Конфигурация CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });
        }

        private void ConfigureSwaggerGen(SwaggerGenOptions options)
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "Matches Service API",
                Version = "v1",
                Description = "API for managing football matches"
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            // Добавление Serilog в LoggerFactory
            loggerFactory.AddSerilog();

            // Конфигурация middleware

            // Обработка исключений в Development среде
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                // Swagger только в Development
                app.UseSwagger();
                app.UseSwaggerUI(ConfigureSwaggerUI);
            }
            else
            {
                // Middleware для обработки ошибок в Production
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            // Middleware для CORS
            app.UseCors("AllowAll");

            // Middleware для HTTPS перенаправления
            app.UseHttpsRedirection();

            // Middleware для статических файлов
            app.UseStaticFiles();

            // Middleware для маршрутизации
            app.UseRouting();

            // Middleware для авторизации
            app.UseAuthorization();

            // Настройка эндпоинтов
            app.UseEndpoints(endpoints =>
            {
                // Маппинг контроллеров
                endpoints.MapControllers();

                // Эндпоинт здоровья сервера
                endpoints.MapHealthChecks("/health");
            });
        }

        private void ConfigureSwaggerUI(SwaggerUIOptions options)
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Matches Service API v1");
        }
    }
}