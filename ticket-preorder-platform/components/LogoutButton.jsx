import {logout} from "../lib/logout";
import {LogOut} from "lucide-react";
import {Button} from "./ui/button";
import React from "react";

export default function LogoutButton({router}) {
    return (
        <Button onClick={() => logout(router)} className="max-w-56">
            <LogOut className="mr-2" /> Выйти
        </Button>
    )
}