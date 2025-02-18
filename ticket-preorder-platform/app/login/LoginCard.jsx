"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import fetchData from "@/lib/fetchData";

export default function AuthCard() {
    // Состояние, которое отвечает за текущий «режим» компонента.
    // Варианты: "login", "signupUser", "signupOrganizer"
    const [mode, setMode] = useState("login");

    // Поля для логина
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    // Поля для регистрации (общие)
    const [name, setName] = useState("");
    const [last_name, setlast_name] = useState("");
    const [email, setEmail] = useState("");


    // Поля для организатора (например)
    const [company, setCompany] = useState("");
    const [tin, settin] = useState("");

    const [loading, setLoading] = useState(false);
    
    const router = useRouter();

    // Функция логина
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setError(false);
            let response = await fetchData("http://localhost:8000/api/auth/login", "POST",
                { login, password }, setLoading)
            console.log(response.status)
            if (response.status === 200) {
                let body = await response.json();
                switch (body.data.role) {
                    case "ADMIN":
                        router.push('/admin');
                        break;
                    case "USER":
                        router.push('/dashboard');
                        setTimeout(() => window.location.reload(), 500);
                        break;
                    case "ORGANIZER":
                        router.push('/organizer');
                        setTimeout(() => window.location.reload(), 500);
                        break;
                    default:
                        break;
                }
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
            console.log("here");
        }



    };

    // Функция регистрации обычного пользователя
    const handleSignupUser = async (e) => {
        e.preventDefault();
        try {
            setError(false);
            let response = await fetchData("http://localhost:8000/api/auth/register/user", "POST",
                { name, last_name, email, login, password}, setLoading);
                
            if (response.status === 200) {
                let body = await response.json();
                // Выводим для отладки
                console.log("Registration successful, response body:", body);
                
                // Проверка, содержит ли ответ данные пользователя с ролью
                if (body.data && body.data.role) {
                    await checkAuth();
                    console.log("Auth checked after registration, redirecting...");
                    router.push('/dashboard');
                } else {
                    console.log("Registration successful but no role data found");
                    // Возможно, требуется отдельный вход после регистрации
                    setMode("login");
                    setError(false);
                }
            } else {
                setError(true);
                console.log("Registration failed with status:", response.status);
            }
        } catch (error) {
            setError(true);
            console.log("Registration error:", error);
        }
    };

    // Функция регистрации организатора
    const handleSignupOrganizer = async (e) => {
        e.preventDefault();
        let response = await fetchData("http://localhost:8000/api/auth/register/organizer", "POST",
            { company, email, tin }, setLoading)

        if (response.status === 200) {
            router.push("/");
        } else {
            console.log("Wrong credentials");
        }
    };

    // В зависимости от режима возвращаем нужный JSX
    const renderFormContent = () => {
        switch (mode) {
            case "login":
                return (
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-6 pt-6 pb-8 ">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-text">
                                    Логин
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="Введите логин"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                    className={"rounded-xl bg-secondary text-text placeholder:text-text/50" + (error && "border-4 border-red-500")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-text">
                                    Пароль
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Введите пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={"rounded-xl bg-secondary text-text placeholder:text-text/50" + (error && "border-4 border-red-500")}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full rounded-xl hover:bg-accent bg-my_black hover:text-my_black transition-colors duration-300"
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
                                        <span>Обрабатываем...</span>
                                    </div>
                                ) : (
                                    "Войти"
                                )}
                            </Button>
                            <p className="text-sm text-center text-text">
                                Нет аккаунта?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("signupUser")}
                                >
                                    Зарегистрироваться
                                </button>
                            </p>
                            <Link href="#">
                                <button
                                    type="button"
                                    className="text-sm text-left hover:underline"
                                    onClick={() => setMode("signupOrganizer")}
                                >
                                    Зарегистрироваться как организатор
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
                                    Имя
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ваше имя"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-text">
                                    Фамилия
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ваша фамилия"
                                    value={last_name}
                                    onChange={(e) => setlast_name(e.target.value)}
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
                                    placeholder="Ваш email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-text">
                                    login
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    placeholder="Ваш login"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-text">
                                    password
                                </Label>
                                <Input
                                    id="name"
                                    type="password"
                                    placeholder="Ваш пароль"
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
                                className="w-full rounded-xl bg-gray-400 text-white hover:bg-accent hover:text-my_black
         transition-colors duration-300"
                            >
                                Зарегистрироваться
                            </Button>
                            <p className="text-sm text-center text-text">
                                Уже есть аккаунт?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("login")}
                                >
                                    Войти
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
                                <Label htmlFor="company" className="text-text">
                                    Название вашей организации
                                </Label>
                                <Input
                                    id="company"
                                    type="text"
                                    placeholder="Введите название"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
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
                                    placeholder="Введите email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tin" className="text-text">
                                    ИНН
                                </Label>
                                <Input
                                    id="tin"
                                    type="tin"
                                    placeholder="Введите ИНН вашей организации"
                                    value={tin}
                                    onChange={(e) => settin(e.target.value)}
                                    required
                                    className="rounded-xl bg-secondary text-text placeholder:text-text/50"
                                />
                            </div>

                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pb-8">
                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-my_black hover:bg-accent hover:text-my_black
                                 transition-colors duration-300"
                            >
                                Зарегистрироваться
                            </Button>
                            <p className="text-sm text-center text-text transition-colors">
                                Уже есть аккаунт?{" "}
                                <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setMode("login")}
                                >
                                    Войти
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
        <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl bg-opacity-90">
            <CardHeader className="space-y-1 pt-8">
                <CardTitle className="text-3xl font-bold text-center text-text">
                    {mode === "login"
                        ? "Войти"
                        : mode === "signupUser"
                            ? "Регистрация"
                            : "Регистрация (Организатор)"}
                </CardTitle>
            </CardHeader>
            {renderFormContent()}
        </Card>
    );
}