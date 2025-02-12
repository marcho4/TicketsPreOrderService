"use client";

import React, { Suspense, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { createResource } from "@/lib/createResource";
import { Button } from "./ui/button";
import { LogOut, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/providers/authProvider";

/*
  A skeleton fallback displayed while data is being fetched.
  Keeps the same structure so that the UI doesn’t shift much after loading.
*/
function DataCardSkeleton({ const_fields, mutable_fields }) {
    const fields = [...mutable_fields, ...const_fields];

    return (
        <article
            aria-busy="true"
            aria-label="Loading Data Card"
            className="flex max-w-xl flex-col bg-white rounded-lg p-4 gap-5 shadow-lg border border-gray-200"
        >
            {/* Header */}
            <header className="flex flex-row px-5 py-5 rounded-lg justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight px-4">
                        My profile
                    </h1>
                    <p className="text-black/80 text-lg px-4">
                        Manage your profile settings
                    </p>
                </div>
                <Button disabled className="bg-button-secondary max-w-56 py-2">
                    <LogOut className="mr-2" />
                    Logout
                </Button>
            </header>

            {/* Basic info skeleton */}
            <section className="px-5 py-4 rounded-lg">
                <div className="flex flex-row items-center justify-between mt-4">
                    <h2 className="text-3xl font-semibold mr-2 px-4">Basic info</h2>
                    <button
                        disabled
                        className="bg-button-secondary text-lg px-4 py-2 text-white max-w-40 rounded-lg flex flex-row items-center
                       transition-colors duration-300"
                    >
                        <Pencil className="mr-2" /> Edit
                    </button>
                </div>

                <div className="flex flex-col w-full mt-8">
                    <div className="flex flex-col w-full mt-6 space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={index}
                                className="flex max-w-full min-w-full flex-row items-center
                           justify-center h-[56px]"
                            >
                                <div
                                    className="w-1/3 text-xl bg-white font-semibold mr-2 px-4
                             rounded-lg h-full flex items-center"
                                >
                                    {field}
                                </div>
                                <div
                                    className="w-2/3 text-xl rounded-lg px-4 py-2 text-center
                             flex items-center animate-pulse justify-center bg-gray-200 h-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </article>
    );
}

/*
  This component handles both read-only display and edit mode.
  It reads data from the Suspense resource, then shows either a static view
  or input fields for editing.
*/
function DataCardContent({
                             resource,
                             updateFunc,
                             const_fields,
                             mutable_fields,
                         }) {
    const data = resource.read(); // Suspense read
    const router = useRouter();
    const { user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);

    // Preserve the original data for "Cancel" resets
    const originalData = data;
    const [formData, setFormData] = useState(originalData);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            await updateFunc(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving data:", error);
            // Potentially show a toast or user-facing error message here
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    return (
        <article className="flex flex-col max-w-xl bg-white rounded-lg p-4 gap-5 shadow-lg border border-gray-200">
            {/* Header with logout button */}
            <header className="flex flex-row px-5 py-5 rounded-lg justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight px-4">
                        My profile
                    </h1>
                    <p className="text-black/80 text-lg px-4">
                        Manage your profile settings
                    </p>
                </div>
                <LogoutButton router={router} />
            </header>

            {/* Main section (read-only or edit mode) */}
            <section className="px-5 py-4 rounded-lg">
                {/* Top row: Title + Edit button */}
                <div className="flex flex-row items-center justify-between mt-4">
                    <h2 className="text-3xl font-semibold mr-2 px-4">Basic info</h2>
                    {!isEditing ? (
                        <button
                            className="bg-button-secondary text-white_smoke px-4 py-2 max-w-40 rounded-lg
                         flex flex-row items-center hover:bg-dark-grey transition-colors duration-300"
                            onClick={handleEdit}
                        >
                            <Pencil className="mr-2" /> Edit
                        </button>
                    ) : (
                        /* If editing, show a "Cancel edit" style button (could rename if you like) */
                        <button
                            className="bg-button-secondary px-4 py-2 text-white max-w-40 rounded-lg
                         flex flex-row items-center hover:bg-dark-grey transition-colors duration-300"
                            onClick={handleCancel}
                        >
                            <Pencil className="mr-2" /> Cancel
                        </button>
                    )}
                </div>

                {/* Content area: read-only vs. edit form */}
                {!isEditing ? (
                    /* ---------- READ-ONLY VIEW ---------- */
                    <div className="flex flex-col w-full mt-8">
                        <div id="labels" className="flex flex-col items-start gap-5">
                            <div className="flex flex-col w-full mt-6 space-y-4">
                                {[...mutable_fields, ...const_fields].map((field, index) => (
                                    <div
                                        key={index}
                                        className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]"
                                    >
                                        <div
                                            className="w-1/3 text-xl bg-white font-semibold mr-2 px-4
                                 rounded-lg h-full flex items-center"
                                        >
                                            {field}
                                        </div>
                                        <div
                                            className="w-2/3 text-xl rounded-lg px-4 py-2 text-center
                                 flex items-center justify-center bg-white h-full"
                                        >
                                            {data[field]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ---------- EDIT MODE ---------- */
                    <div className="flex flex-col w-full mt-8">
                        <div id="labels" className="flex flex-col items-start gap-5">
                            <div className="flex flex-col w-full mt-6 space-y-4">
                                {mutable_fields.map((field, index) => (
                                    <div
                                        key={index}
                                        className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]"
                                    >
                                        <div
                                            className="w-1/3 text-xl bg-white font-semibold mr-2 px-4
                                 rounded-lg h-full flex items-center"
                                        >
                                            {field}
                                        </div>
                                        <input
                                            value={formData[field]}
                                            name={field}
                                            onChange={handleChange}
                                            className="w-2/3 transition-colors text-xl rounded-lg px-4 py-2
                                 text-center flex justify-center h-full text-my_black/80
                                 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                        />
                                    </div>
                                ))}
                                {/* Save / Cancel buttons */}
                                <div className="flex space-x-4 px-4 justify-end">
                                    <button
                                        className="bg-gray-300 px-4 py-2 rounded"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-button-secondary px-4 py-2 rounded text-white"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </article>
    );
}

/*
  The main abstract component:
  1. Fetches data (fetchData)
  2. Updates data (updateData)
  3. Wraps everything in ErrorBoundary + Suspense
  4. Renders either DataCardSkeleton (fallback) or DataCardContent
*/
export default function DataCard({ const_fields, mutable_fields, updateLink, fetchLink }) {
    // Fetch function
    const fetchData = async () => {
        const response = await fetch(fetchLink, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            console.error("Failed to fetch data from:", fetchLink);
            const body = await response.json();
            console.error("Server response:", body.msg);
            throw new Error("Failed to fetch data");
        }

        const body = await response.json();
        if (!body.data) {
            console.error("No `data` field in response");
            throw new Error("Data field missing");
        }

        return body.data;
    };

    // Update function
    const updateData = async (updData) => {
        const response = await fetch(updateLink, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify(updData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to update data with PUT:", updateLink);
            throw new Error("Update failed");
        }
    };

    // Create a Suspense resource
    const resource = createResource(fetchData);

    return (
        <ErrorBoundary router={useRouter()}>
            <Suspense
                fallback={
                    <DataCardSkeleton
                        mutable_fields={mutable_fields}
                        const_fields={const_fields}
                    />
                }
            >
                <DataCardContent
                    resource={resource}
                    updateFunc={updateData}
                    const_fields={const_fields}
                    mutable_fields={mutable_fields}
                />
            </Suspense>
        </ErrorBoundary>
    );
}