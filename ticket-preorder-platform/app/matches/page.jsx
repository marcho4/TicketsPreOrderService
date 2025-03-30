"use client"

import MatchCard from "./MatchCard";
import {createResource} from "../../lib/createResource";
import {Suspense, useMemo} from "react";
import {fetchMatches} from "../../lib/dataFetchers";

export default function Page() {
    const resource = useMemo(() => createResource(fetchMatches), []);
    return (
        <div className="flex flex-col items-center justify-center min-w-full h-full gap-5 mt-5">
            <header className="text-3xl md:text-4xl lg:text-5xl font-semibold">
                Футбольные матчи
            </header>
            <div className="text-sm text-center sm:text-lg p-3">
                На этой странице собраны все предстоящие футбольные матчи. Оформить предзаказ можно при наличии билетов.
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <MatchesContainer resourse={resource} />
            </Suspense>        
        </div>
    );
}

function MatchesContainer({ resourse }) {
    const data = resourse.read();
    return (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl gap-y-10 gap-x-5 w-full items-center justify-items-center">
            {data.map((item, index) => (
                <MatchCard key={index} id={item.id} />
            ))}
        </div>
    )
}