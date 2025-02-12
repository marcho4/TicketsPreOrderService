import {logout} from "../lib/logout";
import {LogOut} from "lucide-react";
import {Button} from "./ui/button";
import React from "react";

export default function LogoutButton({router}) {
    return (
        <Button onClick={() => logout(router)} className="bg-button-darker max-w-56 py-2 hover:bg-dark-grey">
            <LogOut className="mr-2" /> Logout
        </Button>
    )
}