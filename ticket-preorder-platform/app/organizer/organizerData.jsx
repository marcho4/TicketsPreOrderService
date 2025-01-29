'use client';

import {Suspense, useEffect, useState} from "react";
import { useAuth } from "../../providers/authProvider";
import { createResource } from "../../lib/createResource";
import ErrorBoundary from "./dataBoundary";
import {Pencil} from "lucide-react";
import {id} from "date-fns/locale";


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
        email: body.data.email,
        tin: body.data.tin,
        phone_number: body.data.phone_number,
        organization: body.data.organization_name,
    };
};

let organizerResource;

function DataDisplay({ resource }) {
    const data = resource.read();
    console.log(data);

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
            let resp = await fetch(`http://localhost:8000/api/organizer/update/${id}`, {
                method: "POST",
                credentials: "include",
                body: ({
                    email: data.email,
                    phone_number: data.phone_number,
                    organization_name: data.organization,
                })
            })
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
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4 gap-5">
            <div className="border-2 border-deep_blue/40 px-5 py-5 rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight text-left px-4">
                    My profile
                </h1>
                <div className="text-black/80 text-lg px-4">
                    Manage your profile settings
                </div>
            </div>
            <div className="border-2 border-deep_blue/40 px-5 py-4 rounded-lg">
                {!isEditing ? (
                    <div className="flex flex-col justify-center min-w-full">
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                            <button className="bg-dark-grey/80 text-lg px-4 py-2 text-white max-w-40  rounded-lg
                            flex flex-row items-center justify-start hover:bg-dark-grey transition-colors duration-300"
                                    onClick={handleEdit}>
                                <Pencil className="mr-2"/> Edit
                            </button>
                        </div>

                        <div className="flex flex-col w-full mt-8">
                            <div id="labels" className="flex flex-col items-start gap-5">
                                <div className="flex flex-col w-full mt-6 space-y-4">
                                    {[
                                        {label: "Email", value: data.email},
                                        {label: "Organization's Name", value: data.organization},
                                        {label: "Phone Number", value: data.phone_number},
                                        {label: "TIN", value: data.tin},
                                    ].map((item, index) => (
                                        <div key={index}
                                            className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                            <div
                                                className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                                {item.label}
                                            </div>
                                            <div
                                                className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center bg-white h-full">
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center min-w-full">
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                            <button className="bg-dark-grey/80 text-lg px-4 py-2 text-white max-w-40  rounded-lg
                            flex flex-row items-center justify-start hover:bg-dark-grey transition-colors duration-300"
                                    onClick={handleEdit}>
                                <Pencil className="mr-2"/> Edit
                            </button>
                        </div>

                        <div className="flex flex-col w-full mt-8">
                            <div id="labels" className="flex flex-col items-start gap-5">
                                <div className="flex flex-col w-full mt-6 space-y-4">
                                    {[
                                        {label: "Email", value: data.email},
                                        {label: "Organization's Name", value: data.organization},
                                        {label: "Phone Number", value: data.phone_number},
                                    ].map((item, index) => (
                                        <div key={index}
                                             className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                            <div
                                                className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                                {item.label}
                                            </div>
                                            <input
                                                placeholder={item.value}
                                                className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center bg-white h-full">
                                            </input>
                                        </div>
                                    ))}
                                    <div className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                        <div
                                            className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                            TIN
                                        </div>
                                        <div
                                            className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex justify-center bg-white h-full">
                                            {data.tin}
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button className="bg-accent px-4 py-2 rounded text-white" onClick={handleSave}>
                                            Save
                                        </button>
                                        <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>
                                            Cancel
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
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4 gap-5">
            <div className="border-2 border-deep_blue/40 px-5 py-5 rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight text-left px-4">
                    My profile
                </h1>
                <div className="text-black/80 text-lg px-4">
                    Manage your profile settings
                </div>
            </div>
            <div className="border-2 border-deep_blue/40 px-5 py-4 rounded-lg">
                <div className="flex flex-col justify-center min-w-full">
                <div className="flex flex-row items-center justify-between mt-4">
                        <div className="text-3xl font-semibold mr-2 px-4">Basic info</div>
                        <button className="bg-dark-grey/80 text-lg px-4 py-2 text-white max-w-40  rounded-lg
                        flex flex-row items-center justify-start hover:bg-dark-grey transition-colors duration-300">
                            <Pencil className="mr-2"/> Edit
                        </button>
                    </div>

                    <div className="flex flex-col w-full mt-8">
                        <div id="labels" className="flex flex-col items-start gap-5">
                            <div className="flex flex-col w-full mt-6 space-y-4">
                                {[
                                    {label: "Email"},
                                    {label: "Organization's Name"},
                                    {label: "Phone Number"},
                                    {label: "TIN"},
                                ].map((item, index) => (
                                    <div key={index}
                                         className="flex max-w-full min-w-full flex-row items-center justify-center h-[56px]">
                                        <div
                                            className="w-1/3 text-xl bg-white font-semibold mr-2 px-4 rounded-lg h-full flex items-center">
                                            {item.label}
                                        </div>
                                        <div
                                            className="w-2/3 text-xl rounded-lg px-4 py-2 text-center items-center flex
                                            animate-pulse justify-center bg-dark-grey/40 h-full">
                                        </div>
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
    const {user} = useAuth();

    useEffect(() => {

    }, [user])

    // Пока `user` не определен, показываем загрузку
    if (!user) {
        return <Loading/>;
    }

    if (!organizerResource) {
        organizerResource = createResource(() => fetchOrganizerData(user));
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading/>}>
                <DataDisplay resource={organizerResource} id={user}/>
            </Suspense>
        </ErrorBoundary>
    );
}