'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getLocalNow, formatForDateTimeInput, forceEcuadorTZ } from '@/lib/date-utils'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  initialData?: any
  userId: number
  projects: any[]
  operators?: any[]
  isAdminView?: boolean
}

type AssignMode = 'UNO' | 'VARIOS' | 'TODOS'

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  userId,
  projects,
  operators = [],
  isAdminView = false
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<number[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredProjects, setFilteredProjects] = useState<any[]>(projects)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    projectId: '',
    userId: userId > 0 ? userId.toString() : '',
    status: 'PENDIENTE'
  })

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setLoading(false)
      setIsDropdownOpen(false)
      if (initialData) {
        setSelectedOperatorIds(initialData.userId ? [initialData.userId] : [])
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          startTime: formatForDateTimeInput(initialData.startTime),
          endTime: formatForDateTimeInput(initialData.endTime),
          projectId: initialData.projectId?.toString() || '',
          userId: initialData.userId?.toString() || (userId > 0 ? userId.toString() : ''),
          status: initialData.status || 'PENDIENTE'
        })
      } else {
        const now = getLocalNow()
        now.setMinutes(0)
        const inOneHour = new Date(now)
        inOneHour.setHours(now.getHours() + 1)

        setSelectedOperatorIds([])
        setFormData({
          title: '',
          description: '',
          startTime: formatForDateTimeInput(now),
          endTime: formatForDateTimeInput(inOneHour),
          projectId: '',
          userId: userId > 0 ? userId.toString() : '',
          status: 'PENDIENTE'
        })
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialData, userId])

  // Fetch projects filtered by selected operators
  useEffect(() => {
    const fetchFilteredProjects = async () => {
      let targetIds = selectedOperatorIds

      if (targetIds.length === 0) {
        setFilteredProjects(projects) // No filter, show all
        return
      }

      try {
        const res = await fetch(`/api/admin/calendar/projects-by-operators?operatorIds=${targetIds.join(',')}`)
        if (res.ok) {
          const data = await res.json()
          setFilteredProjects(data)
        } else {
          setFilteredProjects(projects)
        }
      } catch {
        setFilteredProjects(projects) // fallback
      }
    }

    if (isAdminView && isOpen) {
      fetchFilteredProjects()
    }
  }, [selectedOperatorIds, isAdminView, isOpen])

  if (!isOpen || !mounted) return null
  const body = document.body

  const toggleOperator = (id: number) => {
    setSelectedOperatorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAllOperators = () => {
    if (selectedOperatorIds.length === operators.length) {
      setSelectedOperatorIds([])
    } else {
      setSelectedOperatorIds(operators.map(op => op.id))
    }
  }

  const getTargetUserIds = (): number[] => {
    return selectedOperatorIds
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que fin > inicio
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    
    if (end <= start) {
      alert('Error: La fecha de fin debe ser posterior a la fecha de inicio.')
      return
    }

    const targetUserIds = getTargetUserIds()
    if (targetUserIds.length === 0) {
      alert('Debes seleccionar al menos un operador.')
      return
    }

    setLoading(true)
    try {
      if (initialData?.id) {
        // Editing — single save
        await onSave({
          ...formData,
          startTime: forceEcuadorTZ(formData.startTime),
          endTime: forceEcuadorTZ(formData.endTime),
          userId: Number(formData.userId),
          id: initialData.id
        })
      } else {
        // Creating — send all target user IDs  
        await onSave({
          ...formData,
          startTime: forceEcuadorTZ(formData.startTime),
          endTime: forceEcuadorTZ(formData.endTime),
          userIds: targetUserIds,
          userId: targetUserIds[0], // fallback for single
        })
      }
      onClose()
    } catch (error) {
      alert('Error al guardar el agendamiento')
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!initialData?.id

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container card">
        <div className="modal-header card-header" style={{ flexShrink: 0 }}>
          <h3 className="card-title">{isEditing ? 'Editar Agendamiento' : 'Nuevo Agendamiento'}</h3>
          <button className="btn btn-ghost" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-scroll">
            <div className="modal-grid">
              <div className="modal-col">
                <div className="form-group">
                  <label className="form-label">Título de la Actividad</label>
                  <input 
                    className="form-input"
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Mantenimiento Preventivo"
                  />
                </div>

                {isAdminView && (
                  <div className="form-group">
                    <label className="form-label">Asignar a Operador</label>
                    <div style={{ position: 'relative' }}>
                      <div 
                        className={`form-select ${isEditing ? 'disabled' : ''}`} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isEditing ? 'not-allowed' : 'pointer' }}
                        onClick={() => !isEditing && setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span style={{ fontSize: '0.85rem' }}>
                          {selectedOperatorIds.length === 0 
                            ? 'Seleccionar operador...' 
                            : selectedOperatorIds.length === operators.length 
                              ? 'Todos los operadores seleccionados'
                              : `${selectedOperatorIds.length} operador${selectedOperatorIds.length > 1 ? 'es' : ''} seleccionado${selectedOperatorIds.length > 1 ? 's' : ''}`
                          }
                        </span>
                        <span style={{ fontSize: '0.7rem' }}>▼</span>
                      </div>

                      {isDropdownOpen && !isEditing && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-active)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-md)',
                          zIndex: 10,
                          maxHeight: '350px',
                          overflowY: 'auto'
                        }}>
                          <label className={`assign-multi-item ${selectedOperatorIds.length === operators.length ? 'checked' : ''}`} style={{ borderBottom: '1px solid var(--border)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                            <input
                              type="checkbox"
                              checked={selectedOperatorIds.length === operators.length}
                              onChange={() => {
                                toggleAllOperators()
                                setFormData(prev => ({ ...prev, projectId: '' }))
                              }}
                            />
                            <span className="assign-multi-name" style={{ fontWeight: 700 }}>TODOS</span>
                          </label>

                          <div style={{ padding: '4px' }}>
                            {operators.map(op => (
                              <label key={op.id} className={`assign-multi-item ${selectedOperatorIds.includes(op.id) ? 'checked' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={selectedOperatorIds.includes(op.id)}
                                  onChange={() => {
                                    toggleOperator(op.id)
                                    setFormData(prev => ({ ...prev, projectId: '' }))
                                  }}
                                />
                                <span className="assign-multi-name">{op.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Proyecto Relacionado (Opcional)</label>
                  <select 
                    className="form-select"
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                  >
                    <option value="">No vinculado a proyecto</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.status === 'LEAD' ? 'Negociando' : p.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-col">
                <div className="datetime-row">
                  <div className="form-group">
                    <label className="form-label">Inicio</label>
                    <input 
                      className="form-input"
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fin</label>
                    <input 
                      className="form-input"
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select 
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notas / Instrucciones</label>
                  <textarea 
                    className="form-textarea modal-textarea"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Detalles adicionales para el operador..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ flexShrink: 0 }}>
            {initialData?.id && onDelete && (
              <button 
                type="button" 
                className="btn modal-btn" 
                style={{ backgroundColor: 'var(--status-danger)', color: 'white' }} 
                onClick={async () => {
                  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
                    setLoading(true);
                    try { 
                      onDelete(initialData.id); 
                      onClose(); 
                    } catch (error) { 
                      alert('Error eliminando'); 
                      setLoading(false); 
                    }
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
            <button type="button" className="btn btn-secondary modal-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary modal-btn" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20000000;
          padding: 24px;
        }

        .modal-container {
          width: 100%;
          max-width: 960px;
          height: auto;
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border-active);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-header {
          flex-shrink: 0;
          border-bottom: 1px solid var(--border);
          padding: var(--space-md) var(--space-lg);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .modal-scroll {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: var(--space-lg);
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .modal-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .modal-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .datetime-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm);
        }

        .modal-footer {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          background: var(--bg-card);
        }

        .modal-btn {
          flex: 1;
          min-width: 0;
        }

        .assign-multi-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .assign-multi-item:hover {
          background: var(--bg-surface);
        }
        .assign-multi-item.checked {
          background: var(--primary-glow);
        }
        .assign-multi-item input[type="checkbox"] {
          accent-color: var(--primary);
          width: 16px;
          height: 16px;
        }
        .assign-multi-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
            z-index: 20000000 !important;
            background: var(--bg-body);
            display: block;
          }
          .modal-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0;
            border: none;
            position: fixed;
            top: 0;
            left: 0;
          }
          .modal-scroll {
            padding: var(--space-md);
          }
          .modal-grid {
            grid-template-columns: 1fr;
            gap: var(--space-sm);
          }
          .modal-footer {
            padding: var(--space-md);
            padding-bottom: max(var(--space-md), env(safe-area-inset-bottom));
            flex-direction: row; /* Default mobile horizontal */
            gap: 10px;
          }
          .modal-header {
             padding: 12px 16px;
          }
          .modal-header h3 {
             font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .modal-footer {
            flex-direction: column; /* Stack on very small screens */
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
