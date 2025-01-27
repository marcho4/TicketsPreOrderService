import React, { Suspense, useState } from 'react';
import { Plus, X, Calendar as CalendarIcon } from "lucide-react";
import EventCard from './EventCard';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

//Моковые данные для тестирования
const MOCK_EVENTS = [
    {
        id: 1,
        title: "Футбольный матч 1",
        date: "2025-02-15",
        image_url: "/f1.jpg"
    },
    {
        id: 2,
        title: "Футбольный матч 2",
        date: "2024-03-20",
        image_url: "/f1.webp"
    },
    {
        id: 3,
        title: "Футбольный матч 3",
        date: "2024-01-10",
        image_url: "/f3.jpg"
    }
];

/**
 * Компонент обработки ошибок
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center items-center h-full bg-silver rounded-lg">
                    <p className="text-xl text-red-500">
                        Something went wrong: {this.state.error.message}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Компонент модального окна
 */
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-6 w-6" />
                </button>
                {children}
            </div>
        </div>
    );
}

/**
 * Компонент формы создания события
 */
function EventForm({ onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        date: new Date(),
        image: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            
            <div className="space-y-4">
                {/* Поле названия события */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Title
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            title: e.target.value
                        }))}
                    />
                </div>

                {/* Поле выбора даты с календарем */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {format(formData.date, "PPP", { locale: ru })}
                                <CalendarIcon className="h-4 w-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Поле загрузки изображения */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/jpeg,image/png"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            image: e.target.files[0]
                                        }))}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Кнопки формы */}
            <div className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                    Create Event
                </button>
            </div>
        </form>
    );
}

/**
 * Утилита для создания ресурса с Suspense
 */
const createResource = (asyncFn) => {
    let status = 'pending';
    let result;
    let promise = asyncFn().then(
        r => {
            status = 'success';
            result = r;
        },
        e => {
            status = 'error';
            result = e;
        }
    );

    return {
        read() {
            if (status === 'pending') throw promise;
            if (status === 'error') throw result;
            return result;
        }
    };
};

/**
 * Функция для загрузки событий с сервера
 * @param {number} page - Номер страницы
 * @returns {Promise<Array>} Массив событий
 */
const fetchEvents = async (page = 1) => {
    // ID организатора (временно захардкожено)
    const organizerId = "12345"; 
    
    // В реальном приложении здесь будет запрос к API
    // Сейчас возвращаем моковые данные
    // return await fetch(`http://localhost:3001/get_organizer_events?page=${page}&limit=20&organizerId=${organizerId}`);
    
    // Имитация задержки загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Возвращаем моковые данные
    return MOCK_EVENTS;
};

/**
 * Компонент для отображения списка событий
 */
function EventsList({ resource }) {
    const events = resource.read();
    
    if (events.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xl text-gray-600">Нет доступных событий</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}

/**
 * Компонент для отображения состояния загрузки
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse" />
            ))}
        </div>
    );
}

let eventsResource;

/**
 * Основной компонент секции событий
 */
export default function MatchesSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Инициализация ресурса при первой загрузке
    if (!eventsResource) {
        eventsResource = createResource(() => fetchEvents(1));
    }

    /**
     * Загрузка следующей страницы событий
     */
    const loadMoreEvents = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const newEvents = await fetchEvents(page + 1);
            // Здесь будет логика добавления новых событий к существующим
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Failed to load more events:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обработчик создания нового события
     */
    const handleCreateEvent = async (formData) => {
        // Здесь будет логика отправки данных на сервер
        console.log('Creating event:', formData);
    };

    return (
        <div className="flex flex-col min-w-full min-h-96 rounded-lg bg-silver">
            {/* Заголовок и кнопка добавления */}
            <div className="flex justify-between items-center p-4 sticky top-0 bg-silver z-10">
                <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                    My events
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </button>
            </div>

            {/* Список событий с обработкой загрузки и ошибок */}
            <div className="flex-1 p-4 overflow-y-auto">
                <ErrorBoundary>
                    <Suspense fallback={<LoadingSkeleton />}>
                        <EventsList resource={eventsResource} />
                    </Suspense>
                </ErrorBoundary>
                
                {loading && (
                    <div className="text-center py-4">
                        <p className="text-gray-600">Loading more events...</p>
                    </div>
                )}
            </div>

            {/* Модальное окно создания события */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <EventForm
                    onSubmit={handleCreateEvent}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}