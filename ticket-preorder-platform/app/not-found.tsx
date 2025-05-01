export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Страница не найдена</h1>
        <p className="text-gray-600 mb-4">Извините, запрашиваемая страница не существует.</p>
        <a 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Вернуться на главную
        </a>
      </div>
    );
  }