import React, { Suspense, useMemo, useState } from 'react';
import { Plus, X} from "lucide-react";
import { createResource } from "@/lib/createResource";
import { useAuth } from "@/providers/authProvider";
import ErrorBoundary from "./ErrorBoundary";
import MatchCard from "./MatchCard";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * Компонент модального окна
 */
export function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <Card className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
                <Button
                    variant="primary"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-6 w-6" />
                </Button>
                {children}
            </Card>
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
        matchDateTime: new Date()
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formData.matchDateTime = new Date(formData.matchDateTime).toISOString();
        onSubmit(formData);
        onClose();
    };

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const DataRow = ({label, apiName, onChange, required=true, type="text"}) => {
        return (
            <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </Label>
                <Input
                    type={type}
                    required={required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData[apiName]}
                    name={apiName}
                    onChange={onChange}
                />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Создать новый матч</h2>

            <DataRow label={"Домашняя команда"} apiName={"teamHome"} onChange={handleChange}/>
            <DataRow label={"Гостевая команда"} apiName={"teamAway"} onChange={handleChange}/>
            <DataRow label={"Описание"} apiName={"description"} onChange={handleChange} required={false}/>
            <DataRow label={"Стадион"} apiName={"stadium"} onChange={handleChange}/>
            <DataRow label={"Дата проведения"} apiName={"matchDateTime"} onChange={handleChange} type={"datetime-local"}/>

            <div className="flex justify-end space-x-4 pt-4">
                <Button
                    type="button"
                    variant="primary"
                    onClick={onClose}
                >
                    Отмена
                </Button>
                <Button type="submit">
                    Создать
                </Button>
            </div>
        </form>
    );
}


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
            {[1, 2].map((i) => (
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
          credentials: "include",
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
        <Card className="flex flex-col min-w-full min-h-96 rounded-lg bg-white shadow-lg border-gray-200 border">
            {/* Заголовок и кнопка добавления */}
            <CardHeader className="flex flex-row justify-between items-center p-4 sticky top-0 z-10">
                <CardTitle className="text-3xl font-semibold text-gray-900 leading-tight">
                    Мои матчи
                </CardTitle>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Добавить матч
                </Button>
            </CardHeader>

            {/* Список матчей с обработкой загрузки и ошибок */}
            <CardContent className="flex-1 p-4 overflow-y-auto">
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
            </CardContent>

            {/* Модальное окно создания матча */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <MatchForm onSubmit={handleCreateMatch} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </Card>
    );
}