"use client";

import { useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import Image from "next/image";
import ErrorBoundary from "./ErrorBoundary";
import { createResource } from "@/lib/createResource";

/**
 * Define a type that describes the shape of the data
 * you expect from the API.
 */
interface MatchData {
    teamHome: string;
    teamAway: string;
}

/**
 * A utility function to fetch match data.
 * Returns a Promise that resolves to MatchData.
 */
async function fetchMatchData(id: string): Promise<MatchData> {
    try {
        const response = await fetch(`http://localhost:8000/api/matches/${id}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            // Optionally handle non-200 responses
            throw new Error(`Failed to fetch match data: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data as MatchData;
    } catch (error) {
        console.error("Error fetching match data:", error);
        throw error;
    }
}

interface MatchCardProps {
    id: string;
}

export default function MatchCard({ id }: MatchCardProps) {
    // Create a Suspense resource for the specific match
    const resource = useMemo(() => createResource(() => fetchMatchData(id)), [id]);

    return (
        <ErrorBoundary>
            <Suspense fallback={<MatchCardLoading />}>
                <MatchCardContent resource={resource} id={id} />
            </Suspense>
        </ErrorBoundary>
    );
}

/**
 * The actual card content that displays once data has loaded.
 * We use resource.read() to get the data; if it's not yet available,
 * it will throw a Promise, which Suspense will catch.
 */
function MatchCardContent({
                              resource,
                              id,
                          }: {
    resource: ReturnType<typeof createResource<MatchData>>;
    id: string;
}) {
    const data = resource.read();
    const router = useRouter();

    const handleClick = () => {
        router.push(`/match/${id}`);
    };

    return (
        <section
            className="group relative flex max-w-96 h-52 w-full overflow-hidden rounded-lg cursor-pointer"
            onClick={handleClick}
            aria-label={`Match between ${data.teamHome} and ${data.teamAway}`}
        >
            {/* We use next/image for the background, but let's wrap it in a container. */}
            <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <Image
                    src="/match_preview.jpg"
                    alt="Match preview background"
                    fill
                    className="object-cover"
                    priority={false}
                />
            </div>

            {/* Overlay with the match info */}
            <div className="relative flex items-center justify-center w-full text-center">
                <div className="bg-gray-50 bg-opacity-90 rounded-lg px-4 py-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {data.teamHome} - {data.teamAway}
                    </h2>
                </div>
            </div>
        </section>
    );
}

/**
 * A skeleton/loading state to display while data is being fetched.
 * We use aria-busy to aid assistive technologies.
 */
function MatchCardLoading() {
    return (
        <section
            className="group relative flex max-w-96 h-52 w-full overflow-hidden rounded-lg animate-pulse"
            aria-busy="true"
            aria-label="Loading match card"
        >
            <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <Image
                    src="/match_preview.jpg"
                    alt="Placeholder background while loading"
                    fill
                    className="object-cover opacity-70"
                    priority={true}
                />
            </div>
            <div className="relative flex items-center justify-center w-full text-center">
                <div className="bg-gray-50 bg-opacity-60 rounded-lg px-4 py-2">
                    <h2 className="text-xl font-semibold text-gray-500">Loading...</h2>
                </div>
            </div>
        </section>
    );
}