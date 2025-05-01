import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";


export default function HeroSection() {
    return (
        <Card className='bg-stone-100 relative min-h-[500px] mt-12 mb-32 overflow-hidden'> 
        <div className="absolute top-0 right-0 bg-[url(/topography.svg)] bg-cover w-full h-full opacity-50"></div>
        <div className="absolute top-0 right-0 bg-stone-100/80 bg-cover w-full h-full"></div>
        <CardContent className='flex relative text-black flex-col h-full items-center justify-center py-8 md:py-12'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full'>
            <div className='flex flex-col items-center md:items-start justify-center w-full h-full order-2 md:order-1 mt-6 md:mt-0'>
              <h2 className='text-4xl sm:text-5xl md:text-7xl text-black font-semibold text-center md:text-left leading-tight'>Покупайте билеты в один клик</h2>
              <div className='w-full flex justify-center md:justify-start'>
                <Link href='/matches'>
                <Button size={{
                  default: 'md',
                  sm: 'lg'
                }} className='mt-6 hover:bg-lime-400 hover:text-black transition-all duration-300 px-4 py-1'>
                  <span className='text-xl sm:text-2xl italic'>Перейти к матчам <ArrowRight strokeWidth={3} className='ml-2 w-4 h-4 inline-block' /></span>
                </Button>
                </Link>
              </div>
            </div>
            <div className='flex flex-col items-center justify-center w-full h-full order-1 md:order-2'>
              <div className='relative w-full max-w-[300px] md:max-w-[400px]'>
                <Image 
                  src="/hero.png" 
                  alt="Билеты на матчи" 
                  width={400} 
                  height={400} 
                  className='rounded-lg shadow-lg object-cover' 
                  priority
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
};