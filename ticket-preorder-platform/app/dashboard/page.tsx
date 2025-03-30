"use client";
import {useAuth} from "@/providers/authProvider";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import UserDataCard from "@/components/UserDataCard";
import UserTicketsCard from "@/app/dashboard/UserTickets";


export default function Dashboard() {
  const {user, isLoading} = useAuth();
  let fetchUrl = `http://localhost:8000/api/user/${user}`;
  let updateUrl = `http://localhost:8000/api/user/${user}/update`;

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  // Если проверка окончена, но user по-прежнему null - значит, не залогинен
  if (!user) {
    return <p>Пользователь не залогинен</p>;
  }

  return (
    <div className="flex flex-col min-h-screen pt-10 p-2">
      <Card className="max-w-7xl mx-auto w-full text-xl sm:text-3xl">
        <CardHeader>
          <CardTitle>
            Личный кабинет
          </CardTitle>
        </CardHeader>
      </Card>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - User profile */}
            <div className="md:w-1/2 flex flex-col gap-6 items-center sm:items-stretch">
              <UserDataCard fetchLink={fetchUrl} updateLink={updateUrl}/>
            </div>
            
            {/* Right side - Tickets list */}
            <div className="md:w-1/2 flex flex-col gap-6">
              <UserTicketsCard userId={user} />
              <ChangePasswordSection/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}