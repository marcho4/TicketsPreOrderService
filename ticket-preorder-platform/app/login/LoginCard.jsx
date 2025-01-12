"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthCard() {
    // Состояние, которое отвечает за текущий «режим» компонента.
    // Варианты: "login", "signupUser", "signupOrganizer"
    const [mode, setMode] = useState("login");

    // Поля для логина
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Поля для регистрации (общие)
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");

    // Поля для организатора (например)
    const [organizationName, setOrganizationName] = useState("");
    const [TIN, setTIN] = useState("");

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Функция логина
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            let response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                // Допустим, логин успешен
                router.push("/dashboard");
            }
        } catch (error) {
            console.log("Login Error: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Функция регистрации обычного пользователя
    const handleSignupUser = async (e) => {
        e.preventDefault();
        // TODO: ваша логика отправки на бэкенд
        console.log("User sign up:", { name, lastName, email });
    };

    // Функция регистрации организатора
    const handleSignupOrganizer = async (e) => {
        e.preventDefault();
        // TODO: ваша логика отправки на бэкенд
        console.log("Organizer sign up:", {
            organizationName,
            email,
            TIN,
        });
    };

    // В зависимости от режима возвращаем нужный JSX
    const renderFormContent = () => {
        switch (mode) {
            case "login":
                return (
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-6 pt-6 pb-8">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-text">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-text">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full rounded-xl hover:bg-[#4CAF50]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        {/* Спиннер (SVG) */}
                                        <svg
                                            className="animate-spin h-5 w-5 text-dark-primary dark:text-off-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4
                          a8 8 0 010 16v-4l-3 3 3 3v-4
                          a8 8 0 01-8-8z"
                                            />
                                        </svg>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                            <p className="text-sm text-center text-text">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("signupUser")}
                                >
                                    Sign up
                                </button>
                            </p>
                            <Link href="#">
                                <button
                                    type="button"
                                    className="text-sm text-left hover:underline"
                                    onClick={() => setMode("signupOrganizer")}
                                >
                                    Sign up as an organizer
                                </button>
                            </Link>
                        </CardFooter>
                    </form>
                );
            case "signupUser":
                return (
                    <form onSubmit={handleSignupUser}>
                        <CardContent className="space-y-6 pt-6 pb-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-text">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-text">
                                    Last name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your last name"
                                    value={lastName}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-text">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full rounded-xl hover:bg-[#4CAF50]"
                            >
                                Sign Up
                            </Button>
                            <p className="text-sm text-center text-text">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("login")}
                                >
                                    Login
                                </button>
                            </p>
                        </CardFooter>
                    </form>
                );
            case "signupOrganizer":
                return (
                    <form onSubmit={handleSignupOrganizer}>
                        <CardContent className="space-y-6 pt-6 pb-8">
                            <div className="space-y-2">
                                <Label htmlFor="organizationName" className="text-text">
                                    Name of Organization
                                </Label>
                                <Input
                                    id="organizationName"
                                    type="text"
                                    placeholder="Name of Organization"
                                    value={organizationName}
                                    onChange={(e) => organizationName(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-text">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tin" className="text-text">
                                    TIN
                                </Label>
                                <Input
                                    id="tin"
                                    type="tin"
                                    placeholder="Your organization's TIN"
                                    value={TIN}
                                    onChange={(e) => setTIN(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full rounded-xl hover:bg-[#4CAF50]"
                            >
                                Sign Up as Organizer
                            </Button>
                            <p className="text-sm text-center text-text">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("login")}
                                >
                                    Login
                                </button>
                            </p>
                        </CardFooter>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-md bg-background bg-opacity-90 rounded-3xl shadow-2xl">
            <CardHeader className="space-y-1 pt-8">
                <CardTitle className="text-3xl font-bold text-center text-text">
                    {mode === "login"
                        ? "Login"
                        : mode === "signupUser"
                            ? "Sign Up"
                            : "Sign Up (Organizer)"}
                </CardTitle>
            </CardHeader>
            {renderFormContent()}
        </Card>
    );
}