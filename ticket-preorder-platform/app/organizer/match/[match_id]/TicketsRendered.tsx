"use client"

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/Modal";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import TicketsDropZone from "./FileUpload";
import { columns, Ticket } from "./columns"
import { DataTable } from "./data-table"
import {toast} from "@/hooks/use-toast";


export function TicketsRendered({ resource, match_id, refreshFunc }: { resource: { read: () => Ticket[] }, match_id: string, refreshFunc: any }) {
    const data = resource.read() as Ticket[];
    const [modal, setModal] = useState(false);
    const [ticketsFile, setTicketsFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setTicketsFile(e.target.files[0]);
        }
    };

    const resetTicketsFile = () => {
        setTicketsFile(null);
    };

    const handleSubmitTickets = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketsFile) return;
        
        let formData = new FormData();
        formData.append('tickets', ticketsFile);

        try {
            let response = await fetch(`http://84.201.129.122:8000/api/tickets/${match_id}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (response.status == 200) {
                toast({
                    title: "Успешно добавлены билеты",
                    description: "Неправильных рядов: " + data.data.invalid_rows,
                })
                setModal(false);
                refreshFunc((prev: number) => prev + 1);
            } else {
                toast({
                    title: "Не удалось добавить билеты"
                })
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (modal) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [modal]);

    return (
        <div className='flex flex-col items-center justify-center mx-6'>
            <div className="flex flex-col lg:flex-row max-w-full w-full p-6 gap-10">
                <Card className="flex flex-col max-w-full w-full shadow-lg rounded-lg">
                    <CardHeader className="text-3xl md:text-4xl font-bold text-center mb-6">
                        <CardTitle>
                            Билеты на матч
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center w-full justify-center rounded-lg gap-y-10">
                        <div className="container mx-auto">
                            <DataTable columns={columns} data={data} match_id={match_id} refreshFunc={refreshFunc} />
                            <div className="flex justify-end w-full">
                                <Button
                                    onClick={() => setModal(true)}
                                    size="lg">
                                    Загрузить новые билеты
                                </Button>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal onClose={() => setModal(false)} isOpen={modal}>
                <CardHeader>
                    <CardTitle className="text-3xl w-full text-center">
                        Добавить билеты
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-600 mb-4">
                        <p>Загрузите файл в <strong>.csv</strong> формате</p>
                        <p className="mt-2">Пример:</p>
                        <pre className="bg-gray-100 p-4 text-sm font-mono rounded mt-2">
                            price, sector, row, seat<br/>
                            110, D, 10, 5<br/>
                            400, A, 1, 10
                        </pre>
                    </div>
                    <form className="max-w-md w-full rounded-lg p-6 items-center justify-center flex flex-col">
                        <TicketsDropZone file={ticketsFile}
                                         setFile={setTicketsFile}
                                         handleFileChange={handleFileChange}
                                         resetTicketsFile={resetTicketsFile} />
                        <Button
                            disabled={!ticketsFile}
                            variant="outline"
                            type="submit"
                            className="min-w-64"
                            onClick={handleSubmitTickets}>
                            Загрузить
                        </Button>
                    </form>

                </CardContent>
            </Modal>
        </div>
    )
}
