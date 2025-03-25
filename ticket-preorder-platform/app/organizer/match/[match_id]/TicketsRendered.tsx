"use client"

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/Modal";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import TicketsDropZone from "./FileUpload";
import { columns, Ticket } from "./columns"
import { DataTable } from "./data-table"



export function TicketsRendered({ resource, match_id }) {
    const data = resource.read() as Ticket[];
    const [modal, setModal] = useState(false);
    const [ticketsFile, setTicketsFile] = useState(null);

    // Function to change tickets file
    const handleFileChange = (e) => {
        setTicketsFile(e.target.files[0]);
    }

    // Function to submit tickets file to an API
    const handleSubmitTickets = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('tickets', ticketsFile);

        try {
            let response = await fetch(`http://localhost:8000/api/tickets/${match_id}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            console.log(data.data);
            console.log(data.msg);
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
                            <DataTable columns={columns} data={data} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-row items-center w-full justify-end rounded-lg">
                        <Button
                            onClick={() => setModal(true)}
                            size="lg">
                            Загрузить новые билеты
                        </Button>
                    </CardFooter>
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
                        <p>Please upload file in <strong>.csv</strong> format</p>
                        <p className="mt-2">Example:</p>
                        <pre className="bg-gray-100 p-4 text-sm font-mono rounded mt-2">
                            price, sector, row, seat<br/>
                            110, D, 10, 5<br/>
                            400, A, 1, 10
                        </pre>
                    </div>
                    <form className="max-w-md w-full rounded-lg p-6 items-center justify-center flex flex-col gap-y-8">
                        <TicketsDropZone/>
                        <Button
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
