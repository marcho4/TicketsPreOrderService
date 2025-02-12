import React, { Suspense, useMemo, useState } from 'react';
import { Plus, X} from "lucide-react";
import { createResource } from "../../lib/createResource";
import { useAuth } from "../../providers/authProvider";
import ErrorBoundary from "./ErrorBoundary";
import MatchCard from "./eventCard";

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
 * Компонент формы создания матча
 */
function MatchForm({ onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        matchDescription: '',
        teamHome: '',
        teamAway: '',
        stadium: '',
        matchDateTime: new Date() // пока храню только дату (и время), если нужно отдельно – расширьте
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formData.matchDateTime = new Date(formData.matchDateTime).toISOString();
        console.log(formData);
        onSubmit(formData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Создать новый матч</h2>

            {/* Описание матча */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание матча
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.matchDescription}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            matchDescription: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Домашняя команда */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Домашняя команда
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.teamHome}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            teamHome: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Гостевая команда */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Гостевая команда
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.teamAway}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            teamAway: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Стадион */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стадион
                </label>
                <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.stadium}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            stadium: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Дата и время матча (пока только через календарь) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата
                </label>
                <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.matchDateTime} // Убираем секунды и Z для корректного отображения
                    onChange={(e) => {
                        setFormData((prev) => ({
                            ...prev,
                            matchDateTime: e.target.value,
                        }));
                    }}
                />
            </div>

            {/* Кнопки формы */}
            <div className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                    Создать
                </button>
            </div>
        </form>
    );
}


/**
 * Список матчей
 */
function MatchesList({ resource }) {
    const matches = resource.read();

    if (!matches || matches.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xl text-gray-600">Нет доступных матчей</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}

/**
 * Компонент для отображения состояния загрузки (скелетон)
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
            ))}
        </div>
    );
}

export default function MatchesSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user, userRole } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);

    // Создаём ресурс с помощью Suspense (createResource).
    // Предполагается, что "user" — это ID организатора.
    const matchesResource = useMemo(() => {
        const fetchMatches = async () => {
            try {
                let response = await fetch(`http://localhost:8000/api/matches/org/${user}`, {
                    method: 'GET',
                    credentials: 'same-origin',
                });
                response = await response.json();
                // Предположим, что данные лежат в response.data
                return response.data || [];
            } catch (error) {
                console.error(error);
                return []; // или выбросить ошибку
            }
        };
        if (user && userRole === "ORGANIZER") {
            return createResource(fetchMatches);
        }
        return null;
    }, [user, userRole, refreshKey]);

    if (!user) {
        return <div>Загрузка пользователя...</div>;
    }

    if (!matchesResource) {
        return <div>Вы не являетесь организатором, чтобы видеть этот раздел</div>;
    }

    /**
     * Загрузка следующей страницы матчей (пример, если нужно пагинировать).
     */
    const loadMoreMatches = async () => {
        if (loading) return;
        setLoading(true);
        try {
            setPage((prev) => prev + 1);
        } catch (error) {
            console.error('Failed to load more matches:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Обработчик создания нового матча
     */
    const handleCreateMatch = async (data) => {
        const response = await fetch(`http://localhost:8000/api/matches/${user}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchDescription: data.matchDescription,
            teamHome: data.teamHome,
            teamAway: data.teamAway,
            stadium: data.stadium,
            matchDateTime: data.matchDateTime
          }),
        });
        setRefreshKey(refreshKey + 1);
        const result = await response.json();
        console.log('Создание матча:', result);
    };

    return (
        <div className="flex flex-col min-w-full min-h-96 rounded-lg bg-white shadow-lg border-gray-200 border">
            {/* Заголовок и кнопка добавления */}
            <div className="flex justify-between items-center p-4 sticky top-0 z-10">
                <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                    Мои матчи
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-button-secondary text-white rounded-md hover:bg-button-darker flex
                     transition-colors duration-300 items-center"
                >
                    <Plus className="mr-2 h-4 w-4" /> Добавить матч
                </button>
            </div>

            {/* Список матчей с обработкой загрузки и ошибок */}
            <div className="flex-1 p-4 overflow-y-auto">
                <ErrorBoundary>
                    <Suspense fallback={<LoadingSkeleton />}>
                        <MatchesList resource={matchesResource} />
                    </Suspense>
                </ErrorBoundary>

                {loading && (
                    <div className="text-center py-4">
                        <p className="text-gray-600">Загрузка матчей...</p>
                    </div>
                )}
            </div>

            {/* Модальное окно создания матча */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <MatchForm onSubmit={handleCreateMatch} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}