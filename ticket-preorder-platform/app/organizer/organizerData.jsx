'use client';

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useAuth } from "../../providers/authProvider";
import { createResource } from "../../lib/createResource";
import ErrorBoundary from "./ErrorBoundary";
import { Pencil, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import {logout} from "../../lib/logout";

const fetchOrganizerData = async (id) => {
    const response = await fetch(`http://localhost:8000/api/organizer/get/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        console.error("Failed to fetch organizer data");
        throw new Error("Failed to fetch organizer data");
    }

    const body = await response.json();

    return {
        email: body.data.email,
        tin: body.data.tin,
        phone_number: body.data.phone_number,
        organization: body.data.organization_name,
    };
};

function DataDisplay({ resource }) {
    const data = resource.read();
    const router = useRouter();
    const { user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: data.email,
        organization_name: data.organization,
        phone_number: data.phone_number,
    });


    const handleEdit = () => {
        setIsEditing(true);
        setFormData({
            email: data.email,
            organization_name: data.organization,
            phone_number: data.phone_number,
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
            formData.tin = data.tin;
            const resp = await fetch(
                `http://localhost:8000/api/organizer/update/${user}`,
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify(formData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(await resp.json());
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
            phone_number: data.phone_number,
        });
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col min-w-full bg-white rounded-lg p-4 gap-5 shadow-lg border-gray-200 border">
            {/* Заголовок и кнопка logout */}
            <div className="flex flex-row px-5 py-5 rounded-lg justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight text-left px-4">
                        My profile
                    </h1>
                    <div className="text-black/80 text-lg px-4">
                        Manage your profile settings
                    </div>
                </div>
                <Button
                    onClick={() => logout(router)}
                    className="bg-button-secondary max-w-56 py-2 hover:bg-dark-grey"
                >
                    <LogOut className="mr-2" /> Logout
                </Button>
            </div>

            {/* Основная информация */}
            <div className="px-5 py-4 rounded-lg">
                {!isEditing ? (
                    <div className="flex flex-col justify-center min-w-full">
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                            <button
                                className="bg-button-secondary text-white_smoke px-4 py-2 max-w-40 rounded-lg flex flex-row items-center justify-start hover:bg-dark-grey transition-colors duration-300"
                                onClick={handleEdit}
                            >
                                <Pencil className="mr-2" /> Edit
                            </button>
                        </div>

                        <div className="flex flex-col w-full mt-8">
                            <div id="labels" className="flex flex-col items-start gap-5">
                                <div className="flex flex-col w-full mt-6 space-y-4">
                                    {[
                                        { label: "Email", value: data.email },
                                        { label: "Organization's Name", value: data.organization },
                                        { label: "Phone Number", value: data.phone_number },
                                        { label: "TIN", value: data.tin },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]"
                                        >
                                            <div className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                                {item.label}
                                            </div>
                                            <div className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center bg-white h-full">
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Режим редактирования
                    <div className="flex flex-col justify-center min-w-full">
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                            <button
                                className="bg-button-secondary px-4 py-2 text-white max-w-40 rounded-lg flex flex-row items-center justify-start hover:bg-dark-grey transition-colors duration-300"
                                onClick={handleCancel}
                            >
                                <Pencil className="mr-2" /> Edit
                            </button>
                        </div>

                        <div className="flex flex-col w-full mt-8">
                            <div id="labels" className="flex flex-col items-start gap-5">
                                <div className="flex flex-col w-full mt-6 space-y-4">
                                    {[
                                        { label: "Email", value: data.email, name: "email" },
                                        {
                                            label: "Organization's Name",
                                            value: data.organization,
                                            name: "organization_name",
                                        },
                                        { label: "Phone Number", value: data.phone_number, name: "phone_number" },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]"
                                        >
                                            <div className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                                {item.label}
                                            </div>
                                            <input
                                                value={formData[item.name]}
                                                name={item.name}
                                                onChange={handleChange}
                                                className="w-2/3 transition-colors text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center h-full text-my_black/80 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                    <div className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                        <div className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                            TIN
                                        </div>
                                        <div className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center bg-white h-full">
                                            {data.tin}
                                        </div>
                                    </div>
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
                    </div>
                )}
            </div>
        </div>
    );
}

function Loading() {
    return (
        <div className="flex flex-col min-w-full bg-white rounded-lg p-4 gap-5 shadow-lg border-gray-200 border">
            {/* Простейшая заглушка (скелет) для отображения загрузки */}
            <div className="flex flex-row px-5 py-5 rounded-lg justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight text-left px-4">
                        My profile
                    </h1>
                    <div className="text-black/80 text-lg px-4">
                        Manage your profile settings
                    </div>
                </div>
                <Button className="bg-button-secondary max-w-56 py-2">
                    <LogOut className="mr-2" /> Logout
                </Button>
            </div>
            <div className="px-5 py-4 rounded-lg">
                <div className="flex flex-col justify-center min-w-full">
                    <div className="flex flex-row items-center justify-between mt-4">
                        <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                        <button
                            disabled={true}
                            className="bg-button-secondary text-lg px-4 py-2 text-white max-w-40 rounded-lg flex flex-row items-center justify-start transition-colors duration-300"
                        >
                            <Pencil className="mr-2" /> Edit
                        </button>
                    </div>

                    <div className="flex flex-col w-full mt-8">
                        <div id="labels" className="flex flex-col items-start gap-5">
                            <div className="flex flex-col w-full mt-6 space-y-4">
                                {[
                                    { label: "Email" },
                                    { label: "Organization's Name" },
                                    { label: "Phone Number" },
                                    { label: "TIN" },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]"
                                    >
                                        <div className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                            {item.label}
                                        </div>
                                        <div
                                            className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex animate-pulse justify-center bg-dark-grey/40 h-full"
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DataSection() {
    const { user, userRole } = useAuth();

    const organizerResource = useMemo(() => {
        if (user && userRole === "ORGANIZER") {
            console.log("Creating resource with user.id=", user);
            return createResource(() => fetchOrganizerData(user));
        }
        console.log("Returning null resource");
        return null;
    }, [user, userRole]);


    if (!user || !organizerResource) {
        return <Loading />;
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading />}>
                <DataDisplay resource={organizerResource} />
            </Suspense>
        </ErrorBoundary>
    );
}