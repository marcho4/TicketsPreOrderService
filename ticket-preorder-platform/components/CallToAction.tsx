import Link from "next/link";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { ArrowRight } from "lucide-react";


export default function CallToAction() {
    return (
        <div className='max-w-6xl mx-auto overflow-hidden'>
        <CardContent className='overflow-hidden'>
            <p className="mb-20 text-[clamp(2.625rem,_0.7086rem_+_8.1768vw,_7.25rem)] 
            font-semibold leading-[clamp(2.938rem,_0.8144rem_+_9.0608vw,_8.063rem)] 
            -tracking-4 bg-gradient-to-b from-blue-800 via-blue-700 via-[15%] to-blue-600 
            bg-clip-text text-transparent w-[101%] text-balance">
              Погрузиться в мир футбола
            </p>
            <Link href='/login'>
              <Button size='lg' className='hover:bg-lime-400 hover:text-black transition-all duration-300'>
                <span className='text-2xl italic'>Стать частью спорта<ArrowRight strokeWidth={3} className='ml-2 w-4 h-4 inline-block' /></span>
              </Button>
            </Link>
        </CardContent>
      </div>
    ) 
}