


export default function Footer() {
    return (<footer className="w-full bg-gradient-to-t from-stone-100 to-stone-50 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">О платформе</h3>
              <p className="text-stone-600 mb-4">Удобный сервис для предзаказа билетов на футбольные матчи</p>
              <p className="text-stone-600">© 2025 Ticket Preorder Platform</p>
            </div>
            <div>
              
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Контакты</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:info@ticket-platform.ru" className="text-stone-600 hover:text-black transition">info@ticket-platform.ru</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 " fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-stone-600">+7 (800) 555-35-35</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    )
}