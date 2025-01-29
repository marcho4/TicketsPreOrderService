"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createResource } from "@/lib/createResource";
import ErrorBoundary from "./dataBoundary";

interface Request {
    request_id: string;
    company: string;
    email: string;
    tin: string;
}

// Функция для fetch запросов на регистрацию
const fetchRequests = async () => {
    const response = await fetch("http://localhost:8000/api/admin/requests", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch requests");
    }

    let body = await response.json();
    return body.data;
};

let requestResource: { read: () => Request[] } | null = null;

// Компонент для отображения данных
function RequestList({ resource, onResponse }: { 
    resource: { read: () => Request[] }, 
    onResponse: (requestId: string, action: "APPROVED" | "REJECTED") => void
}) {
    const requests = resource.read();
    console.log(requests);
    if (!requests.length) {
        return <p className="text-center">Заявок нет.</p>;
    }

    return (
        <table className="w-full">
            <thead>
                <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Компания</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">ИНН</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                </tr>
            </thead>
            <tbody>
                {requests.map((request) => (
                    <tr key={request.request_id}>
                        <td className="px-4 py-2">{request.request_id}</td>
                        <td className="px-4 py-2">{request.company}</td>
                        <td className="px-4 py-2">{request.email}</td>
                        <td className="px-4 py-2">{request.tin}</td>
                        <td className="px-4 py-2 flex gap-2">
                            <Button
                                onClick={() => onResponse(request.request_id, "APPROVED")}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Принять
                            </Button>
                            <Button
                                onClick={() => onResponse(request.request_id, "REJECTED")}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Отклонить
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// Компонент загрузки
function Loading() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );
}

// Основной компонент
function DataSection({ onUpdate }: { onUpdate?: () => void }) {
    const handleResponse = async (requestId: string, action: "APPROVED" | "REJECT") => {
        try {
            const res = await fetch(`http://localhost:8000/api/admin/process`, {
                method: "POST",
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: requestId, status: action })
            });
            const response = await res.json();
            if (response.status === 200) {
                requestResource = createResource(fetchRequests);
                if (onUpdate) onUpdate();
            } else {
                console.log(`Error ${action}ing request`);
            }
        } catch (error) {
            console.error("Error handling response:", error);
        }
    };

    if (!requestResource) {
        requestResource = createResource(fetchRequests);
    }

    return (
        <RequestList 
            resource={requestResource} 
            onResponse={handleResponse}
        />
    );
}

// Компонент-обертка
const AdminHome = () => {
    const [_, forceUpdate] = React.useState({});

    const handleUpdate = () => {
        forceUpdate({});
    };

    return (
        <div className="max-w-screen-xl mx-auto py-10">
            <Card className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl bg-opacity-90">
                <CardHeader className="space-y-1 pt-8">
                    <CardTitle className="text-3xl font-bold text-center">Список заявок на регистрацию</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <ErrorBoundary>
                            <Suspense fallback={<Loading />}>
                                <DataSection onUpdate={handleUpdate} />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminHome;