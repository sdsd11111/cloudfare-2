'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CheckCircle2, Globe2, Compass } from 'lucide-react'

export default function AboutUs() {
  return (
    <section className="bg-[#f5f5f7] py-32 md:py-48" id="nosotros">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Main Header - Centered & Powerful */}
        <div className="text-center space-y-8 mb-32">
          <span className="text-[#004A87] text-[13px] font-[900] uppercase tracking-[0.5em] block">
            Nuestra Red Regional
          </span>
          <h2 className="text-[40px] md:text-[64px] font-[800] text-black leading-[1.1] tracking-tight max-w-[800px] mx-auto">
            Ingeniería de vanguardia en todo el sur del país.
          </h2>
          <p className="text-[20px] md:text-[24px] text-[#86868b] font-[400] max-w-[700px] mx-auto leading-relaxed">
            Desde la planificación técnica en Matriz Loja hasta el soporte especializado en la Amazonía, dominamos cada fase del ciclo del agua.
          </p>
        </div>

        {/* Feature Grid - Clean & Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#004A87] flex items-center justify-center">
               <MapPin className="text-white" size={24} />
            </div>
            <div className="space-y-2">
               <h3 className="text-[18px] font-[800] text-black">Matriz Loja</h3>
               <p className="text-[14px] text-[#86868b] leading-relaxed">
                  Centro estratégico de diseño y planificación técnica de proyectos hidráulicos.
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="w-12 h-12 bg-black flex items-center justify-center">
               <Globe2 className="text-white" size={24} />
            </div>
            <div className="space-y-2">
               <h3 className="text-[18px] font-[800] text-black">Valles de Riego</h3>
               <p className="text-[14px] text-[#86868b] leading-relaxed">
                  Infraestructura optimizada en Malacatos y Vilcabamba para el sector residencial y agrícola.
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#004A87] flex items-center justify-center">
               <Compass className="text-white" size={24} />
            </div>
            <div className="space-y-2">
               <h3 className="text-[18px] font-[800] text-black">Selva Amazónica</h3>
               <p className="text-[14px] text-[#86868b] leading-relaxed">
                  Soporte técnico y suministros industriales estratégicos en la zona de Yantzaza.
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="w-12 h-12 bg-black flex items-center justify-center">
               <CheckCircle2 className="text-white" size={24} />
            </div>
            <div className="space-y-2">
               <h3 className="text-[18px] font-[800] text-black">Garantía Total</h3>
               <p className="text-[14px] text-[#86868b] leading-relaxed">
                  Cada proyecto "llave en mano" asegura la tranquilidad de una inversión de por vida.
               </p>
            </div>
          </div>

        </div>

        {/* The Slogan - High End Minimalist Highlight */}
        <div className="mt-40 border-t border-gray-200 pt-20 text-center">
          <p className="text-[28px] md:text-[42px] font-[800] text-[#004A87] italic tracking-tight mb-12">
            "El Paraíso en Tu Hogar"
          </p>
          <Link 
            href="/nosotros" 
            className="inline-block px-14 py-5 bg-black text-white text-[13px] font-[800] uppercase tracking-[0.4em] hover:bg-[#004A87] transition-all rounded-none"
          >
            Explorar Nuestra Historia
          </Link>
        </div>

      </div>
    </section>
  )
}
