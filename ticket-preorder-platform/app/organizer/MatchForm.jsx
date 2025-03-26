import React, {useState} from "react";
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MatchFormDataRow} from "@/app/organizer/MatchFormDataRow";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export default function MatchForm({ onSubmit, onClose, matchLogoSetter, matchLogo }) {
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
        <div className="z-10">
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

                    <Input
                        onChange={(e) => matchLogoSetter(e.target.files[0])}
                        type="file"
                        required={true}
                    />

                    <div className="flex justify-end space-x-4 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button type="submit">
                            Создать
                        </Button>
                    </div>
                </form>
            </CardContent>
        </div>
    );
}
