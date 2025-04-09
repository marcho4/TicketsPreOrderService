"use client"

import useEmblaCarousel from "embla-carousel-react";
import FeatureCard from "./FeatureCard";
import { 
  UserPlus, 
  LayoutDashboard, 
  FileCheck, 
  Bell, 
  CreditCard, 
  MousePointerClick, 
  Tags, 
  ShieldCheck 
} from "lucide-react";
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from "react";
import { useAutoplayProgress } from "./CarouselProgressBar";

const features = [
    {
        title: "Организуйте и создавайте матчи",
        description: "Регистрируйтесь как организатор и создавайте матчи с полной информацией о месте, времени и доступных билетах.",
        icon: <UserPlus />
    },
    {
        title: "Управляйте билетами и матчами",
        description: "Удобная панель управления позволяет контролировать все аспекты мероприятий в едином интерфейсе.",
        icon: <LayoutDashboard />
    },
    {
        title: "Загружайте билеты в удобном формате",
        description: "Загружайте билеты в массовом режиме с помощью Excel или CSV файлов для быстрой настройки мероприятия.",
        icon: <FileCheck />
    },
    {
        title: "Получайте уведомления о покупке билета",
        description: "Мгновенные оповещения о каждой транзакции помогут вам всегда быть в курсе всех продаж и бронирований.",
        icon: <Bell />
    },
    {
        title: "Оплатите билет когда захотите",
        description: "Гибкая система оплаты позволяет зарезервировать билет и оплатить его позже, без риска потерять место.",
        icon: <CreditCard />
    },
    {
        title: "Резервируйте билеты по щелчку пальцев",
        description: "Интуитивно понятный интерфейс позволяет забронировать лучшие места буквально за несколько секунд.",
        icon: <MousePointerClick />
    },
    {
        title: "Билеты всех ценовых категорий",
        description: "Широкий выбор билетов разных ценовых категорий, чтобы каждый болельщик нашел подходящий вариант.",
        icon: <Tags />
    },
    {
        title: "Только достоверные организаторы матчей",
        description: "Мы тщательно проверяем всех организаторов, чтобы гарантировать подлинность и надежность каждого билета.",
        icon: <ShieldCheck />
    }
]

export default function Features() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        slidesToScroll: 1,
      }, [ Autoplay({
        delay: 4000,
      }) ]
    );  
    const progressNode = useRef(null)


    const { showAutoplayProgress } = useAutoplayProgress(emblaApi, progressNode)

    
    return (
        <div className="mb-32">
            <div className="embla w-full max-w-6xl mx-auto my-12 overflow-hidden " ref={emblaRef}>
                <div className="embla__container flex">
                    {features.map((feature, index) => (
                        <div key={index} className="embla__slide flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_32%] px-4">
                            <FeatureCard title={feature.title} description={feature.description} icon={feature.icon} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="embla__controls w-full flex justify-center items-center">
                <div className={`embla__progress`.concat(
                    showAutoplayProgress ? '' : ' embla__progress--hidden'
                )}>
                    <div className="embla__progress__bar bg-gradient-to-r from-blue-300 to-blue-800" ref={progressNode} />
                </div>
            </div>
            

        </div>
      
    )
}