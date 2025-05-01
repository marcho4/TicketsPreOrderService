import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useEffect} from "react";
import {toast} from "@/hooks/use-toast";
import {CircleCheck} from "lucide-react";


interface MessageResponse {
    message: string;
}

function ChangePasswordSection(): React.JSX.Element {
    const [firstPassword, setFirstPassword] = React.useState("");
    const [lastPassword, setLastPassword] = React.useState("");
    const passwordsAreEqual = firstPassword === lastPassword;
    const lengthCriteria = firstPassword.length > 7;
    const charCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(firstPassword);
    const numberCriteria = /[^A-Za-z]/.test(firstPassword);

    const updatePassword = async (newPassword: string) => {
        try {
            const response = await fetch("http://84.201.129.122:8000/api/auth/password/change", {
                method: "PUT",
                body: JSON.stringify({"password": newPassword}),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const body: MessageResponse = await response.json();
            if (!response.ok) {
                toast({
                    title: "Не удалось обновить пароль",
                    description: body.message,
                })
            } else {
                toast({
                    title: "Вы успешно сменили пароль!",
                    description: body.message,
                })
                setFirstPassword("");
                setLastPassword("");
            }

        } catch (e) {
            console.error(e);
            toast({
                content: "Не удалось обновить пароль",
                description: "Попробуйте еще раз позже",
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Поменять пароль</CardTitle>
                <CardDescription>Здесь вы можете поменять пароль на другой</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-5">
                <div>
                    <Label htmlFor="first-password-field">Введите новый пароль</Label>
                    <Input
                        type="password"
                        id="first-password-field"
                        placeholder="Введите пароль"
                        value={firstPassword}
                        onChange={(e) => setFirstPassword(e.target.value)}
                        className={(!passwordsAreEqual ? "border border-red-400" : "") + "placeholder:text-xs sm:placeholder:text-md"}
                    />
                    {!passwordsAreEqual && (
                        <Label htmlFor="first-password-field" className="text-red-400">Пароли не совпадают</Label>
                    )}
                </div>
                <div>
                    <Label htmlFor="second-password-field">Повторите пароль</Label>
                    <Input type="password" id="second-password-field" placeholder="Повторите пароль"
                           className={(!passwordsAreEqual ? "border border-red-400" : "") + "placeholder:text-xs sm:placeholder:text-md"}
                    value={lastPassword}
                    onChange={(e) => setLastPassword(e.target.value)}/>
                </div>
                <div id="criteria" className="flex flex-col gap-y-1">
                    <div className={"text-xs flex flex-row items-center " + (lengthCriteria ? "text-green-600" : "text-red-400")}>
                        <CircleCheck width={20} strokeWidth={1} className="mr-1"/>
                        8 символов+
                    </div>
                    <div className={"text-xs flex flex-row items-center " + (numberCriteria ? "text-green-600" : "text-red-400")}>
                        <CircleCheck width={20} strokeWidth={1} className="mr-1"/>
                        Есть 1 цифра
                    </div>
                    <div className={"text-xs flex flex-row items-center " + (charCriteria ? "text-green-600" : "text-red-400")}>
                        <CircleCheck width={20} strokeWidth={1} className="mr-1"/>
                        Есть 1 специальный символ
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex sm:flex-row justify-between flex-col gap-y-5 sm:gap-y-0">
                {(<Button variant="secondary" onClick={() => {
                    setFirstPassword("");
                    setLastPassword("");}
                }>
                    Сбросить
                </Button>)}
                <Button
                    disabled={!passwordsAreEqual || !lengthCriteria || !charCriteria || !numberCriteria}
                    onClick={() => {updatePassword(firstPassword)}}>
                    Обновить
                </Button>
            </CardFooter>
        </Card>
    )
}

export default ChangePasswordSection;