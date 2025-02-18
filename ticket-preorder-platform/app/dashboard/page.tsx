"use client";
import {useAuth} from "@/providers/authProvider";
import {useRouter} from "next/navigation";
import DataCard from "@/components/DataCard";
import {useEffect, useState} from "react";

// Let's create a TicketsList component
const TicketsList = ({userId}) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTickets = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // For GET requests, we shouldn't pass a body
        const response = await fetch(`http://localhost:8000/tickets/user/${userId}`, {
          method: 'GET',
          credentials: "include",
          headers: {'Content-Type': 'application/json'}
        });
        
        if (!response || !response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        
        const result = await response.json();
        setTickets(result.data || []);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching tickets');
        console.error('Error fetching tickets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getTickets();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500">No tickets found for this user.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{ticket.match_id}</td>
                <td className="px-4 py-2 text-sm">{ticket.sector}</td>
                <td className="px-4 py-2 text-sm">{ticket.row}</td>
                <td className="px-4 py-2 text-sm">{ticket.seat}</td>
                <td className="px-4 py-2 text-sm">{ticket.price}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const {user, userRole, isLoading} = useAuth();
  let fetchUrl = `http://localhost:8000/api/user/${user}`;
  let updateUrl = `http://localhost:8000/api/user/${user}/update`;
  const const_fields = ["email"];
  const mutableFields = ["birthday", "last_name", "name", "phone"];

  useEffect(() => {}, [user, isLoading]);

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  // Если проверка окончена, но user по-прежнему null - значит, не залогинен
  if (!user) {
    return <p>Пользователь не залогинен</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 bg-white lg:px-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - User profile */}
            <div className="md:w-1/2">
              <DataCard
                const_fields={const_fields}
                fetchLink={fetchUrl}
                updateLink={updateUrl}
                mutable_fields={mutableFields}
              />
            </div>
            
            {/* Right side - Tickets list */}
            <div className="md:w-1/2">
              <TicketsList userId={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}