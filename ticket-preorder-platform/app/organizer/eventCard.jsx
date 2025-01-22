import React from 'react';
import Link from 'next/link';

/**
 * Компонент карточки события
 * @param {Object} event - Объект события с данными
 * @param {string} event.id - Уникальный идентификатор события
 * @param {string} event.title - Название события
 * @param {string} event.date - Дата события в формате ISO
 * @param {string} event.image_url - URL изображения события
 */
export default function EventCard({ event }) {
    // Проверяем, прошло ли событие
    const isEventPassed = new Date(event.date) < new Date();
    
    return (
        <Link href={`/events/${event.id}`} className="block">
            <div className="relative h-48 rounded-lg overflow-hidden shadow-lg mb-4 
                          cursor-pointer transform transition-all duration-300 
                          hover:shadow-xl hover:scale-[1.02]">
                {/* Фоновое изображение с фолбэком на плейсхолдер */}
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ 
                        backgroundImage: event.image_url 
                            ? `url(${event.image_url})` 
                            : "url('/api/placeholder/400/320')"
                    }}
                >
                    {/* Градиентный оверлей для лучшей читаемости текста */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
                </div>
                
                {/* Контент карточки */}
                <div className="relative h-full p-6 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-white mb-3 
                                 transform transition-transform group-hover:translate-x-2">
                        {event.title}
                    </h3>
                    <p className={`text-lg font-medium
                        ${isEventPassed ? 'text-red-400' : 'text-gray-200'}`}>
                        {new Date(event.date).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </Link>
    );
}