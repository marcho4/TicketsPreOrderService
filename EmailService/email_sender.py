import logging
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

logger = logging.getLogger("email-service.sender")


class EmailSender:
    def __init__(
            self,
            mail: str,
            password: str,
            smtp_server: str = "smtp.yandex.ru",
            smtp_port: int = 465
    ):
        self.mail = mail
        self.password = password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port

        logger.info(f"EmailSender initialized with server {smtp_server}:{smtp_port}")

    def send_email(
            self,
            receiver: str,
            subject: str,
            html_body: str,
            receiver_name: Optional[str] = None,
            priority: str = "normal"
    ) -> str:
        email_id = str(uuid.uuid4())

        message = MIMEMultipart()
        message["From"] = self.mail

        if receiver_name:
            message["To"] = f"{receiver_name} <{receiver}>"
        else:
            message["To"] = receiver

        message["Subject"] = subject

        priority_headers = {
            "high": "1",
            "normal": "3",
            "low": "5"
        }
        priority_value = priority_headers.get(priority.lower(), "3")
        message["X-Priority"] = priority_value

        message["X-Message-ID"] = email_id

        message.attach(MIMEText(html_body, "html"))


        try:
            server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, timeout=6)
            server.login(self.mail, self.password)

            server.send_message(message)
            server.quit()

            logger.info(f"Email sent to {receiver} with subject '{subject}', id={email_id}")
            return email_id

        except smtplib.SMTPException as e:
            logger.error(f"SMTP error when sending email to {receiver}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error when sending email to {receiver}: {str(e)}")
            raise
