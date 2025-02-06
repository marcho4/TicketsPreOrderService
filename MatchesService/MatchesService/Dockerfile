# Используем образ .NET SDK для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release

WORKDIR /src

# Копируем весь проект
COPY . .

# Восстанавливаем зависимости
RUN dotnet restore "MatchesService.csproj"

# Собираем проект
RUN dotnet build "MatchesService.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Публикуем
FROM build AS publish
RUN dotnet publish "MatchesService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Используем ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Копируем опубликованные файлы
COPY --from=publish /app/publish .

# Если есть статические файлы:
# COPY wwwroot/ /app/wwwroot/

ENV ASPNETCORE_URLS="http://+:8005"
ENTRYPOINT ["dotnet", "MatchesService.dll"]