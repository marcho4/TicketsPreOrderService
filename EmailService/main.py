import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from starlette.responses import JSONResponse

from EmailSender import EmailSender
from sendModel import SendModel


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Контекстный менеджер жизненного цикла приложения.
    Создаёт EmailSender при старте и уничтожает при завершении.
    """
    email_login = os.getenv("EMAIL_LOGIN")
    email_password = os.getenv("EMAIL_PASSWORD")

    # Можно добавить проверку, что если не указаны env-переменные,
    # то выбрасывать исключение или логгировать ошибку
    if not email_login or not email_password:
        logging.error("EMAIL_LOGIN or EMAIL_PASSWORD environment variables are not set.")
        # При желании можно здесь вызвать sys.exit(1) или пробросить исключение
        # Но для демонстрации просто выведем в лог и продолжим

    app.state.email_sender = EmailSender(
        mail=email_login,
        password=email_password
    )

    try:
        yield
    finally:
        if hasattr(app.state, "email_sender"):
            del app.state.email_sender


app = FastAPI(lifespan=lifespan)


@app.post("/email/send")
async def send_email(data: SendModel):
    """
    Эндпойнт для отправки письма.
    Принимает Pydantic-модель SendModel, возвращает JSON-ответ.
    """
    try:
        app.state.email_sender.send_email(
            receiver=data.receiver,
            subject=data.subject,
            title=data.title,
            code_type=data.code_type,
            body=data.body
        )
        return JSONResponse(status_code=200, content={"status": "success"})
    except Exception as e:
        logging.exception(f"Error occurred while sending email to {data.receiver}")
        # Оборачиваем исключение в HTTPException, чтобы отдать пользователю понятную ошибку
        raise HTTPException(status_code=500, detail=str(e))