# from kafka import KafkaConsumer
# import time
# from kafka.admin import KafkaAdminClient, NewTopic
#
#
# def main():
#     consumer = KafkaConsumer(
#         "email-tasks",
#         bootstrap_servers=["localhost:9092"],
#         client_id="email-tasks-consumer-client",
#     )
#     admin_client = KafkaAdminClient(
#         bootstrap_servers=["localhost:9092"],
#         client_id='python-admin-client'
#     )
#
#     for i in range(3):
#         # Даем время для получения метаданных
#         time.sleep(1)
#
#         t = consumer.topics()
#
#         if "email-tasks" not in t:
#             print("Попытка создать топик: " + str(i))
#
#             topic = NewTopic(name="email-tasks", num_partitions=1, replication_factor=1)
#             try:
#                 admin_client.create_topics(new_topics=[topic], validate_only=False)
#                 print("Топик 'email-tasks' создан успешно")
#             except Exception as e:
#                 print("Не удалось создать топик: ", str(e))
#         else:
#             break
#
#     print("Успешно запустился консьюмер на топик 'email-tasks'.")
#
#     for message in consumer:
#         print(message)
#
#
# if __name__ == "__main__":
#     main()