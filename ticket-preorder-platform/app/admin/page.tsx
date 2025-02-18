"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorBoundary from "./dataBoundary";
import { useAuth } from "@/providers/authProvider";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

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

// Компонент загрузки
function Loading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

// Основной компонент
const AdminHome = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, userRole } = useAuth();
  const router = useRouter();

  // Функция загрузки заявок
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании и изменении user
  useEffect(() => {
    loadRequests();
  }, [user]);

  // Обработчик принятия/отклонения заявки
  const handleResponse = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/process`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status: action })
      });
      const response = await res.json();
      if (response.status === 200) {
        // Перезагрузить список после успешного действия
        await loadRequests();
      } else {
        console.log(`Error ${action}ing request`);
      }
    } catch (error) {
      console.error("Error handling response:", error);
    }
    setTimeout(() => window.location.reload(), 500);
  };

  // Отрисовка таблицы с заявками
  const renderRequestList = () => {
    if (loading) {
      return <Loading />;
    }

    if (error) {
      return <p className="text-center text-red-500">Ошибка загрузки: {error.message}</p>;
    }

    if (!requests.length) {
      return <p className="text-center">Заявок нет.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Компания</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ИНН</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.request_id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{request.request_id}</td>
                <td className="px-4 py-2 text-sm">{request.company}</td>
                <td className="px-4 py-2 text-sm">{request.email}</td>
                <td className="px-4 py-2 text-sm">{request.tin}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleResponse(request.request_id, "APPROVED")}
                      className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1 h-auto"
                    >
                      Принять
                    </Button>
                    <Button
                      onClick={() => handleResponse(request.request_id, "REJECTED")}
                      className="bg-red-500 hover:bg-red-600 text-xs px-2 py-1 h-auto"
                    >
                      Отклонить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 md:py-10 gap-10">
      <Card className="w-full mx-auto bg-white rounded-xl md:rounded-3xl shadow-xl bg-opacity-90 mb-6 md:mb-10 overflow-hidden">
        <CardHeader className="space-y-1 pt-6 md:pt-8">
          <CardTitle className="text-xl md:text-3xl font-bold text-center">Список заявок на регистрацию</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ErrorBoundary>
              {renderRequestList()}
            </ErrorBoundary>
          </div>
        </CardContent>
      </Card>

      {userRole == "ADMIN" && (
        <Card className="w-full max-w-2xl py-4 md:py-5 flex flex-col mx-auto bg-white rounded-xl md:rounded-3xl items-center shadow-xl bg-opacity-90">
          <LogoutButton router={router} />
        </Card>
      )}
    </div>
  );
};

export default AdminHome;