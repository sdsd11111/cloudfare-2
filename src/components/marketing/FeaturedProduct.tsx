'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function FeaturedProduct() {
  return (
    <section className="relative w-full bg-black flex flex-col items-center pt-32 pb-0 overflow-hidden">
      <div className="relative z-10 text-center px-6 max-w-[1100px] mx-auto mb-20">
        <h2 className="font-brand font-[700] text-[52px] md:text-[80px] text-white tracking-tightest leading-[1.1] mb-6">
          Hidromasajes <br className="md:hidden" />
          <span className="bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent opacity-95">
            Pro
          </span>
        </h2>
        
        <p className="text-[19px] md:text-[23px] text-[#86868b] font-[400] mb-10 max-w-2xl mx-auto leading-snug tracking-tight">
          El paraíso de la relajación. <br className="hidden md:block" />
          Ingeniería de vanguardia con terminaciones industriales.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-10">
          <Link href="/hidromasajes" className="text-[18px] md:text-[20px] font-[500] text-[#0071e3] hover:underline flex items-center gap-1 group">
            Más información
            <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
          <Link href="/cotizador" className="text-[18px] md:text-[20px] font-[500] text-[#0071e3] hover:underline flex items-center gap-1 group">
            Comprar
            <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="relative w-full max-w-[1100px] mx-auto aspect-[16/7] group">
        <Image 
          src="/images/jacuzzi-spotlight.png" 
          alt="Hidromasaje Premium" 
          fill
          className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(56,189,248,0.08)] transition-transform duration-[4000ms] group-hover:scale-105"
          sizes="1100px"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      </div>

      <div className="w-full h-[0.5px] bg-white/5" />
    </section>
  )
}
