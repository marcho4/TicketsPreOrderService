"use client"

import {useAuth} from "@/providers/authProvider";
import {useRouter} from "next/navigation";
import DataCard from "@/components/DataCard";
import {useEffect} from "react";


export default function Dashboard() {
    const router = useRouter()
    const { user, userRole, isLoading } = useAuth();
    let fetchUrl = `http://localhost:8000/api/user/${user}`;
    let updateUrl = `http://localhost:8000/api/user/${user}/update`;
    const const_fields = ["email"];
    const mutableFields = ["birthday", "last_name", "name", "phone"];
    useEffect(()=>{}, [user, isLoading]);

    if (isLoading) {
        return <p>Загрузка...</p>;
    }

    // Если проверка окончена, но user по-прежнему null - значит, не залогинен
    if (!user) {
        return <p>Пользователь не залогинен</p>;
    }
    // If `user` is not yet loaded (null/undefined), show a loading state
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Loading user...</p>
            </div>
        );
    }

    return (
    <div className="flex flex-col min-h-screen">
      <header>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 bg-white lg:px-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6">
            <div>
                <DataCard const_fields={const_fields} fetchLink={fetchUrl}
                          updateLink={updateUrl} mutable_fields={mutableFields}>
                </DataCard>
            </div>
        </div>
      </main>
    </div>
  )
}

