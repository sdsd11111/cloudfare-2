'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function FeaturedProduct() {
  return (
    <section className="relative w-full bg-black py-20 overflow-hidden">
      <div className="container mx-auto px-6 h-full flex flex-col items-center">
        {/* Sub-label like iPhone 17 News */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-[700] text-[20px] md:text-[24px]">Aquatech</span>
          <div className="flex items-center">
             <span className="text-[#0071e3] font-[800] text-[20px] md:text-[24px]">[</span>
             <span className="text-white font-[400] text-[16px] md:text-[20px] mx-1">News</span>
             <span className="text-[#0071e3] font-[800] text-[20px] md:text-[24px]">]</span>
          </div>
        </div>

        {/* Main Huge Heading */}
        <div className="text-center mb-12">
          <p className="text-white/60 text-[18px] md:text-[22px] font-[500] mb-0 tracking-tight">Piletas & Cascadas</p>
          <h2 className="font-brand font-[700] text-[64px] md:text-[100px] lg:text-[140px] text-white tracking-tightest leading-none">
            <span className="bg-gradient-to-b from-[#ff8c42] to-[#ff5d00] bg-clip-text text-transparent">
              PRO
            </span>
          </h2>
        </div>

        {/* Main High Contrast Product Image */}
        <div className="relative w-full max-w-[900px] aspect-[16/10] mb-20">
          <Image 
            src="https://cesarweb.b-cdn.net/home/s.jpg" 
            alt="Aquatech Nozzle Pro" 
            fill
            className="object-contain"
            sizes="900px"
          />
        </div>

        {/* Action Button - Apple Pill Style */}
        <Link 
          href="/productos/pro" 
          className="bg-[#0071e3] text-white px-8 py-3 rounded-full font-[500] text-[17px] hover:bg-[#0077ed] transition-colors flex items-center gap-1 group"
        >
          Más información
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
