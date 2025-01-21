// components/DataSection.js
'use client';

import { Button } from "../../components/ui/button";
import { Suspense } from "react";
import { useAuth } from "../../providers/authProvider";
import { createResource } from "../../lib/createResource";
import ErrorBoundary from "./dataBoundary";

// Function to fetch organizer data
const fetchOrganizerData = async (id) => {
    const response = await fetch(`http://localhost:8004/get_account_info/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        console.log("Failed to fetch organizer data");
    }

    const body = await response.json();

    return {
        email: body.email,
        tin: body.tin,
        phone_number: body.phone_number,
        organization: body.organization_name,
    };
};

let organizerResource;

export default function DataSection() {
    const { user } = useAuth();

    if (!organizerResource) {
        organizerResource = createResource(() => fetchOrganizerData(user));
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading />}>
                <DataDisplay resource={organizerResource} />
            </Suspense>
        </ErrorBoundary>
    );
}

// Component to display the data
function DataDisplay({ resource }) {
    const data = resource.read(); // This will suspend if data is not ready

    return (
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4">
            <h1 className="text-3xl font-semibold text-gray-900 leading-tight text-left mb-8">
                My account
            </h1>
            <div className="min-w-full text-xl">
                <strong>Email:</strong> {data.email}
            </div>
            <div className="min-w-full text-xl">
                <strong>Organization:</strong> {data.organization}
            </div>
            <div className="min-w-full text-xl">
                <strong>TIN:</strong> {data.tin}
            </div>
            <button className="bg-accent w-1/2">Change information</button>
        </div>
    );
}

// Loading component for the fallback
function Loading() {
    return (
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4 animate-pulse ">
            <h1 className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </h1>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            {/*<button className="bg-accent w-1/2">Change information</button>*/}
        </div>
    );
}