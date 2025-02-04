#!/bin/bash

# Проверка количества аргументов
if [ $# -lt 2 ]; then
    echo "Использование: $0 <output_filename> <source_file1> [source_file2...]"
    exit 1
fi

output_filename="$1"
shift  # Убираем первый аргумент (output_filename)

# Проверка, что осталось минимум 2 файла для компиляции
if [ $# -lt 1 ]; then
    echo "Ошибка: требуется хотя бы два .cpp файла."
    exit 1
fi

# Проверка версии g++
gcc_version=$(g++ -dumpversion)
major_version=$(echo "$gcc_version" | awk -F. '{print $1}')

if [ "$major_version" -lt 8 ]; then
    echo "Ошибка: требуется g++ версии 8 или выше. У вас $gcc_version."
    exit 1
fi

# Проверка существования output_filename
if [ -f "$output_filename" ]; then
    read -p "Файл '$output_filename' уже существует. Перезаписать? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Компиляция отменена."
        exit 1
    fi
fi

# Компиляция
g++ -std=c++20 -o "$output_filename" "$@"

# Проверка успешности компиляции
if [ $? -eq 0 ]; then
    echo "Компиляция успешно завершена: $output_filename"
else
echo "Ошибка компиляции."
exit 1
fi
