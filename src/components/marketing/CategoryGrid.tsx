'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CategoryGrid() {
  return (
    <section className="bg-white w-full border-t border-gray-100">
      <div className="flex flex-col w-full">
        
        {/* Row 1: Full-width 50/50 Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full">
          {/* Card 1: Lifestyle Focus */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[600px] w-full overflow-hidden group">
            <Image 
              src="/aquatech_main_banner_lifestyle_1775927332337.png" 
              alt="Nuestros locales" 
              fill
              className="object-cover transition-transform duration-[4000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
            <div className="absolute bottom-10 left-10 z-10">
              <h3 className="text-white text-[32px] md:text-[42px] font-[700] tracking-tight leading-tight mb-3">
                Nuestros locales
              </h3>
              <p className="text-white/90 text-[17px] md:text-[20px] font-[400] mb-6">Loja • Zamora • Machala</p>
              <Link href="/tiendas" className="bg-white text-black px-6 py-2.5 rounded-full text-[14px] font-[600] hover:bg-black hover:text-white transition-all shadow-lg">
                 Visítanos
              </Link>
            </div>
          </div>

          {/* Card 2: Product Focus */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[600px] w-full overflow-hidden group bg-[#f5f5f7] flex flex-col items-center justify-center p-10 text-center border-l border-white">
             <div className="relative z-10 mb-8">
                <h3 className="text-[#1d1d1f] text-[32px] md:text-[42px] font-[700] tracking-tight mb-3 leading-none">Hidromasajes</h3>
                <p className="text-[#86868b] text-[17px] md:text-[20px] font-[400]">Tecnología en relajación profunda</p>
             </div>
             <div className="relative w-full h-[300px]">
                <Image 
                  src="/aquatech_modern_jacuzzi_clean_1775927527209.png" 
                  alt="Hidromasaje" 
                  fill
                  className="object-contain transition-transform duration-1000 group-hover:scale-105"
                />
             </div>
             <Link href="/productos/jacuzzis" className="mt-8 bg-[#0071e3] text-white px-8 py-3 rounded-full text-[15px] font-[600] hover:bg-black transition-all shadow-md">
               Más información
             </Link>
          </div>
        </div>

        {/* Row 2: Full-width 50/50 Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full border-t border-white">
          {/* Card 3: Riego Focus */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[600px] w-full overflow-hidden group bg-white flex flex-col items-center justify-center p-10 text-center">
             <div className="mb-8">
                <h3 className="text-[#1d1d1f] text-[32px] md:text-[38px] font-[700] mb-3">Sistemas de Riego</h3>
                <p className="text-[#86868b] text-[17px]">Ingeniería para el campo</p>
             </div>
             <div className="relative w-full h-[280px]">
                <Image 
                  src="/aquatech_featured_macro_nozzle_1775927508512.png" 
                  alt="Riego" 
                  fill
                  className="object-contain"
                />
             </div>
             <Link href="/servicios/riego" className="mt-8 bg-[#0071e3] text-white px-8 py-3 rounded-full text-[15px] font-[600] hover:bg-black transition-all">
               Más información
             </Link>
          </div>

          {/* Card 4: Accesorios Focus */}
          <div className="relative h-[450px] md:h-[550px] lg:h-[600px] w-full overflow-hidden group bg-[#fafafa] flex flex-col items-center justify-center p-10 text-center border-l border-gray-50">
             <div className="mb-8">
                <h3 className="text-[#1d1d1f] text-[32px] md:text-[38px] font-[700] mb-3">Accesorios</h3>
                <p className="text-[#86868b] text-[17px]">Mantenimiento de vanguardia</p>
             </div>
             <div className="relative w-full h-[300px]">
                <Image 
                  src="/aquatech_modern_jacuzzi_clean_1775927527209.png" 
                  alt="Accesorios" 
                  fill
                  className="object-contain"
                />
             </div>
             <Link href="/servicios/accesorios" className="mt-8 bg-[#0071e3] text-white px-8 py-3 rounded-full text-[15px] font-[600] hover:bg-black transition-all">
               Más información
             </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
