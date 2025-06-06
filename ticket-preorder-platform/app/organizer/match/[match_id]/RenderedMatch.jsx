import {useState} from "react";
import {useParams} from "next/navigation";
import {formatDate} from "date-fns";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../components/ui/card";
import Image from "next/image";
import {Input} from "../../../../components/ui/input";
import {Button} from "../../../../components/ui/button";
import {toast} from "../../../../hooks/use-toast";
import React from "react";
import {Pencil, X, Save, LoaderCircle} from "lucide-react";


export function RenderedMatchInfo({ resource }) {
    const data = resource.read();
    const [isEditing, setEditing] = useState(false);
    const [matchData, setMatchData] = useState(data);
    const {match_id} = useParams();
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [scheme, setScheme] = useState();
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        const file = scheme;
        let formData = new FormData();
        formData.append('image', file);
        formData.set('type', 'stadium-schemes');
        formData.set('match_id', match_id);

        const uploadForm = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/upload`, {
                    method: 'PUT',
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
            } finally {
                setIsLoading(false);
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

            const response = await fetch(`http://84.201.129.122:8000/api/matches/${match_id}`, {
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
                            <CardTitle className="text-2xl md:text-3xl">
                                Схема стадиона
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">   
                            <Image
                                src={data.scheme}
                                alt={"Stadium schema"}
                                className="mb-5 sm:mb-10 rounded-[2em]"
                                width={500}
                                height={100}
                            />
                            <form onSubmit={handleSubmit} className="w-full rounded-lg p-6  items-center justify-center flex flex-col">
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-4">
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
                                    disabled={isLoading}
                                    className="px-5 py-2 rounded-md text-lg lg:text-xl font-medium transition-colors">
                                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Сохранить"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Match info */}
                    <Card
                        className="w-full lg:w-2/5 mx-auto flex flex-col items-center shadow-lg rounded-lg p-8">
                        <CardHeader className="w-full">
                            <CardTitle className="text-2xl w-full text-left md:text-3xl font-semibold text-gray-800 mb-6">
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

                        <div className="flex flex-col w-full space-y-6">
                            <div className="grid gap-5 md:grid-cols-1">
                                {[
                                    { 
                                        label: "Дата матча", 
                                        value: matchData.matchDateTime, 
                                        name: "matchDateTime", 
                                        type: "datetime-local",
                                        icon: "Calendar"
                                    },
                                    { 
                                        label: "Стадион", 
                                        value: matchData.stadium, 
                                        name: "stadium", 
                                        type: "text",
                                        icon: "LandPlot"
                                    },
                                    { 
                                        label: "Описание", 
                                        value: matchData.matchDescription, 
                                        name: "matchDescription", 
                                        type: "text",
                                        icon: "FileText"
                                    },
                                    { 
                                        label: "Домашняя команда", 
                                        value: matchData.teamHome, 
                                        name: "teamHome", 
                                        type: "text", 
                                        disabled: true,
                                        icon: "Home"
                                    },
                                    { 
                                        label: "Гостевая команда", 
                                        value: matchData.teamAway, 
                                        name: "teamAway", 
                                        type: "text", 
                                        disabled: true,
                                        icon: "Plane"
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className={`group relative rounded-lg p-1.5 transition-all ${
                                            isEditing ? 'bg-card/50 hover:bg-card/80' : 'hover:bg-muted/50'
                                        } ${index < 4 ? 'border-b' : ''} border-muted`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label 
                                                    htmlFor={item.name}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                                >
                                                    {item.label}
                                                </label>
                                                
                                                {item.type === "datetime-local" ? (
                                                    <Input
                                                        id={item.name}
                                                        className={`mt-2 w-full border-0 bg-transparent p-0 text-base ${
                                                            isEditing ? 'border border-input bg-background shadow-sm py-2 px-3 rounded-md' : ''
                                                        } font-medium text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                                        disabled={!isEditing || item.disabled}
                                                        type="datetime-local"
                                                        value={isEditing ? new Date(matchData[item.name]).toISOString().slice(0, 16) : formatDate(matchData[item.name], "yyyy-MM-dd HH:mm")}
                                                        name={item.name}
                                                        onChange={handleChange}
                                                    />
                                                ) : (
                                                    <Input
                                                        id={item.name}
                                                        className={`mt-2 w-full border-0 bg-transparent p-0 text-base ${
                                                            isEditing ? 'border border-input bg-background shadow-sm py-2 px-3 rounded-md' : ''
                                                        } font-medium text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                                        disabled={!isEditing || item.disabled}
                                                        type={item.type}
                                                        value={matchData[item.name]}
                                                        name={item.name}
                                                        onChange={handleChange}
                                                    />
                                                )}
                                            </div>
                                            
                                            {item.disabled && (
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                                    Неизменяемо
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                                {!isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                        onClick={() => setEditing(!isEditing)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Редактировать
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                            onClick={cancelEditing}
                                        >
                                            <X className="h-4 w-4" />
                                            Отменить
                                        </Button>
                                        
                                        <Button 
                                            variant="default"
                                            size="lg"
                                            className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                            onClick={saveChanges}
                                        >
                                            <Save className="h-4 w-4" />
                                            Сохранить
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

