import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface TicketItem {
    id: string,
    match_id: string,
}

export default function FetchedTickets({resource, setRefreshResourceKey} : any) {
    const tickets = resource.read();

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center mx-auto h-full">
                На данный момент нет доступных для предзаказа билетов
                <Button className="mt-10" onClick={() => {
                    toast({
                        title:"Вы успешно встали в очередь",
                        description: "Вам придет оповещение, как только билеты станут доступными"})
                }}>
                    Встать в очередь за билетами
                </Button>
            </div>
        );
    }

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
            console.log(data);
            if (resp.status == 200) {
                toast({
                    title: "Вы успешно предзаказали билет",
                    description: "Ожидайте уведомления на почту",
                })
                setRefreshResourceKey((prev) => prev + 1);
            } else {
                toast({
                    title: "Произошла ошибка при предзаказе"
                })
            }
        } catch (e) {
            console.error(e)
            toast({
                title: "Произошла ошибка при предзаказе"
            })
        }
    }

    return (
        <div className="relative w-full border  border-gray-300 rounded-lg bg-white">
            <div className="max-h-[350px] overflow-y-auto">
                <table className="table-fixed w-full border-collapse">
                    <TableHeader className="sticky top-0 bg-gray-100 z-30">
                        <TableRow className="text-left">
                            <TableHead className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                Ряд
                            </TableHead>
                            <TableHead className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                Место
                            </TableHead>
                            <TableHead className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                Цена
                            </TableHead>
                            <TableHead className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                Сектор
                            </TableHead>
                            <TableHead className="w-1/3 px-4 py-2 border-b border-gray-300 text-center font-semibold text-gray-700">
                                Предзаказ
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((item, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="px-4 py-2 border-b border-gray-200">
                                    {item.row}
                                </TableCell>
                                <TableCell className="px-4 py-2 border-b border-gray-200">
                                    {item.seat}
                                </TableCell>
                                <TableCell className="px-4 py-2 border-b border-gray-200">
                                    {item.price}
                                </TableCell>
                                <TableCell className="px-4 py-2 border-b border-gray-200">
                                    {item.sector}
                                </TableCell>
                                <TableCell className="px-4 py-2 border-b border-gray-200 gap-x-2 flex items-center justify-center">
                                    <Button onClick={() => preorderTicket(item as TicketItem)} size="sm">
                                        Предзаказать
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </table>
            </div>
        </div>
    );
}
