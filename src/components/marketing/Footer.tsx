'use client'

import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { name: 'Hidromasajes', href: '/hidromasajes' },
  { name: 'Turcos', href: '/turcos' },
  { name: 'Saunas', href: '/saunas' },
  { name: 'Piletas', href: '/piletas' },
  { name: 'Tuberías', href: '/tuberias' },
  { name: 'Agua Potable', href: '/agua-potable' },
  { name: 'Riego', href: '/riego' },
  { name: 'Accesorios', href: '/accesorios' },
  { name: 'Agencias', href: '/agencias' },
  { name: 'Blog', href: '/blog' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#fff', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '40px', paddingBottom: '32px' }}>
      
      {/* Navigation row — centered */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0px', paddingBottom: '24px' }}>
        {navLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            style={{ fontSize: '13px', fontWeight: 600, color: '#424245', padding: '8px 16px', textDecoration: 'none', whiteSpace: 'nowrap' }}
            className="hover:text-[#0070C0] transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', height: '1px', backgroundColor: 'rgba(0,0,0,0.08)' }} />

      {/* Agencias + Síguenos row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', paddingTop: '28px', paddingBottom: '28px', flexWrap: 'wrap' }}>
        
        {/* Agencias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agencias</span>
          <Link href="/agencias" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">
            Encuentra una tienda
          </Link>
        </div>

        {/* Síguenos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Síguenos en</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="#" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Facebook</Link>
            <Link href="#" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Instagram</Link>
            <Link href="#" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Twitter</Link>
          </div>
        </div>

        {/* Aquatech */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aquatech</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/nosotros" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Quienes somos</Link>
            <Link href="/preguntas" style={{ fontSize: '13px', color: '#424245', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Preguntas Frecuentes</Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', height: '1px', backgroundColor: 'rgba(0,0,0,0.08)' }} />

      {/* Logo + Brand + Legal */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '24px' }}>
        
        {/* Logo + Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '10px' }}>
          <div style={{ position: 'relative', width: '22px', height: '22px', overflow: 'hidden', backgroundColor: '#0070C0', padding: '2px' }}>
            <Image src="/logo.jpg" alt="Aquatech" fill className="object-contain" sizes="22px" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Aquatech
          </span>
        </Link>

        {/* Copyright */}
        <p style={{ fontSize: '12px', color: '#86868b', fontWeight: 400, margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
          © {year} Aquatech Ecuador S.A. Todos los derechos reservados.
        </p>

        {/* Legal Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/privacidad" style={{ fontSize: '12px', color: '#86868b', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Privacidad</Link>
          <span style={{ color: 'rgba(0,0,0,0.15)' }}>|</span>
          <Link href="/legal" style={{ fontSize: '12px', color: '#86868b', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Legal</Link>
          <span style={{ color: 'rgba(0,0,0,0.15)' }}>|</span>
          <Link href="/mapa" style={{ fontSize: '12px', color: '#86868b', textDecoration: 'none' }} className="hover:text-[#0070C0] transition-colors">Mapa del Sitio</Link>
        </div>
      </div>
    </footer>
  )
}
