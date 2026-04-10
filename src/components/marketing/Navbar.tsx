'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

const dropdownItems = [
  { 
    name: 'Hidromasajes', href: '/hidromasajes',
    sub: [
      { name: 'Jacuzzis Premium', href: '/hidromasajes/jacuzzis' },
      { name: 'Tinas de Hidromasaje', href: '/hidromasajes/tinas' },
      { name: 'Ver Catálogo', href: '/hidromasajes' },
    ]
  },
  { 
    name: 'Turcos', href: '/turcos',
    sub: [
      { name: 'Turcos Residenciales', href: '/turcos/residenciales' },
      { name: 'Turcos Comerciales', href: '/turcos/comerciales' },
      { name: 'Ver Catálogo', href: '/turcos' },
    ]
  },
  { 
    name: 'Saunas', href: '/saunas',
    sub: [
      { name: 'Saunas Secos', href: '/saunas/secos' },
      { name: 'Saunas Húmedos', href: '/saunas/humedos' },
      { name: 'Ver Catálogo', href: '/saunas' },
    ]
  },
  { 
    name: 'Piletas', href: '/piletas',
    sub: [
      { name: 'Piscinas Residenciales', href: '/piletas/residenciales' },
      { name: 'Cascadas y Fuentes', href: '/piletas/cascadas' },
      { name: 'Ver Catálogo', href: '/piletas' },
    ]
  },
  { 
    name: 'Tuberías', href: '/tuberias',
    sub: [
      { name: 'Tuberías PVC', href: '/tuberias/pvc' },
      { name: 'Soldadura Hidráulica', href: '/tuberias/soldadura' },
      { name: 'Ver Catálogo', href: '/tuberias' },
    ]
  },
  { 
    name: 'Agua Potable', href: '/agua-potable',
    sub: [
      { name: 'Filtros y Purificación', href: '/agua-potable/filtros' },
      { name: 'Bombas de Presión', href: '/agua-potable/bombas' },
      { name: 'Ver Catálogo', href: '/agua-potable' },
    ]
  },
  { 
    name: 'Riego', href: '/riego',
    sub: [
      { name: 'Riego Tecnificado', href: '/riego/tecnificado' },
      { name: 'Aspersores', href: '/riego/aspersores' },
      { name: 'Ver Catálogo', href: '/riego' },
    ]
  },
]

const simpleItems = [
  { name: 'Accesorios', href: '/accesorios' },
  { name: 'Agencias', href: '/agencias' },
  { name: 'Blog', href: '/blog' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(name)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200)
  }

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] h-[44px] transition-all duration-300 border-b w-full ${
        scrolled || isOpen 
          ? 'bg-white/95 backdrop-blur-xl border-black/10' 
          : 'bg-white border-transparent'
      }`}
    >
      {/* Full-width centered row */}
      <div className="h-full w-full flex items-center justify-center px-8">

        {/* Brand */}
        <Link href="/" className="flex items-center shrink-0" style={{ marginRight: '32px' }}>
          <div className="relative w-[22px] h-[22px] overflow-hidden bg-[#0070C0] p-0.5" style={{ marginRight: '10px' }}>
            <Image src="/logo.jpg" alt="Aquatech" fill className="object-contain" sizes="22px" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Aquatech
          </span>
        </Link>

        {/* Nav Items — using inline styles to FORCE spacing */}
        {dropdownItems.map((item) => (
          <div 
            key={item.name} 
            className="relative h-[44px] flex items-center"
            onMouseEnter={() => handleMouseEnter(item.name)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={item.href}
              className="flex items-center h-full hover:text-[#0070C0] transition-colors whitespace-nowrap"
              style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', paddingLeft: '16px', paddingRight: '16px' }}
            >
              {item.name}
              <ChevronDown size={11} style={{ marginLeft: '4px', opacity: activeDropdown === item.name ? 1 : 0.4, transform: activeDropdown === item.name ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
            </Link>

            {/* Dropdown: White, Square, Border */}
            {activeDropdown === item.name && (
              <div 
                className="absolute top-[44px] left-0 z-50"
                style={{ minWidth: '220px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.sub.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className="block hover:text-[#0070C0] hover:bg-[#f5f5f7] transition-all"
                    style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 400, color: '#424245' }}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Simple Items */}
        {simpleItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href}
            className="flex items-center h-[44px] hover:text-[#0070C0] transition-colors whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', paddingLeft: '16px', paddingRight: '16px' }}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Mobile Toggle */}
      <button 
        className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-black p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 top-[44px] h-[calc(100vh-44px)] bg-white z-[90] transition-transform duration-500 lg:hidden ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex flex-col px-8 py-10 gap-1 h-full bg-white overflow-y-auto">
          {dropdownItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="block text-[22px] font-[600] text-black py-3 border-b border-black/5">{item.name}</Link>
          ))}
          {simpleItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="block text-[22px] font-[600] text-black py-3 border-b border-black/5">{item.name}</Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
