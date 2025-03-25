import React from 'react';
import Link from 'next/link';
import {Card, CardDescription, CardHeader, CardTitle} from "../../components/ui/card";
import {formatDate} from "../matches/MatchCard";

/**
 * Карточка матча
 * @param {Object} match - Объект матча
 * @param {string} match.id - Уникальный идентификатор матча
 * @param {string} match.teamHome - Название домашней команды
 * @param {string} match.teamAway - Название гостевой команды
 * @param {string} match.matchDescription - Короткое описание матча
 * @param {string} match.matchDateTime - Дата/время матча (ISO-строка)
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
            <Card className="cursor-pointer min-h-24">
                <CardHeader>
                    <CardTitle>
                        {matchTitle}
                    </CardTitle>
                    <CardDescription className="text-gray-800">{formattedDate}</CardDescription>

                    {match.matchDescription && (
                        <CardDescription className="flex flex-row w-full justify-between">
                            {match.matchDescription}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>
        </Link>
    );
}