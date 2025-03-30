"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorBoundary from "./dataBoundary";
import { useAuth } from "@/providers/authProvider";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { fetchRequests } from "@/lib/dataFetchers";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Request {
  request_id: string;
  company: string;
  email: string;
  tin: string;
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
const AdminHome = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
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
    // setTimeout(() => window.location.reload(), 500);
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
        <Table>
          <TableCaption className="relative">
            Список заявок на регистрацию
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Компания</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>ИНН</TableHead>
              <TableHead>Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell className="px-4 py-2 whitespace-nowrap text-sm">{request.request_id}</TableCell>
                  <TableCell className="px-4 py-2 text-sm">{request.company}</TableCell>
                  <TableCell className="px-4 py-2 text-sm">{request.email}</TableCell>
                  <TableCell className="px-4 py-2 text-sm">{request.tin}</TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                          onClick={() => handleResponse(request.request_id, "APPROVED")}
                          className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1 h-auto">
                        Принять
                      </Button>
                      <Button
                          onClick={() => handleResponse(request.request_id, "REJECTED")}
                          className="bg-red-500 hover:bg-red-600 text-xs px-2 py-1 h-auto">
                        Отклонить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">{requests.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 md:py-10 gap-10">
      <Card className="w-full mx-auto bg-white rounded-xl md:rounded-3xl shadow-xl bg-opacity-90 mb-6 md:mb-10 overflow-hidden">
        <CardHeader className="relative space-y-1 pt-6 md:pt-8">
          <CardTitle className="text-xl md:text-3xl font-bold text-center">
            Список заявок на регистрацию
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ErrorBoundary>
              {renderRequestList()}
            </ErrorBoundary>
          </div>
        </CardContent>
        <CardFooter className="items-end justify-end flex w-full flex-col">
           <LogoutButton router={router} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminHome;