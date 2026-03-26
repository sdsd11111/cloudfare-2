'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProjectDetailClient({ project, availableOperators = [] }: any) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditingTeam, setIsEditingTeam] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<number[]>(project.team.map((t: any) => t.user.id))
  const [isSavingTeam, setIsSavingTeam] = useState(false)

  const handleSaveTeam = async () => {
    setIsSavingTeam(true)
    try {
      await fetch(`/api/projects/${project.id}/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorIds: selectedTeam })
      })
      setIsEditingTeam(false)
      router.refresh()
    } catch (e) {
      alert('Error guardando equipo')
    } finally {
      setIsSavingTeam(false)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }).format(d)
  }

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    }).format(d)
  }

  // --- MÉTRICAS ---
  const totalPhases = project.phases.length
  const completedPhases = project.phases.filter((p: any) => p.status === 'COMPLETADA').length
  const progressPercent = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0

  // Presupuesto vs Gastos
  const theoreticalBudget = Number(project.estimatedBudget) || 0
  const realExpenses = project.expenses.reduce((acc: number, exp: any) => acc + Number(exp.amount), 0)
  const expenseRatio = theoreticalBudget > 0 ? Math.min((realExpenses / theoreticalBudget) * 100, 100) : 0
  const isCostoExcedido = realExpenses > theoreticalBudget && theoreticalBudget > 0

  // Tiempo: Días Est. vs Reales
  const theoreticalDays = project.phases.reduce((acc: number, p: any) => acc + (p.estimatedDays || 0), 0)
  
  // Cálculo de Tiempo Real
  let realDays = 0
  if (project.startDate) {
    const start = new Date(project.startDate)
    const end = project.status === 'COMPLETADO' && project.endDate ? new Date(project.endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    realDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  const timeRatio = theoreticalDays > 0 ? Math.min((realDays / theoreticalDays) * 100, 100) : 0
  const isTiempoExcedido = realDays > theoreticalDays && theoreticalDays > 0

  // --- GENERACIÓN DE PDF ---
  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const doc = new jsPDF()
      const primaryColor = [56, 189, 248] // #38BDF8
      
      // Header
      doc.setFillColor(12, 26, 42) // bg-deep
      doc.rect(0, 0, 210, 45, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('AQUATECH - REPORTE DE PROYECTO', 20, 25)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`ID Proyecto: #${project.id}`, 20, 35)
      doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 150, 35)

      // 1. RESUMEN EJECUTIVO
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen Ejecutivo', 20, 60)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Proyecto: ${project.title}`, 20, 70)
      doc.text(`Estado: ${project.status}`, 20, 77)
      doc.text(`Cliente: ${project.client?.name || 'N/A'}`, 120, 70)
      doc.text(`Ubicación: ${project.address || project.client?.address || 'N/A'}`, 120, 77)

      // Tabla Comparativa
      autoTable(doc, {
        startY: 85,
        head: [['Métrica', 'Teórico (Planificado)', 'Real (Actual)', 'Estado']],
        body: [
          [
            'Presupuesto/Inversión', 
            `$ ${theoreticalBudget.toFixed(2)}`, 
            `$ ${realExpenses.toFixed(2)}`, 
            isCostoExcedido ? 'EXCEDIDO' : 'DENTRO DE RANGO'
          ],
          [
            'Tiempo de Ejecución', 
            `${theoreticalDays} días`, 
            `${realDays} días`, 
            isTiempoExcedido ? 'DEMORADO' : 'A TIEMPO'
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [56, 189, 248] }
      })

      // 2. BITÁCORA DE AVANCES (CHAT)
      doc.addPage()
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Bitácora de Campo (Avances)', 20, 20)
      
      const chatData = project.chatMessages.map((msg: any) => [
        formatDateTime(msg.createdAt),
        msg.user.name,
        msg.phase?.title || 'General',
        msg.lat && msg.lng ? `${msg.lat}, ${msg.lng}` : '-',
        msg.content || (msg.type === 'IMAGE' ? '[Imagen subida]' : '[Sin contenido]')
      ])

      autoTable(doc, {
        startY: 30,
        head: [['Fecha/Hora', 'Operador', 'Fase', 'Coordenadas', 'Descripción del Avance']],
        body: chatData,
        styles: { fontSize: 9 }
      })

      // 3. REGISTRO DE ASISTENCIA
      doc.addPage()
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Registro de Asistencia (Horarios)', 20, 20)

      const attendanceData = project.dayRecords.map((rec: any) => [
        formatDate(rec.createdAt),
        rec.user.name,
        rec.startTime ? new Date(rec.startTime).toLocaleTimeString() : '---',
        rec.endTime ? new Date(rec.endTime).toLocaleTimeString() : 'Aún en labor',
        rec.endTime && rec.startTime ? 
          `${((new Date(rec.endTime).getTime() - new Date(rec.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs` : '---'
      ])

      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'Operador', 'Entrada', 'Salida', 'Total Horas']],
        body: attendanceData,
        styles: { fontSize: 9 }
      })

      // 4. DETALLE DE GASTOS
      doc.addPage()
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Detalle de Gastos Reportados', 20, 20)

      const expenseData = project.expenses.map((exp: any) => [
        formatDate(exp.date),
        exp.description,
        exp.category || 'General',
        `$ ${Number(exp.amount).toFixed(2)}`
      ])

      autoTable(doc, {
        startY: 30,
        head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
        body: expenseData,
        styles: { fontSize: 9 },
        foot: [['', '', 'TOTAL REAL:', `$ ${realExpenses.toFixed(2)}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      })

      // Footer en cada página (opcional, aquí solo una vez al final)
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('Este documento es un reporte generado automáticamente por el sistema Aquatech Field CRM.', 105, 285, { align: 'center' })

      doc.save(`Reporte_Proyecto_${project.id}_${project.title.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Error al generar el reporte PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="dashboard-header mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <Link href="/admin/proyectos" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
              &larr; Volver
            </Link>
            <span className={`status-badge status-${project.status.toLowerCase()}`}>
              {project.status === 'ACTIVO' ? 'Activo' : project.status === 'COMPLETADO' ? 'Completado' : project.status === 'LEAD' ? 'Lead' : 'Cancelado'}
            </span>
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>{project.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '1.1rem' }}>
            {project.type} {project.subtype ? `— ${project.subtype}` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn ${isGenerating ? 'btn-ghost' : 'btn-primary'} btn-sm`} 
              onClick={generateReport}
              disabled={isGenerating}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isGenerating ? 'Generando...' : 'Descargar Reporte'}
            </button>
            <Link href={`/admin/cotizaciones/nuevo?projectId=${project.id}`} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              Generar Cotización
            </Link>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2px' }}>Presupuesto Estimado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              $ {theoreticalBudget.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '30px', alignItems: 'stretch' }}>
        
        {/* COMPARATIVA DE GASTOS */}
        <div className="card" style={{ minWidth: 0, borderLeft: `4px solid ${isCostoExcedido ? 'var(--danger)' : 'var(--success)'}`, padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Inversión: Teórico vs Real
            </h3>
            {isCostoExcedido && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>EXCEDIDO</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Barra Teórica */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Presupuesto (Teórico)</span>
                <span style={{ fontWeight: 'bold' }}>$ {theoreticalBudget.toFixed(2)}</span>
              </div>
              <div className="progress-bar" style={{ height: '14px', backgroundColor: 'var(--bg-surface)', borderRadius: '7px' }}>
                <div className="progress-fill" style={{ width: '100%', backgroundColor: 'var(--primary)', borderRadius: '7px', opacity: 0.7 }}></div>
              </div>
            </div>

            {/* Barra Real */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: isCostoExcedido ? 'var(--danger)' : 'var(--text-muted)' }}>Gastado (Real)</span>
                <span style={{ fontWeight: 'bold', color: isCostoExcedido ? 'var(--danger)' : 'var(--success)' }}>$ {realExpenses.toFixed(2)}</span>
              </div>
              <div className="progress-bar" style={{ height: '22px', backgroundColor: 'var(--bg-surface)', borderRadius: '11px' }}>
                <div className="progress-fill" style={{ 
                  width: `${expenseRatio}%`, 
                  backgroundColor: isCostoExcedido ? 'var(--danger)' : 'var(--success)',
                  borderRadius: '11px',
                  boxShadow: isCostoExcedido ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
                }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
             {isCostoExcedido 
               ? `Exceso de $ ${(realExpenses - theoreticalBudget).toFixed(2)} sobre el presupuesto.`
               : `Restante: $ ${(theoreticalBudget - realExpenses).toFixed(2)} (${(100 - (realExpenses/theoreticalBudget*100)).toFixed(1)}%)`
             }
          </div>

          {project.expenses.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>Últimos 5 Gastos:</div>
              {project.expenses.slice(0, 5).map((exp: any) => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{exp.description}</span>
                  <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>$ {Number(exp.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPARATIVA DE TIEMPO */}
        <div className="card" style={{ minWidth: 0, borderLeft: `4px solid ${isTiempoExcedido ? 'var(--warning)' : 'var(--primary)'}`, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Tiempo: Teórico vs Real
            </h3>
            {isTiempoExcedido && <span style={{ color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>DEMORADO</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Barra Teórica */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Días Estimados (Teórico)</span>
                <span style={{ fontWeight: 'bold' }}>{theoreticalDays} días</span>
              </div>
              <div className="progress-bar" style={{ height: '14px', backgroundColor: 'var(--bg-surface)', borderRadius: '7px' }}>
                <div className="progress-fill" style={{ width: '100%', backgroundColor: 'var(--text-muted)', borderRadius: '7px', opacity: 0.5 }}></div>
              </div>
            </div>

            {/* Barra Real */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: isTiempoExcedido ? 'var(--warning)' : 'var(--text-muted)' }}>Días Transcurridos (Real)</span>
                <span style={{ fontWeight: 'bold', color: isTiempoExcedido ? 'var(--warning)' : 'var(--primary)' }}>{realDays} días</span>
              </div>
              <div className="progress-bar" style={{ height: '22px', backgroundColor: 'var(--bg-surface)', borderRadius: '11px' }}>
                <div className="progress-fill" style={{ 
                  width: `${timeRatio}%`, 
                  backgroundColor: isTiempoExcedido ? 'var(--warning)' : 'var(--primary)',
                  borderRadius: '11px',
                  boxShadow: isTiempoExcedido ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Inicio: {formatDate(project.startDate)}
             </span>
             <span>Progreso: {progressPercent}%</span>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
             <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Fases Completadas</div>
                <div style={{ fontWeight: 'bold' }}>{completedPhases} / {totalPhases}</div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Estado Actual</div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary)', textTransform: 'capitalize' }}>{project.status.toLowerCase()}</div>
             </div>
          </div>
        </div>

        {/* CLIENTE RAPID VIEW */}
        <div className="card" style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Información del Cliente
          </h3>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>{project.client?.name || 'Cliente sin nombre'}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {project.client?.phone || 'Sin teléfono'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.client?.email || 'Sin email'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: '2px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{project.address || project.client?.address || 'Sin dirección'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Fases */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>Fases de Trabajo</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '12px' }}>
              {project.phases.length} Fases
            </span>
          </div>
          <div style={{ padding: '20px' }}>
            {project.phases.map((phase: any, idx: number) => (
              <div key={phase.id} style={{ display: 'flex', gap: '20px', marginBottom: idx === project.phases.length - 1 ? 0 : '30px', position: 'relative' }}>
                {idx !== project.phases.length - 1 && (
                  <div style={{ position: 'absolute', left: '15px', top: '35px', bottom: '-35px', width: '2px', backgroundColor: phase.status === 'COMPLETADA' ? 'var(--success)' : 'var(--border-color)', zIndex: 0 }} />
                )}
                
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  backgroundColor: phase.status === 'COMPLETADA' ? 'var(--success)' : (phase.status === 'EN_PROGRESO' || phase.status === 'ACTIVO' ? 'var(--warning)' : 'var(--bg-surface)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: phase.status === 'PENDIENTE' ? 'var(--text-muted)' : 'var(--bg-deep)'
                }}>
                  {phase.status === 'COMPLETADA' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{idx + 1}</span>
                  )}
                </div>

                <div style={{ flex: 1, backgroundColor: 'var(--bg-surface)', padding: '15px', borderRadius: '8px', border: phase.status === 'EN_PROGRESO' || phase.status === 'ACTIVO' ? '1px solid var(--warning)' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: phase.status === 'COMPLETADA' ? 'var(--success)' : 'var(--text)' }}>
                      {phase.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {phase.status === 'COMPLETADA' ? 'Completada' : phase.status === 'EN_PROGRESO' || phase.status === 'ACTIVO' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </div>
                  {phase.description && <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{phase.description}</p>}
                  {phase.estimatedDays && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {phase.estimatedDays} días est.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Equipo */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Equipo Asignado
              </h3>
              {!isEditingTeam ? (
                <button onClick={() => setIsEditingTeam(true)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>Editar</button>
              ) : (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => setIsEditingTeam(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--text-muted)' }} disabled={isSavingTeam}>Cancelar</button>
                  <button onClick={handleSaveTeam} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }} disabled={isSavingTeam}>{isSavingTeam ? '...' : 'Guardar'}</button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!isEditingTeam ? (
                <>
                  {project.team.map((member: any) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {member.user.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{member.user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.user.phone || 'Sin número'}</div>
                      </div>
                    </div>
                  ))}
                  {project.team.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No hay operadores asignados.</div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {availableOperators.map((op: any) => (
                    <label key={op.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedTeam.includes(op.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTeam([...selectedTeam, op.id])
                          else setSelectedTeam(selectedTeam.filter(id => id !== op.id))
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem' }}>{op.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{op.phone || 'Sin WhatsApp'}</div>
                      </div>
                    </label>
                  ))}
                  {availableOperators.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay operadores registrados en el sistema.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Actividad Reciente
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {project.chatMessages.slice(0, 5).map((msg: any) => (
                <div key={msg.id} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {msg.user.name.substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)' }}>{msg.user.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDateTime(msg.createdAt)}
                      </span>
                    </div>
                    {msg.phase && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '4px' }}>
                        Fase: {msg.phase.title}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '0 8px 8px 8px', marginTop: '2px' }}>
                      {msg.type === 'IMAGE' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            Foto de avance
                          </div>
                          {msg.media && msg.media.length > 0 && (
                            <img 
                              src={msg.media[0].url} 
                              alt="Avance de obra" 
                              style={{ width: '100%', borderRadius: '4px', objectFit: 'cover', maxHeight: '150px' }} 
                            />
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {project.chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px' }}>Sin actividad aún.</div>
              )}
            </div>
            
            {project.chatMessages.length > 5 && (
              <Link href={`/admin/proyectos/${project.id}/bitacora`} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '15px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                Ver Bitácora Completa ({project.chatMessages.length - 5} más)
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
