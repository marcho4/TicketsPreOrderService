"use client"
import MatchesSection from "./organizerEvents";
import DataSection from "./organizerData";
import {useAuth} from "../../providers/authProvider";


export default function Page() {
    const {userRole, user} = useAuth();
    let name = "Mark";



    // if (userRole !== "admin") {
    //     return (<div>You are not an organizer</div>)
    // }
    return (
        <div className="flex flex-col justify-center items-center p-10">
            <h1 className="text-3xl font-bold text-left mb-10">
                Welcome Back, {name}!
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full ">
                <MatchesSection/>
                <DataSection/>
            </div>


        </div>
    )
}