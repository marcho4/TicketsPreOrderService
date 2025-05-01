'use client';

export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorBoundary from "./dataBoundary";
import LogoutButton from "@/components/LogoutButton";
import { fetchRequests } from "@/lib/dataFetchers";
import { useRouter } from 'next/navigation'
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
import { toast } from "@/hooks/use-toast";

interface Request {
  request_id: string;
  company: string;
  email: string;
  tin: string;
}

function Loading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

const AdminHome = () => {
  const router = useRouter();
  const [trigger, setTrigger] = useState(0);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchRequests();
        setRequests(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load requests");
        setLoading(false);
      }
    };
    loadData();
  }, [trigger]);

  const handleResponse = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`http://84.201.129.122:8000/api/admin/process`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status: action })
      });
      if (res.ok) {
        setTrigger(prev => prev + 1);
        toast({
          title: "Успешно!",
          description: "Заявка успешно обработана",
        });
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      toast({
        title: "Ошибка!",
        description: "Не удалось обработать заявку",
        variant: "destructive",
      });
    }
  };

  const RenderRequestList = ({ requests }: { requests: Request[] }) => {
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

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
              <RenderRequestList requests={requests} />
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