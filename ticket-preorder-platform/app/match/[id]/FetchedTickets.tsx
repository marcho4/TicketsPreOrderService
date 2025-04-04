import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import { Label } from "@/components/ui/label";

interface TicketItem {
    id: string,
    match_id: string,
}

export default function FetchedTickets({resource, setRefreshResourceKey, matchId} : any) {
    const tickets = resource.read();
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    
    const getInQueue = async (minPrice: number, maxPrice: number) => {
        try {
            const response = await fetch('http://localhost:8000/api/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    match_id: matchId,
                    min_price: minPrice,
                    max_price: maxPrice
                }),
            });
            
            if (response.ok) {
                toast({
                    title: "Успех",
                    description: "Вы успешно встали в очередь за билетами"
                });
            } else {
                toast({
                    title: "Ошибка",
                    description: "Не удалось встать в очередь",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Ошибка при постановке в очередь:', error);
            toast({
                title: "Ошибка",
                description: "Не удалось встать в очередь. Попробуйте позже.",
                variant: "destructive"
            });
        }
    };
    
    if (tickets.length === 0) {
        return (
            null
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
                        {tickets.map((item: any, index: number) => (
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
