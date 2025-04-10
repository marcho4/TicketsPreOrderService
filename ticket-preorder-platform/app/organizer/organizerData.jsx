"use client";

import React, { useEffect, useState, useCallback } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import {Skeleton} from "../../components/ui/skeleton";
import {Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";import {Button} from "../../components/ui/button";
import LogoutButton from "../../components/LogoutButton";
import {toast} from "../../hooks/use-toast";


function DataCardSkeleton() {
    return (
        <Card className="flex flex-col max-w-xl p-4 gap-5">
            <CardHeader className="flex flex-row py-5 rounded-lg justify-between gap-5">
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-row items-center justify-between mt-4 w-full mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </CardFooter>
        </Card>
    );
}

function DataRow({ label, apiName, isEditing, handleChange, type = "text", formData }) {
    return (
        <div className="grid grid-cols-2 items-center gap-4 py-2">
            <Label className="text-sm sm:text-lg font-medium">{label}</Label>
            <Input
                disabled={!isEditing}
                className="disabled:cursor-auto disabled:opacity-100"
                onChange={handleChange}
                name={apiName}
                type={type}
                value={formData[apiName] || ""}
            />
        </div>
    );
}

function DataCardContent({ data, updateFunc, refreshData }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(data);

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
            if (formData.tin.length !== 12) {
                toast({
                    title: "Ошибка при обновлении данных.",
                    description: "ИНН должен содержать 12 цифр",
                    variant: "destructive",
                });
                return;
            }
            if (!/^(\+7|8)[0-9]{10}$/.test(formData.phone_number)) {
                toast({
                    title: "Ошибка при обновлении данных.",
                    description: "Введите корректный номер телефона",
                    variant: "destructive",
                });
                return;
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
                toast({
                    title: "Ошибка при обновлении данных.",
                    description: "Введите корректный email",
                    variant: "destructive",
                });
                return;
            }
            await updateFunc(formData);
            setIsEditing(false);
            refreshData();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleCancel = () => {
        setFormData(data);
        setIsEditing(false);
    };

    return (
        <Card className="flex flex-col gap-5">
            <CardHeader className="flex flex-row py-5 rounded-lg justify-between gap-5">
                <div className="flex flex-col">
                    <CardTitle className="text-xl sm:text-2xl">Мой профиль</CardTitle>
                    <CardDescription>Управлять своими данными</CardDescription>
                </div>
                <LogoutButton router={router} />
            </CardHeader>
            <CardContent>
                <div className="flex flex-row items-center justify-between mt-4 w-full mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold">Ваши данные</h2>
                    <Button onClick={isEditing ? handleCancel : handleEdit} size="sm" variant={"secondary"}>
                        <Pencil className="mr-2" /> {!isEditing ? "Редактировать" : "Отменить"}
                    </Button>
                </div>
                <DataRow formData={formData} label={"Организация"} apiName={"organization_name"} isEditing={isEditing} handleChange={handleChange} />
                <DataRow formData={formData} label={"ИНН"} apiName={"tin"} isEditing={isEditing} handleChange={handleChange} />
                <DataRow formData={formData} label={"Email"} apiName={"email"} isEditing={isEditing} handleChange={handleChange} type="email" />
                <DataRow formData={formData} label={"Телефон"} apiName={"phone_number"} isEditing={isEditing} handleChange={handleChange} type="tel" />
            </CardContent>
            {isEditing && (
                <CardFooter className="flex space-x-4 px-4 justify-end">
                    <Button variant="secondary" onClick={handleCancel}>
                        Отменить
                    </Button>
                    <Button variant="outline" onClick={handleSave}>
                        Сохранить
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default function OrgDataCard({ updateLink, fetchLink }) {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(fetchLink, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                toast({
                    title: "Ошибка при получении данных.",
                    description: "Разработчики уже работают над проблемой",
                });
                throw new Error("Ошибка при получении данных");
            }

            const body = await response.json();
            if (!body.data) {
                console.error("No `data` field in response");
                throw new Error("Data field missing");
            }

            setData(body.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchLink]);

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
            toast({
                title: "Ошибка при обновлении данных.",
                description: "Разработчики уже работают над проблемой",
            });
            throw new Error("Не удалось обновить");
        }
        toast({
            title: "Данные успешно обновлены",
        });
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <DataCardSkeleton />;
    if (error) return <div>Error: {error}</div>;

    return (
        <ErrorBoundary router={router}>
            <DataCardContent data={data} updateFunc={updateData} refreshData={fetchData} />
        </ErrorBoundary>
    );
}