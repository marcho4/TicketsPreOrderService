import Link from "next/link";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { ArrowRight } from "lucide-react";


export default function CallToAction() {
    return (
        <div className='max-w-6xl mx-auto overflow-hidden mb-20'>
            <p className="pb-20 font-semibold h-fit
            -tracking-4 bg-gradient-to-b from-blue-800 via-blue-700 via-[15%] to-blue-600 
            bg-clip-text text-transparent  text-balance text-4xl sm:text-6xl lg:text-7xl">
              Погрузиться в мир футбола
            </p>
            <Link href='/login'>
              <Button size={{
                default: 'lg',
                sm: 'md'
              }} className='hover:bg-lime-400 hover:text-black transition-all duration-300 px-4 py-1'>
                <span className='text-xl sm:text-2xl italic'>Стать частью спорта<ArrowRight strokeWidth={3} className='ml-2 w-4 h-4 inline-block' /></span>
              </Button>
            </Link>
      </div>
    ) 
}