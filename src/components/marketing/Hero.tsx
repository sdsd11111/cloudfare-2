'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full h-[100vh] bg-[#f5f5f7] overflow-hidden">
      {/* Absolute Background Media - Fullscreen Lifestyle Pool */}
      <div className="absolute inset-0">
        <Image 
          src="/aquatech_main_banner_lifestyle_1775927332337.png" 
          alt="Aquatech Lifestyle Pool" 
          fill 
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
      </div>

      {/* Hero Content - True Fullscreen Overlays */}
      <div className="relative h-full w-full px-12 md:px-24 flex flex-col justify-center z-10">
        <div className="max-w-4xl">
          <h1 className="font-brand font-[700] text-[56px] md:text-[80px] lg:text-[110px] text-white tracking-tight leading-[1] mb-6 drop-shadow-md">
            Construye hoy, <br />
            <span className="text-[#38BDF8]">disfruta siempre.</span>
          </h1>
          
          <div className="bg-[#00DDAA] inline-block px-6 py-3 rounded-[16px] mb-10 shadow-xl">
            <span className="text-black font-[800] text-[24px] md:text-[32px] lg:text-[40px] tracking-tight">
              Difiérelo a 12 meses
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-xl inline-flex items-center gap-4 px-8 py-6 rounded-[24px] border border-white/20 shadow-2xl self-start">
              <span className="text-white font-[800] text-[40px] md:text-[60px] lg:text-[80px] leading-none">+6</span>
              <div className="flex flex-col">
                <span className="text-white font-[700] text-[20px] md:text-[28px] lg:text-[36px] leading-[1]">meses</span>
                <span className="text-white font-[400] text-[18px] md:text-[24px] lg:text-[32px] leading-[1]">de gracia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal - Positioned in the corner of the viewport */}
      <div className="absolute bottom-12 left-12 md:left-24 z-10 max-w-lg hidden md:block">
        <p className="text-[13px] lg:text-[15px] text-white/80 font-[500] tracking-tight leading-snug drop-shadow-lg">
          Válido del 11 al 30 de Abril. <br />
          Aplica para proyectos residenciales y comerciales a nivel nacional. <br />
          No aplica promoción sobre promoción.
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-8 flex items-center">
        <button className="w-12 h-12 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/50 hover:bg-black/40 transition-all">
          <ChevronRight size={32} className="rotate-180" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-8 flex items-center">
        <button className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/60 transition-all">
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  )
}
