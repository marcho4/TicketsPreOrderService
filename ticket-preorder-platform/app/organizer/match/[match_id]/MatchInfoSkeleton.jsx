"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchInfoSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center mx-6 gap-y-5">
      {/* Title section skeleton */}
      <header className="flex flex-col w-full mx-10 py-10 rounded-lg items-center">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-12 w-80 mb-2" />
        <Skeleton className="h-6 w-72" />
      </header>
      
      <main className="flex flex-col min-w-full mx-10 rounded-lg items-center">
        {/* Match info + Scheme */}
        <div className="flex flex-col lg:flex-row max-w-full w-full p-6 gap-10">
          {/* Scheme section skeleton */}
          <Card className="w-full lg:w-3/5 mx-auto flex flex-col shadow-lg rounded-lg p-8">
            <CardHeader>
              <CardTitle className="text-3xl">
                <Skeleton className="h-8 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[300px] mb-5 sm:mb-10 rounded-[2em]" />
              <div className="w-full rounded-lg p-6 items-center justify-center flex flex-col">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-10 max-w-80 w-full mb-4" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Match info skeleton */}
          <Card className="w-full lg:w-2/5 mx-auto flex flex-col items-center shadow-lg rounded-lg p-8">
            <CardHeader>
              <CardTitle className="text-3xl lg:text-4xl font-bold mb-6">
                <Skeleton className="h-8 w-72" />
              </CardTitle>
            </CardHeader>

            <div className="flex flex-col w-full space-y-4">
              {Array(5).fill().map((_, index) => (
                <div key={index} className="flex flex-row w-full items-center border-b last:border-b-0 border-gray-200 py-4">
                  <Skeleton className="w-1/3 h-6" />
                  <Skeleton className="w-2/3 h-10 ml-2" />
                </div>
              ))}
              <div className="items-center w-full flex flex-row justify-center gap-x-5">
                <Skeleton className="h-12 max-w-64 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 