import {useState} from "react";
import {useParams} from "next/navigation";
import {formatDate} from "date-fns";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../components/ui/card";
import Image from "next/image";
import {Input} from "../../../../components/ui/input";
import {Button} from "../../../../components/ui/button";
import {toast} from "../../../../hooks/use-toast";


export function RenderedMatchInfo({ resource }) {
    const data = resource.read();
    const [isEditing, setEditing] = useState(false);
    const [matchData, setMatchData] = useState(data);
    const {match_id} = useParams();
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [scheme, setScheme] = useState();


    const handleSubmit = (e) => {
        e.preventDefault();
        const file = scheme;
        let formData = new FormData();
        formData.append('image', file);
        formData.set('type', 'stadium-schemes');
        formData.set('match_id', match_id);

        const uploadForm = async () => {
            try {
                const response = await fetch(`/api/upload`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData,
                })
                const body = await response.json();
                if (response.status === 200) {
                    toast({
                        title: 'Вы успешно загрузили схему',
                        description: body.msg
                    })
                } else {
                    toast({
                        title: 'Произошла ошибка при загрузке схемы',
                        description: body.msg
                    })
                }

            } catch (error) {
                console.log(error);
            }
        }
        uploadForm();
    }

    const handleSchemeChange = (e) => {
        setScheme(e.target.files[0]);
    }

    // Editing function for match info
    const handleChange = (e) => {
        const {name, value} = e.target;
        setMatchData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    // Function to save match data changes
    const saveChanges = async () => {
        try {
            // Create payload with only the fields that can be updated
            const payload = {
                matchDateTime: new Date(matchData.matchDateTime).toISOString(),
                matchDescription: matchData.matchDescription,
                stadium: matchData.stadium
            };

            const response = await fetch(`http://localhost:8000/api/matches/${match_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update match data: ${errorText}`);
            }

            setUpdateSuccess(true);
            setUpdateError(null);
            setEditing(false);

            // Show success message for 3 seconds
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error updating match data:", error);
            setUpdateError(error.message);
            setUpdateSuccess(false);
        }
    }

    // Function to cancel editing and reset data
    const cancelEditing = () => {
        setMatchData(data);
        setEditing(false);
        setUpdateError(null);
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
                    <Card className="w-full lg:w-3/5 mx-auto flex flex-col shadow-lg rounded-lg p-8">
                        <CardHeader>
                            <CardTitle className="text-3xl">
                                Схема стадиона
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Image
                                src={data.scheme}
                                alt={"Stadium schema"}
                                className="mb-5 sm:mb-10 rounded-[2em]"
                                width={700}
                                height={100}
                            />
                            <form onSubmit={handleSubmit} className="w-full rounded-lg p-6  items-center justify-center flex flex-col">
                                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                                    Поменять схему
                                </h2>

                                {/* Блок с загрузкой файла */}
                                <div className="mb-4 items-center justify-center w-full flex flex-col sm:flex-row">
                                    <Input
                                        id="uploadFile"
                                        className="max-w-80"
                                        type="file"
                                        name="uploadFile"
                                        onChange={handleSchemeChange}
                                        accept="image/webp, image/jpeg, image/png"
                                        required
                                        multiple={false}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="px-5 py-2 rounded-md text-lg lg:text-xl font-medium transition-colors">
                                    Сохранить
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Match info */}
                    <Card
                        className="w-full lg:w-2/5 mx-auto flex flex-col items-center shadow-lg rounded-lg p-8">
                        <CardHeader>
                            <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                                Информация о матче
                            </CardTitle>
                        </CardHeader>

                        {/* Success/Error messages */}
                        {updateSuccess && (
                            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                                <span className="block sm:inline">Успешно обновились данные</span>
                            </div>
                        )}

                        {updateError && (
                            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                <span className="block sm:inline">{updateError}</span>
                            </div>
                        )}

                        <div className="flex flex-col w-full space-y-4">
                            {[
                                { label: "Дата матча", value: matchData.matchDateTime, name: "matchDateTime", type: "datetime-local" },
                                { label: "Стадион", value: matchData.stadium, name: "stadium", type: "text" },
                                { label: "Описание", value: matchData.matchDescription, name: "matchDescription", type: "text" },
                                { label: "Домашняя команда", value: matchData.teamHome, name: "teamHome", type: "text", disabled: true },
                                { label: "Гостевая команда", value: matchData.teamAway, name: "teamAway", type: "text", disabled: true },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-row w-full items-center border-b last:border-b-0 border-gray-200 py-4"
                                >
                                    <div className="w-1/3 md:w-1/3 text-lg md:text-xl font-semibold text-gray-700
                                        overflow-hidden text-ellipsis whitespace-nowrap">
                                        {item.label}
                                    </div>
                                    {item.type === "datetime-local" ? (
                                        <input
                                            className="w-2/3 md:w-2/3 py-2 px-3 disabled:bg-gray-50 rounded-lg text-base
                                            md:text-lg text-gray-700"
                                            disabled={!isEditing || item.disabled}
                                            type="datetime-local"
                                            value={isEditing ? new Date(matchData[item.name]).toISOString().slice(0, 16) : formatDate(matchData[item.name], "yyyy-MM-dd HH:mm")}
                                            name={item.name}
                                            onChange={handleChange}>
                                        </input>
                                    ) : (
                                        <input
                                            className="w-2/3 md:w-2/3 py-2 px-3 disabled:bg-gray-50 rounded-lg text-base
                                            md:text-lg text-gray-700"
                                            disabled={!isEditing || item.disabled}
                                            type={item.type}
                                            value={matchData[item.name]}
                                            name={item.name}
                                            onChange={handleChange}>
                                        </input>
                                    )}
                                </div>
                            ))}
                            <div className="items-center w-full flex flex-row justify-center gap-x-5">

                                {!isEditing ? (
                                    <Button
                                        variant={'outline'}
                                        className="text-lg lg:text-xl lg:py-7 lg:px-10 max-w-64 w-full"
                                        onClick={() => setEditing(!isEditing)}>
                                        Редактировать
                                    </Button>
                                ) : (
                                    <Button
                                        variant='secondary'
                                        className="text-lg lg:text-xl lg:py-7 lg:px-10 max-w-64 w-full"
                                        onClick={cancelEditing}>
                                        Отменить
                                    </Button>
                                )}
                                {isEditing && (
                                    <Button className="text-lg lg:text-xl
                                      lg:py-7 lg:px-10 max-w-64 w-full"
                                            onClick={saveChanges}>
                                        Сохранить
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

