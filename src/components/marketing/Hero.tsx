'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    image: '/aquatech_main_banner_lifestyle_1775927332337.png',
    title: 'Construye hoy,',
    highlight: 'disfruta siempre.',
    promo: 'Difiérelo a 12 meses',
    gracia: '+6 meses de gracia',
  },
  {
    image: '/aquatech_piletas_fountain_1775928691030.png',
    title: 'El arte del',
    highlight: 'agua en movimiento.',
    promo: 'Piletas & Cascadas Pro',
    gracia: 'Ingeniería de Vanguardia',
  },
  {
    image: '/aquatech_modern_jacuzzi_clean_1775927527209.png',
    title: 'Tu paraíso',
    highlight: 'de relajación.',
    promo: 'Hidromasajes Premium',
    gracia: 'Tecnología Apple-Style',
  }
]

export default function Hero() {
  const [index, setIndex] = useState(0)

  // Auto-play every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="relative w-full h-[100vh] bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <Image 
            src={slides[index].image} 
            alt="Aquatech Slide" 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative h-full w-full px-12 md:px-24 flex flex-col justify-center z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            <h1 className="font-brand font-[700] text-[56px] md:text-[80px] lg:text-[110px] text-white tracking-tight leading-[1] mb-6 drop-shadow-md">
              {slides[index].title} <br />
              <span className="text-[#38BDF8]">{slides[index].highlight}</span>
            </h1>
            
            <div className="bg-[#00DDAA] inline-block px-6 py-3 rounded-[16px] mb-10 shadow-xl">
              <span className="text-black font-[800] text-[24px] md:text-[32px] lg:text-[40px] tracking-tight">
                {slides[index].promo}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-xl inline-flex items-center gap-4 px-8 py-6 rounded-[24px] border border-white/20 shadow-2xl self-start">
                <div className="flex flex-col">
                  <span className="text-white font-[700] text-[20px] md:text-[28px] lg:text-[36px] leading-[1]">
                    {slides[index].gracia}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-8 flex items-center z-20">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/50 hover:bg-black/60 hover:text-white transition-all pointer-events-auto"
        >
          <ChevronLeft size={32} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-8 flex items-center z-20">
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/60 transition-all pointer-events-auto"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-12 right-12 md:right-24 flex gap-3 z-20 pointer-events-auto">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === i ? 'w-10 bg-white' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
