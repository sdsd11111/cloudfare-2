'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const categories = [
  {
    title: 'Saunas & Turcos',
    subtitle: 'Calor y bienestar terapéutico.',
    image: '/images/sauna-spotlight.png',
    link: '/saunas',
  },
  {
    title: 'Sistemas de Riego',
    subtitle: 'Tecnología para el campo y jardín.',
    image: '/images/riego-spotlight.png',
    link: '/riego',
  },
  {
    title: 'Piletas & Cascadas',
    subtitle: 'El sonido del agua en tu hogar.',
    image: '/images/piletas-spotlight.png',
    link: '/piletas',
  },
  {
    title: 'Accesorios & Insumos',
    subtitle: 'Todo lo que tu piscina necesita.',
    image: '/images/accesorios-grid.png',
    link: '/accesorios',
  }
]

export default function CategoryGrid() {
  return (
    <section className="bg-white py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1100px] mx-auto">
        {categories.map((cat) => (
          <div 
            key={cat.title}
            className="relative h-[550px] rounded-[24px] overflow-hidden group flex flex-col items-center justify-start text-center pt-20 px-10 bg-[#f5f5f7] transition-all hover:bg-[#ebebed]"
          >
            <div className="relative z-10">
              <h3 className="font-brand font-[700] text-[32px] md:text-[36px] tracking-tightest leading-tight mb-2 text-[#1d1d1f]">
                {cat.title}
              </h3>
              <p className="text-[17px] md:text-[19px] text-[#1d1d1f]/80 mb-6 font-[400] tracking-tight">
                {cat.subtitle}
              </p>
              <Link 
                href={cat.link} 
                className="text-[#0066cc] font-[500] text-[17px] flex items-center justify-center gap-1 group/link hover:underline"
              >
                Comprar ahora
                <ChevronRight size={20} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-[40%] mt-12 transition-transform duration-[1500ms] group-hover:scale-105">
              <Image 
                src={cat.image} 
                alt={cat.title} 
                fill 
                className="object-contain object-bottom p-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.03)]"
                sizes="(max-width: 1100px) 100vw, 550px"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
