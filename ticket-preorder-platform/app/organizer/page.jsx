"use client"
import MatchesSection from "./organizerEvents";
import DataSection from "./organizerData";
import {useAuth} from "../../providers/authProvider";

import React from "react";
import DataCard from "../../components/DataCard";


export default function Page() {
    const {userRole, user, isLoading} = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Loading org...</p>
            </div>
        );
    }

    let fetchUrl = `http://localhost:8000/api/organizer/get/${user}`;
    let updateUrl = `http://localhost:8000/api/organizer/update/${user}`;
    const const_fields = ["tin"];
    const mutableFields = ["organization_name", "phone_number", "email"];


    // if (userRole !== "admin") {
    //     return (<div>You are not an organizer</div>)
    // }

    return (
        <div className="flex flex-col justify-center items-center p-10">
            <h1 className="text-3xl font-bold text-left mb-10 w-full px-20">
                Welcome Back!
            </h1>
            <div className="grid grid-cols-1 mt-10 lg:grid-cols-2 gap-4 w-full px-20 items-start">
                <DataCard const_fields={const_fields} fetchLink={fetchUrl}
                          updateLink={updateUrl} mutable_fields={mutableFields}>
                </DataCard>
                <MatchesSection/>
            </div>
        </div>
    )
}