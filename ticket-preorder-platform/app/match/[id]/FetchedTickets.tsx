import {toast} from "@/hooks/use-toast";
import { TicketsTable } from "./tickets-table";
import { createColumns } from "./columns";

export interface TicketItem {
    id: string,
    match_id: string,
}

export default function FetchedTickets({resource, setRefreshResourceKey, matchId} : any) {
    const tickets = resource.read();

    const preorderTicket = async (item: TicketItem) => {
        try {
            let resp = await fetch(`http://localhost:8000/api/tickets/preorder/${item.id}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify({
                        user_id: "mock_user_id",
                        match_id: item.match_id
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            const data = await resp.json();
            if (resp.status == 200) {
                toast({
                    title: "Вы успешно предзаказали билет",
                    description: "Ожидайте уведомления на почту",
                })
                setRefreshResourceKey((prev: number) => prev + 1);
            } else {
                toast({
                    title: "Произошла ошибка при предзаказе",
                    description: "Попробуйте войти в систему и попробовать снова",
                    variant: "destructive",
                })
            }
        } catch (e) {
            console.error(e)
            toast({
                title: "Произошла ошибка при предзаказе"
            })
        }
    }

    const columns = createColumns(preorderTicket);

    return (
        <div className="relative w-full border  border-gray-300 rounded-lg bg-white">
            <div className="max-h-[360px] overflow-y-auto">
                <TicketsTable columns={columns} data={tickets} />
            </div>
        </div>
    );
}
