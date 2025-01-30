import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)


class EmailSender:
    """
    Класс, отвечающий за отправку писем через SMTP.
    Используется SMTP_SSL для безопасного соединения.
    """

    def __init__(
            self,
            mail: str,
            password: str,
            smtp_server: str = 'smtp.yandex.ru',
            smtp_port: int = 465
    ) -> None:
        """
        Инициализирует объект EmailSender, устанавливает соединение со SMTP-сервером и выполняет логин.

        :param mail: Адрес почты отправителя.
        :param password: Пароль или App Password для почты отправителя.
        :param smtp_server: SMTP-сервер. По умолчанию smtp.yandex.ru.
        :param smtp_port: Порт SMTP-сервера. По умолчанию 465.
        """
        self.mail = mail
        self.password = password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port

        self.server: Optional[smtplib.SMTP_SSL] = None
        self._connect_and_login()

    def _connect_and_login(self) -> None:
        """
        Вспомогательный метод для установки соединения и логина.
        """
        try:
            self.server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            self.server.login(self.mail, self.password)
            logger.info("Successfully connected and logged in to the SMTP server.")
        except smtplib.SMTPException as e:
            logger.exception("Failed to connect/login to the SMTP server.")
            # Вариант: выбросить исключение, если хочется критического завершения
            # raise

    def _reconnect(self) -> None:
        """
        Вспомогательный метод для переподключения к SMTP-серверу при неожиданном разрыве соединения.
        """
        logger.warning("Connection to SMTP server is unexpectedly closed. Attempting to reconnect...")
        if self.server:
            try:
                self.server.quit()
            except Exception:
                pass
        self._connect_and_login()

    def __del__(self):
        """
        Деструктор, закрывающий соединение с SMTP-сервером, если оно существует.
        """
        if self.server is not None:
            try:
                self.server.quit()
                logger.info("SMTP connection closed successfully.")
            except Exception as e:
                logger.warning(f"Error while quitting SMTP server: {e}")

    def send_email(
            self,
            receiver: str,
            subject: str,
            title: str,
            code_type: str,
            body: str,
            max_retries: int = 1
    ) -> None:
        """
        Отправляет письмо на указанный адрес.

        :param receiver: Адрес получателя.
        :param subject: Тема письма.
        :param title: Заголовок письма (используется в теле сообщения).
        :param code_type: Тип кода (используется в теле сообщения).
        :param body: Текст кода (используется в теле сообщения).
        :param max_retries: Количество дополнительных попыток переподключиться и отправить при разрыве.
        :raises ValueError: Если нет активного SMTP-соединения.
        :raises smtplib.SMTPException: Если произошла ошибка при отправке письма.
        """
        if not self.server:
            error_msg = "Attempting to send an email with no active SMTP connection."
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.debug(f"Preparing email to {receiver} with subject '{subject}'")

        attempts = 0
        while True:  # цикл будет прерван либо при успешной отправке, либо при превышении max_retries
            try:
                msg = MIMEMultipart('alternative')
                msg['From'] = self.mail
                msg['To'] = receiver
                msg['Subject'] = subject

                html = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
                    <h1 style="text-align: center; font-size: 24px; text-transform: uppercase;">
                      {title}
                    </h1>
                    <p style="text-align: center; margin-top: 30px; font-size: 16px;">
                      Your login: {login}<br/>
                      Your password: {password}
                    </p>
                  </body>
                </html>
                """

                msg.attach(MIMEText(html, 'html'))
                self.server.send_message(msg)

                logger.info(f"Successfully sent email to {receiver}")
                break  # Если успех — выходим из цикла
            except smtplib.SMTPServerDisconnected:
                # Если это первая (или не первая) попытка, делаем reconnect
                if attempts < max_retries:
                    attempts += 1
                    logger.warning(f"SMTPServerDisconnected. Retrying {attempts}/{max_retries}...")
                    self._reconnect()
                    continue
                else:
                    logger.exception("Reached max_retries, raising exception.")
                    raise
            except smtplib.SMTPException as e:
                logger.exception(f"Failed to send email to {receiver}")
                raise e