import React, {useState} from "react";
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MatchFormDataRow} from "@/app/organizer/MatchFormDataRow";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

export default function MatchForm({ onSubmit, onClose, matchLogoSetter, isLoading }) {
    const [formData, setFormData] = useState({
        matchDescription: '',
        teamHome: '',
        teamAway: '',
        stadium: '',
        matchDateTime: new Date()
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        formData.matchDateTime = new Date(formData.matchDateTime).toISOString();
        onSubmit(formData);
        onClose();
    };

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }


    return (
        <div className="z-100">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Создать новый матч</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <MatchFormDataRow label={"Домашняя команда"} apiName={"teamHome"} onChange={handleChange} formData={formData} />
                    <MatchFormDataRow label={"Гостевая команда"} apiName={"teamAway"} onChange={handleChange} formData={formData}/>
                    <MatchFormDataRow label={"Описание"} apiName={"matchDescription"} onChange={handleChange}  formData={formData} required={false}/>
                    <MatchFormDataRow label={"Стадион"} apiName={"stadium"} onChange={handleChange}  formData={formData}/>
                    <MatchFormDataRow label={"Дата проведения"} apiName={"matchDateTime"} onChange={handleChange} formData={formData} type={"datetime-local"}/>

                    <div className="flex flex-col">
                        <Label className="block text-sm font-medium text-gray-700 mb-1">Баннер матча</Label>
                        <Input
                            onChange={(e) => matchLogoSetter(e.target.files[0])}
                            type="file"
                            required={true}
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Создать"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </div>
    );
}
