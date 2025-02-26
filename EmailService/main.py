import logging
import os
from contextlib import asynccontextmanager
from typing import Dict
from fastapi import FastAPI, HTTPException, Depends
from dotenv import load_dotenv
from fastapi import Request

from email_sender import EmailSender
from models import SendEmailRequest, SendEmailResponse, TemplateId
from template_render import TemplateRenderer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("email-service")

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    email_login = os.getenv("EMAIL_LOGIN")
    email_password = os.getenv("EMAIL_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.yandex.ru")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    templates_dir = os.getenv("TEMPLATES_DIR", "templates")

    if not email_login or not email_password:
        error_msg = "EMAIL_LOGIN or EMAIL_PASSWORD environment variables are not set."
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    app.state.template_renderer = TemplateRenderer(templates_dir=templates_dir)
    app.state.email_sender = EmailSender(
        mail=email_login,
        password=email_password,
        smtp_server=smtp_server,
        smtp_port=smtp_port
    )

    logger.info("Email service started successfully")

    try:
        yield
    finally:
        if hasattr(app.state, "email_sender"):
            del app.state.email_sender
        if hasattr(app.state, "template_renderer"):
            del app.state.template_renderer

        logger.info("Email service shutdown")


app = FastAPI(
    title="Email Service API",
    description="Микросервис для отправки электронных писем с использованием шаблонов",
    version="1.0.0",
    lifespan=lifespan
)


def get_services(request: Request):
    return {
        "email_sender": request.app.state.email_sender,
        "template_renderer": request.app.state.template_renderer
    }


@app.post(
    "/api/v1/send-email",
    response_model=SendEmailResponse,
    summary="Отправка email по шаблону",
    description="Отправляет электронное письмо, используя указанный шаблон и переменные",
    responses={
        200: {"description": "Email успешно отправлен"},
        400: {"description": "Некорректные данные запроса"},
        500: {"description": "Ошибка отправки email"}
    }
)
async def send_email(
        data: SendEmailRequest,
        services: Dict = Depends(get_services)
) -> SendEmailResponse:
    email_sender = services["email_sender"]
    template_renderer = services["template_renderer"]

    try:
        logger.info(f"Received email request: template={data.template_id.value}, recipient={data.recipient.email}")

        try:
            html_content = template_renderer.render(
                template_id=data.template_id.value,
                variables=data.variables
            )
        except ValueError as e:
            logger.error(f"Template error: {e}")
            raise HTTPException(status_code=400, detail=f"Template error: {str(e)}")

        # Отправка email
        email_id = email_sender.send_email(
            receiver=data.recipient.email,
            receiver_name=data.recipient.name,
            subject=data.subject,
            html_body=html_content,
            priority=data.metadata.priority if data.metadata else "normal"
        )

        # Формирование ответа
        from datetime import datetime
        response = SendEmailResponse(
            success=True,
            message="Email успешно отправлен",
            email_id=email_id or "unknown",
            sent_at=datetime.now()
        )

        logger.info(f"Email sent successfully: id={response.email_id}")
        return response

    except Exception as e:
        logger.exception(f"Error occurred while sending email to {data.recipient.email}")
        raise HTTPException(status_code=500, detail=f"Email sending error: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "email-service"}