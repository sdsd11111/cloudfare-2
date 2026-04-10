'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative h-[100vh] w-full bg-black overflow-hidden">
      {/* Absolute Background Media - High Quality Pool */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 motion-safe:animate-ken-burns"
        style={{ backgroundImage: 'url("/images/hero-pool.png")' }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Hero Content - Clean typography like Think */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10 pt-20">
        <h1 className="font-brand font-[600] text-[48px] md:text-[80px] lg:text-[96px] text-white tracking-tightest leading-[1.05] mb-6">
          El paraíso <br className="hidden md:block" />
          <span className="text-[#38BDF8]">en tu hogar</span>
        </h1>
        
        <p className="max-w-3xl text-lg md:text-2xl text-white/80 font-[400] mb-12 tracking-tight">
          Diseño y construcción de sistemas hídricos inteligentes. <br className="hidden md:block" />
          Ingeniería de vanguardia en Loja y Zamora.
        </p>

        {/* Impact Links - Apple Style instead of chunky buttons */}
        <div className="flex flex-wrap items-center justify-center gap-10">
          <Link 
            href="/cotizador" 
            className="text-[19px] md:text-[21px] font-[500] text-[#38BDF8] hover:underline flex items-center gap-1 group"
          >
            Iniciar una cotización
            <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link 
            href="/obras" 
            className="text-[19px] md:text-[21px] font-[500] text-[#38BDF8] hover:underline flex items-center gap-1 group"
          >
            Ver portafolio de obras
            <ChevronRight size={20} className="mt-0.5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Subtle Bottom Indicator */}
      <div className="absolute bottom-12 inset-x-0 flex justify-center text-white/30 animate-bounce">
        <div className="w-5 h-8 border-2 border-current rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-current rounded-full" />
        </div>
      </div>
    </section>
  )
}
