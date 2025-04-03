"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TicketsSkeleton() {
  return (
    <div className='flex flex-col items-center justify-center mx-6'>
      <div className="flex flex-col lg:flex-row max-w-full w-full p-6 gap-10">
        <Card className="flex flex-col max-w-full w-full shadow-lg rounded-lg">
          <CardHeader className="text-3xl md:text-4xl font-bold text-center mb-6">
            <CardTitle>
              <Skeleton className="h-10 w-64 mx-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center w-full justify-center rounded-lg gap-y-10">
            <div className="container mx-auto">
              {/* DataTable скелетон */}
              <div className="border rounded-md">
                {/* Заголовок таблицы */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-8 w-64" />
                </div>
                
                {/* Заголовки колонок */}
                <div className="grid grid-cols-6 gap-4 p-4 border-b">
                  {Array(6).fill().map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
                
                {/* Строки таблицы */}
                {Array(5).fill().map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4 border-b">
                    {Array(6).fill().map((_, cellIndex) => (
                      <Skeleton key={cellIndex} className="h-6 w-full" />
                    ))}
                  </div>
                ))}
                
                {/* Пагинация */}
                <div className="flex items-center justify-end p-4">
                  <Skeleton className="h-8 w-64" />
                </div>
              </div>
              
              {/* Кнопка */}
              <div className="flex justify-end w-full mt-4">
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 