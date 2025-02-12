"use client"

import {useParams} from "next/navigation";
import {Suspense, useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {Button} from "../../../../components/ui/button";
import {X} from "lucide-react";
import {createResource} from "../../../../lib/createResource";
import {formatDate} from "date-fns";

function RenderedMatchInfo({ resource }) {
    const data = resource.read();
    const [isEditing, setEditing] = useState(false);
    const [matchData, setMatchData] = useState(data);

    // Function to submit new stadium scheme
    const handleSubmit = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
    }

    // Editing function for match info
    const handleChange = (e) => {
        const {name, value} = e.target;
        setMatchData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    return (
        <div className={"flex flex-col items-center justify-center mx-6 gap-y-5"}>
            {/* Title section */}
            <header className="flex flex-col w-full  mx-10 py-10  rounded-lg items-center">
                <div className="text-2xl font-semibold  text-my_black/80">
                    {formatDate(data.matchDateTime, "yyyy-MM-dd hh:mm")}
                </div>
                <div className="text-2xl font-semibold  text-my_black/80">
                    {data.stadium}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold  leading-tight text-center">
                    {data.teamHome} - {data.teamAway}
                </h1>
                <div className="text-2xl font-semibold mt-2 text-my_black/80">
                    {data.matchDescription}
                </div>
            </header>
            <main className="flex flex-col min-w-full mx-10 rounded-lg items-center">
                {/* Match info + Scheme */}
                <div className="flex flex-col lg:flex-row max-w-full w-full p-6 gap-10">
                    {/* Scheme section */}
                    <div
                        className="w-full lg:w-3/5 mx-auto flex flex-col items-center bg-gray-50 shadow-lg rounded-lg p-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                            Stadium scheme
                        </h1>
                        <Image
                            src={`/stadion_shema.jpg`}
                            alt={"Stadium schema"}
                            className="mb-5 sm:mb-10 rounded-[2em]"
                            width={700}
                            height={100}
                        />
                        <form onSubmit={handleSubmit} className="max-w-md w-full  rounded-lg p-6  items-center justify-center flex flex-col">
                            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                                Change scheme
                            </h2>

                            {/* Блок с загрузкой файла */}
                            <div className="mb-4 items-center justify-center flex flex-col">
                                <label
                                    htmlFor="uploadFile"
                                    className="block text-sm text-center font-medium text-gray-700 mb-2"
                                >
                                    Upload Scheme
                                </label>
                                <input
                                    id="uploadFile"
                                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-1 file:px-2
                                        file:rounded file:border-0 file:text-sm file:font-semibold file:bg-button-darker
                                        file:text-white file:cursor-pointer hover:file:bg-button-darker/90 cursor-pointer
                                         focus:outline-none"
                                    type="file"
                                    name="uploadFile"
                                    accept="image/webp, image/jpeg, image/png"
                                    required
                                    multiple={false}
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-5 py-2 rounded-md bg-green_accent text-lg lg:text-xl
                                     hover:text-my_black  font-medium transition-colors">
                                Submit
                            </button>
                        </form>
                    </div>

                    {/* Match info */}
                    <div
                        className="w-full lg:w-2/5 mx-auto flex flex-col items-center bg-gray-50 shadow-lg rounded-lg p-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                            Match Info
                        </h1>
                        <div className="flex flex-col w-full space-y-4">
                            {[
                                { label: "Match date", value: formatDate(matchData.matchDateTime, "yyyy-MM-dd hh:mm"), name: "matchDateTime" },
                                { label: "Stadium", value: matchData.stadium, name: "stadium" },
                                { label: "Description", value: matchData.matchDescription, name: "matchDescription" },
                                { label: "Team Home", value: matchData.teamHome, name: "teamHome" },
                                { label: "Team Away", value: matchData.teamAway, name: "teamAway" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-row w-full items-center border-b last:border-b-0 border-gray-200 py-4"
                                >
                                    <div className="w-1/3 md:w-1/3 text-lg md:text-xl font-semibold text-gray-700
                                    overflow-hidden text-ellipsis whitespace-nowrap">
                                        {item.label}
                                    </div>
                                    <input
                                        className="w-2/3 md:w-2/3 py-2 px-3 disabled:bg-gray-50 rounded-lg text-base
                                         md:text-lg text-gray-700"
                                        disabled={!isEditing}
                                        value={matchData[item.name]}
                                        name={item.name}
                                        onChange={handleChange}>
                                    </input>
                                </div>
                            ))}
                            <div className="items-center w-full flex flex-row justify-center gap-x-5">
                                {isEditing && (
                                    <Button className="bg-green_accent hover:bg-green_accent hover:text-my_black text-lg lg:text-xl
                                     text-my_black lg:py-7 lg:px-10 max-w-64 w-full"
                                            onClick={() => setEditing(!isEditing)}>
                                        Save changes
                                    </Button>
                                )}
                                {!isEditing ? (<Button className="bg-button-darker hover:bg-accent text-lg lg:text-xl
                                hover:text-my_black lg:py-7 lg:px-10 max-w-64 w-full"
                                                       onClick={() => setEditing(!isEditing)}>
                                    Edit
                                </Button>) : (<Button className="bg-button-darker hover:bg-accent text-lg lg:text-xl
                                hover:text-my_black lg:py-7 lg:px-10 max-w-64 w-full"
                                                      onClick={() => {setEditing(!isEditing)}}>
                                    Cancel
                                </Button>)}

                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default function Page() {
    const {match_id} = useParams();
    async function fetchMatchData() {
        try {
            const response = await fetch(`http://localhost:8000/api/matches/${match_id}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                console.error(`Failed to fetch match data: ${response.text()}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("Error fetching match data:", error);
            throw error;
        }
    }
    const resource = useMemo(()=> {return createResource(fetchMatchData)}, [match_id]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RenderedMatchInfo resource={resource} />
        </Suspense>
    )
}

function TicketsRendered({ resource }) {
    const data = resource.read();
    const [modal, setModal] = useState(false);
    const [ticketsFile, setTicketsFile] = useState(null);


    // Function to change tickets file
    const handleFileChange = (e) => {
        setTicketsFile(e.target.files[0]);
    }

    // Function to submit tickets file to an API
    const handleSubmitTickets = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('file', ticketsFile);

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
        <div>
            <div className="flex flex-col lg:flex-row max-w-full w-full  p-6 gap-10">
                <div className="flex flex-col max-w-full w-full bg-gray-50 shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
                        Tickets
                    </h1>
                    <div className="flex flex-col items-center w-full justify-center rounded-lg gap-y-10">
                        {/* Tickets */}
                        <div className="relative max-h-96 min-w-[500px] overflow-x-auto w-full overflow-y-auto border border-gray-300 rounded-lg bg-white">
                            <table className="table-fixed w-full">
                                <thead className="sticky top-0 bg-gray-100 z-10">
                                <tr className="text-left">
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Row
                                    </th>
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Seat
                                    </th>
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Price
                                    </th>
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Sector
                                    </th>
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {item.row}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {item.seat}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {item.price}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {item.sector}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            {item.status}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 gap-x-2">
                                            <Button
                                                disabled={item.status !== "Available"}
                                                className={"bg-button-darker hover:bg-accent hover:text-my_black" +
                                                    " transition-colors duration-300 p-2 text-white  rounded-lg"}>
                                                Delete
                                            </Button>
                                        </td>

                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-row items-center w-full justify-end rounded-lg">
                            <Button
                                onClick={() => setModal(true)}
                                className="px-5 py-2 rounded-md bg-button-darker hover:bg-accent text-lg lg:text-xl
                                 hover:text-my_black text-white font-medium transition-colors">
                                Add tickets
                            </Button>
                        </div>


                    </div>
                </div>
            </div>

            {/* Modal window to upload tickets */}
            <div id="background" onClick={() => setModal(!modal)} className={`${modal ? 'fixed inset-0 flex items-center justify-center bg-black/80' : 'hidden'}
                    z-[11] cursor-pointer`}>
                <div id="active-modal" className="relative max-w-[350px] w-full h-[450px] rounded-lg bg-gray-50 cursor-default"
                    onClick={(e) => e.stopPropagation()}>

                    <X className="absolute top-3 right-3 h-6 w-6 text-gray-700 cursor-pointer"
                        onClick={() => setModal(!modal)}/>

                    <div id="modal-content" className="p-6">
                        <div className="text-2xl font-semibold text-gray-700 mb-3">
                            Add Tickets
                        </div>
                        <div>
                            Please upload file in .csv format<br/>
                            Example:
                            <br/>sector; row; seat; price;
                            <br/>110; 5; 10; 45000;
                            <br/>127; 10; 23; 2999;
                            <form className="max-w-md w-full  rounded-lg p-6  items-center justify-center flex flex-col">
                                {/* Блок с загрузкой файла */}
                                <div className="mb-4 items-center justify-center flex flex-col">
                                    <label htmlFor="uploadTicketsFile"
                                        className="block text-sm text-center font-medium text-gray-700 mb-2"
                                    >
                                        Upload Tickets .csv file
                                    </label>
                                    <input
                                        id="uploadTicketsFile"
                                        className="block w-full text-sm text-gray-900 file:mr-4 file:py-1 file:px-2
                                    file:rounded file:border-0 file:text-sm file:font-semibold file:bg-button-darker
                                    file:text-white file:cursor-pointer hover:file:bg-button-darker/90 cursor-pointer
                                     focus:outline-none"
                                        type="file"
                                        name="uploadTicketsFile"
                                        accept="text/csv"
                                        required
                                        multiple={false}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="px-3 py-1 mt-3 rounded-md bg-green_accent   font-medium transition-colors">
                                    Submit Tickets
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
