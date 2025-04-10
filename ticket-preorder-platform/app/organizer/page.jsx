"use client"
import MatchesSection from "./MatchesSection";
import {useAuth} from "../../providers/authProvider";

import React from "react";
import ChangePasswordSection from "../../components/ChangePasswordSection";
import OrgDataCard from "./organizerData";
import {Card, CardHeader, CardTitle} from "../../components/ui/card";


export default function Page() {
    const {user} = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Loading org...</p>
            </div>
        );
    }

    let fetchUrl = `http://localhost:8000/api/organizer/get/${user}`;
    let updateUrl = `http://localhost:8000/api/organizer/update/${user}`;

    return (
        <div className="flex flex-col min-h-screen pt-10 p-2">
            <Card className="max-w-7xl mx-auto w-full text-2xl sm:text-3xl">
                <CardHeader>
                    <CardTitle>
                        Личный кабинет
                    </CardTitle>
                </CardHeader>
            </Card>
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                            <OrgDataCard fetchLink={fetchUrl} updateLink={updateUrl}/>
                        </div>

                        <div className="md:w-1/2 flex flex-col gap-6">
                            <MatchesSection/>
                            <ChangePasswordSection/>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    )
}