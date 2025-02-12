import React from 'react';
import Link from 'next/link';

/**
 * Карточка матча
 * @param {Object} match - Объект матча
 * @param {string} match.id - Уникальный идентификатор матча
 * @param {string} match.teamHome - Название домашней команды
 * @param {string} match.teamAway - Название гостевой команды
 * @param {string} match.matchDescription - Короткое описание матча
 * @param {string} match.matchDateTime - Дата/время матча (ISO-строка)
 * @param {string} [match.image_url] - (Опционально) URL изображения матча, если есть
 */
export default function MatchCard({ match }) {
    const isMatchPassed = new Date(match.matchDateTime) < new Date();
    const matchTitle = `${match.teamHome} - ${match.teamAway}`;
    const matchDate = new Date(match.matchDateTime);
    const formattedDate = matchDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Link href={`/organizer/match/${match.id}`} className="block">
            <div
                className="relative h-48 rounded-lg overflow-hidden shadow-lg mb-4
                   cursor-pointer transform transition-all duration-300
                   hover:shadow-xl hover:scale-[1.02]"
            >
                {/* Фоновое изображение (если есть) или fallback */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: match.image_url
                            ? `url(${match.image_url})`
                            : "url('/api/placeholder/400/320')"
                    }}
                >
                    {/* Градиентный оверлей для лучшей читаемости текста */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
                </div>

                {/* Контент карточки */}
                <div className="relative h-full p-6 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-white mb-3 transform transition-transform group-hover:translate-x-2">
                        {matchTitle}
                    </h3>
                    <p className={`text-md font-medium ${isMatchPassed ? 'text-red-400' : 'text-gray-200'}`}>
                        {formattedDate}
                    </p>

                    {/* Доп. описание, если хотите вывести */}
                    {match.matchDescription && (
                        <p className="text-sm text-gray-300 mt-2">
                            {match.matchDescription}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}