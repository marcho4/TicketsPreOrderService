import React, { Suspense, useMemo, useState } from 'react';
import { Plus} from "lucide-react";
import { createResource } from "@/lib/createResource";
import { useAuth } from "@/providers/authProvider";
import ErrorBoundary from "./ErrorBoundary";
import MatchCard from "./MatchCard";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Modal} from "@/components/Modal";
import {toast} from "@/hooks/use-toast";
import {Skeleton} from "@/components/ui/skeleton";
import MatchForm from "@/app/organizer/MatchForm";

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
export function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
            ))}
        </div>
    );
}

export default function MatchesSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, userRole } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [matchLogo, setMatchLogo] = useState();

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
                return response.data || [];
            } catch (error) {
                console.error(error);
                return [];
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

        if (response.status == 201) {
            toast({
                title: "Матч успешно создан",
            })

            const body = await response.json();
            const uploadForm = new FormData();
            uploadForm.set('type', 'match-photos');
            uploadForm.append('image', matchLogo);
            uploadForm.set('match_id', body.data.id);

            const uploadFormFunc = async (formData) => {
                try {
                    const response = await fetch(`/api/upload`, {
                        method: 'PUT',
                        credentials: 'include',
                        body: formData,
                    })
                    const body = await response.json();
                    if (response.status === 200) {
                        toast({
                            title: 'Вы успешно загрузили схему',
                            description: body.msg
                        })
                    } else {
                        toast({
                            title: 'Произошла ошибка при загрузке схемы',
                            description: body.msg
                        })
                    }

                } catch (error) {
                    console.log(error);
                }
            }
            uploadFormFunc(uploadForm);

        } else {
            const result = await response.json();
            toast({
                title: "Ошибка при создании матча",
                description: result.msg,
            })
        }
    };

    return (
        <Card className="flex flex-col min-w-full min-h-96">
            {/* Заголовок и кнопка добавления */}
            <CardHeader className="flex flex-row justify-between items-center p-4 sticky top-0">
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                    Мои матчи
                </CardTitle>
                <Button onClick={() => setIsModalOpen(true)} size={window.innerWidth > 768 ? "default" : "sm"}>
                    <Plus className="mr-2 h-4 w-4" /> Добавить матч
                </Button>
            </CardHeader>

            {/* Список матчей с обработкой загрузки и ошибок */}
            <CardContent className="flex-1 p-4 overflow-y-auto max-h-72">
                <ErrorBoundary>
                    <Suspense fallback={<LoadingSkeleton />}>
                        <MatchesList resource={matchesResource} />
                    </Suspense>
                </ErrorBoundary>
            </CardContent>

            {/* Модальное окно создания матча */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <MatchForm
                    onSubmit={handleCreateMatch}
                    matchLogo={matchLogo}
                    matchLogoSetter={setMatchLogo}
                    onClose={() => setIsModalOpen(false)} />
            </Modal>
        </Card>
    );
}