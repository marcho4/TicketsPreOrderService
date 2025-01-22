// components/DataSection.js
'use client';

import { Suspense, useState } from "react";
import { useAuth } from "../../providers/authProvider";
import { createResource } from "../../lib/createResource";
import ErrorBoundary from "./dataBoundary";

// Function to fetch organizer data
const fetchOrganizerData = async (id) => {
    const response = await fetch(`http://localhost:8000/api/organizer/get/${id}`, {
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

function DataDisplay({ resource }) {
    const data = resource.read();

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        email: data.email,
        organization: data.organization,
        tin: data.tin,
    });
    const handleEdit = () => {
        setIsEditing(true);
        setFormData({
            email: data.email,
            organization: data.organization,
            tin: data.tin,
        });
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleSave = async () => {
        try {
            console.log("Сохраняем данные в API (фейк-запрос):", formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
        }
    };

    const handleCancel = () => {
        setFormData({
            email: data.email,
            organization: data.organization,
            tin: data.tin,
        });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4">
            <h1 className="text-3xl font-semibold text-gray-900 leading-tight text-left mb-8">
                My account
            </h1>

            {!isEditing && (
                <>
                    <div className="min-w-full text-xl">
                        <strong>Email:</strong> {data.email}
                    </div>
                    <div className="min-w-full text-xl">
                        <strong>Organization:</strong> {data.organization}
                    </div>
                    <div className="min-w-full text-xl">
                        <strong>TIN:</strong> {data.tin}
                    </div>
                    <button className="bg-accent w-1/2 mt-4" onClick={handleEdit}>
                        Change information
                    </button>
                </>
            )}

            {isEditing && (
                <>
                    <div className="min-w-full text-xl mb-2">
                        <label className="block font-semibold text-gray-900 mb-1">Email:</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded"
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="min-w-full text-xl mb-2">
                        <label className="block font-semibold text-gray-900 mb-1">
                            Organization:
                        </label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded"
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="min-w-full text-xl mb-4">
                        <label className="block font-semibold text-gray-900 mb-1">TIN:</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded"
                            type="text"
                            name="tin"
                            value={formData.tin}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button className="bg-accent px-4 py-2 rounded text-white" onClick={handleSave}>
                            Save
                        </button>
                        <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
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