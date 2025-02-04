FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем ВСЕ файлы и папки проекта MatchesService
COPY MatchesService/ /src/MatchesService/  # <-- Изменено!

RUN dotnet restore "/src/MatchesService/MatchesService.csproj"
RUN dotnet build "/src/MatchesService/MatchesService.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "/src/MatchesService/MatchesService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Копируем оставшиеся файлы (например, wwwroot, если он не попал в publish)
COPY MatchesService/wwwroot/ /app/wwwroot/  # <-- Важно для wwwroot

# Указываем Kestrel слушать порт 8005 (если это необходимо)
ENV ASPNETCORE_URLS="http://+:8005"

ENTRYPOINT ["dotnet", "MatchesService.dll"]