"use client"

import {useParams} from "next/navigation";
import {useState} from "react";
import Image from "next/image";
import {Button} from "../../../../components/ui/button";

export default function Page(props) {
    const {match_id} = useParams();

    const [isEditing, setEditing] = useState(false);
    const [matchData, setMatchData] = useState({
        team_home: "Barcelona",
        team_away: "Real Madrid",
        match_date: "28/07/2025",
        stadium: "Santiago Barnabeu",
        description: "El Classico",
        match_status: "Not started",
    });

    const [tickets, setTickets] = useState([
        {seat: "12", row: "45", sector: "R404", price: 2000, category: "cheap", status: "Paid"},
        {seat: "32", row: "22", sector: "R204", price: 3000, category: "middle-class", status: "Pre-ordered"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Pre-ordered"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Available"},
        {seat: "16", row: "4", sector: "R104", price: 5000, category: "expensive", status: "Available"},
        {seat: "16", row: "4", sector: "R104", price: 10000, category: "expensive", status: "Available"},
        {seat: "16", row: "4", sector: "R104", price: 4500, category: "expensive", status: "Paid"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Available"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Paid"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Available"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Paid"},
        {seat: "16", row: "4", sector: "R104", price: 2000, category: "expensive", status: "Paid"},

    ]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setMatchData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        let formData = new FormData()
        formData.append('file', file)

    }

    return (
        <div className="flex flex-col items-center justify-center mx-6 gap-y-5">
            {/* Title section */}
            <header className="flex flex-col w-full  mx-10 py-10  rounded-lg items-center">
                <div className="text-2xl font-semibold  text-my_black/80">
                    {matchData.match_date}
                </div>
                <div className="text-2xl font-semibold  text-my_black/80">
                    {matchData.stadium}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold  leading-tight text-center">
                    {matchData.team_home} - {matchData.team_away}
                </h1>
                <div className="text-2xl font-semibold mt-2 text-my_black/80">
                    {matchData.description}
                </div>
            </header>

            {/* Main section */}
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
                        <form className="max-w-md w-full  rounded-lg p-6  items-center justify-center flex flex-col">
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
                                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                                        file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50
                                        file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100 cursor-pointer
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
                                className="px-5 py-2 rounded-md bg-button-secondary hover:bg-accent text-lg lg:text-xl
                                     hover:text-my_black text-white font-medium transition-colors">
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
                                { label: "Match date", value: matchData.match_date, name: "match_date" },
                                { label: "Stadium", value: matchData.stadium, name: "stadium" },
                                { label: "Description", value: matchData.description, name: "description" },
                                { label: "Team Home", value: matchData.team_home, name: "team_home" },
                                { label: "Team Away", value: matchData.team_away, name: "team_away" },
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
                                    <Button className="bg-button-secondary hover:bg-accent text-lg lg:text-xl
                                     hover:text-my_black lg:py-7 lg:px-10 max-w-64 w-full"
                                            onClick={() => setEditing(!isEditing)}>
                                        Save changes
                                    </Button>
                                )}
                                <Button className="bg-button-secondary hover:bg-accent text-lg
                                lg:text-xl hover:text-my_black lg:py-7 lg:px-10 max-w-64 w-full"
                                onClick={() => setEditing(!isEditing)}>
                                    {isEditing ? "Cancel Edit" : "Edit"}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Tickets section */}
                <div className="flex flex-col lg:flex-row max-w-full w-full p-6 gap-10">
                    <div className="flex flex-col max-w-full w-full bg-gray-50 rounded-lg p-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
                            Tickets
                        </h1>
                        <div className="flex flex-col items-center w-full justify-center rounded-lg gap-y-10">
                            {/* Tickets */}
                            <div className="relative max-h-96 min-w-96 w-full overflow-y-auto border border-gray-300 rounded-lg bg-white">
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
                                            Category
                                        </th>
                                        <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                            Sector
                                        </th>
                                        <th className="w-1/6 px-4 py-2 border-b border-gray-300 font-semibold text-gray-700">
                                            Status
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tickets.map((item, index) => (
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
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {item.sector}
                                            </td>
                                            <td className="px-4 py-2 border-b border-gray-200">
                                                {item.status}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-row items-center w-full justify-end rounded-lg">
                                <Button
                                    className="px-5 py-2 rounded-md bg-button-secondary hover:bg-accent text-lg lg:text-xl
                                     hover:text-my_black text-white font-medium transition-colors">
                                    Add tickets
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}