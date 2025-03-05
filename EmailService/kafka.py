import logging
from email_sender import EmailSender
from template_render import TemplateRenderer
import time
from dotenv import load_dotenv
import os
from confluent_kafka import Consumer, KafkaException, KafkaError
from confluent_kafka.admin import AdminClient, NewTopic
from datetime import datetime
from models import *


class KafkaEmailSender:
    def __init__(self, topic_name="email-tasks"):
        load_dotenv()


        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )
        self.logger = logging.getLogger("email-service")

        is_docker = os.getenv("DOCKER") == "true"
        self.logger.info(f"is_docker {is_docker}")

        self.bootstrap_servers = "kafka-1:29092" if is_docker else "localhost:9092"

        # Получение данных из .env
        email_login = os.getenv("EMAIL_LOGIN")
        email_password = os.getenv("EMAIL_PASSWORD")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.yandex.ru")
        smtp_port = int(os.getenv("SMTP_PORT", "465"))
        templates_dir = os.getenv("TEMPLATES_DIR", "templates")

        if not email_login or not email_password:
            error_msg = "EMAIL_LOGIN or EMAIL_PASSWORD environment variables are not set."
            self.logger.error(error_msg)
            raise RuntimeError(error_msg)

        self.template_renderer = TemplateRenderer(templates_dir=templates_dir)

        self.email_sender = EmailSender(
            mail=email_login,
            password=email_password,
            smtp_server=smtp_server,
            smtp_port=smtp_port
        )

        self.topic_name = topic_name

        self.admin_client = AdminClient({"bootstrap.servers": self.bootstrap_servers})
        self.consumer = Consumer({
            "bootstrap.servers": self.bootstrap_servers,
            "group.id": "email-tasks-consumer",
            "auto.offset.reset": "earliest",
            "enable.auto.commit": False
        })

        self.consumer.subscribe([topic_name])
        self.logger.info(f"Успешно запустился консьюмер на топик '{topic_name}'.")

    def create_topic(self, topic_name):
        try:
            existing_topics = self.admin_client.list_topics(timeout=5).topics
            if topic_name in existing_topics:
                print(f"Топик '{topic_name}' уже существует.")
                return

            # Создаем объект топика
            topic = NewTopic(topic_name, num_partitions=1, replication_factor=1)
            futures = self.admin_client.create_topics([topic])

            for created_topic, future in futures.items():
                try:
                    future.result()  # Блокирует выполнение до создания топика
                    print(f"Топик '{created_topic}' успешно создан.")
                except Exception as e:
                    print(f"Не удалось создать топик '{created_topic}': {e}")
        except KafkaException as e:
            print(f"Ошибка при проверке топиков: {e}")

    def start_polling(self):
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"Ошибка: {msg.error()}")
                        break

                self.logger.info(f"Получил сообщение: {msg}. Начинаю обработку")
                if self.process_msg(msg) is False:
                    self.logger.error("Ошибка при отправке email")


        except KeyboardInterrupt:
            self.logger.info("Завершение работы...")
        finally:
            self.consumer.close()

    def process_msg(self, msg):
        try:
            json_data = msg.value().decode('utf-8')
            data = SendEmailRequest.parse_raw(json_data)

            self.logger.info(f"Received email request: template={data.template_id.value}, recipient={data.recipient.email}")

            try:
                html_content = self.template_renderer.render(
                    template_id=data.template_id.value,
                    variables=data.variables
                )

            except ValueError as e:
                self.logger.error(f"Template error: {e}")
                return False

            # Отправка email
            email_id = self.email_sender.send_email(
                receiver=data.recipient.email,
                receiver_name=data.recipient.name,
                subject=data.subject,
                html_body=html_content,
                priority=data.metadata.priority if data.metadata else "normal"
            )

            self.logger.info(f"Email sent successfully: id={email_id}")
            self.consumer.commit(message=msg, asynchronous=False)
            return True

        except Exception as e:
            self.logger.exception(f"Error occurred while sending email: {e}")
            return False

def main():
    kafka_sender = KafkaEmailSender(topic_name="email-tasks")
    kafka_sender.start_polling()

if __name__ == "__main__":
    main()