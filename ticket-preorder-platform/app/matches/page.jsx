"use client"

import MatchCard from "../../components/MatchCard";
import {createResource} from "../../lib/createResource";
import {Suspense, useMemo} from "react";

const fetchMatches = async () => {
    try {
        let response = await fetch(`http://localhost:8000/api/matches/all`, {
            method: "GET",
            credentials: "include",
        })
        response = await response.json();
        return response.data;
    } catch (e) {
        console.error(e)
    }
}

export default function Page() {
    const resource = useMemo(() => createResource(fetchMatches), []);
    return (
        <div className="flex flex-col items-center justify-center min-w-full h-full gap-5">
            <header className="text-3xl md:text-4xl lg:text-5xl font-semibold">
                Football matches
            </header>
            <div>
                On this page you can see all the available matches for tickets preordering.
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <MatchesContainer resourse={resource} />
            </Suspense>
        </div>
    );
}

function MatchesContainer({ resourse }) {
    const data = resourse.read();
    console.log("match data ", data);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl gap-y-10 gap-x-5 w-full items-center justify-items-center">
            {data.map((item, index) => (
                <MatchCard key={index} id={item.id} />
            ))}
        </div>
    )
}