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
        <div className="flex flex-col min-w-full bg-[#cbf3f0] rounded-lg p-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight text-left">
                My profile
            </h1>
            <div className="text-black/80 text-lg">
                Manage your profile settings
            </div>
            <div className="h-[1px] min-w-full bg-black my-5"></div>

            {!isEditing && (
                <div className="flex flex-col justify-center min-w-full">
                    <div className="text-2xl font-semibold">Basic info</div>

                    <div className="flex flex-col w-full mt-8">
                        <div id="labels" className="flex flex-col items-start gap-5">
                            <div className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                <div
                                    className="w-1/3 text-xl  mr-2 px-4 rounded-lg bg-[#2ec4b6] h-full flex items-center">
                                    My email
                                </div>
                                <input
                                    placeholder="tin here"
                                    className="w-2/3 text-xl rounded-lg px-4 py-2 h-full border border-gray-300"
                                />
                            </div>
                            <div className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                <div
                                    className="w-1/3 text-xl  mr-2 px-4 rounded-lg bg-[#2ec4b6] h-full flex items-center">
                                    My Organization's Name
                                </div>
                                <input
                                    placeholder="tin here"
                                    className="w-2/3 text-xl rounded-lg px-4 py-2 h-full border border-gray-300"
                                />
                            </div>
                            <div className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                <div
                                    className="w-1/3 text-xl  mr-2 px-4 rounded-lg bg-[#2ec4b6] h-full flex items-center">
                                    My TIN
                                </div>
                                <input
                                    placeholder="tin here"
                                    className="w-2/3 text-xl rounded-lg px-4 py-2 h-full border border-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                    <button className="bg-deep_blue text-xl text-white w-full max-w-80 mt-10 p-2 rounded-lg"
                            onClick={handleEdit}>
                        Change information
                    </button>
                </div>
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