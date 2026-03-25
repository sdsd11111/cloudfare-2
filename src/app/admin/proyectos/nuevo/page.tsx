'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProjectUploader, { ProjectFile } from '@/components/ProjectUploader'

export default function NuevoProyectoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Datos Generales
  const [projectData, setProjectData] = useState({
    title: '',
    type: 'INSTALLATION',
    address: '',
    city: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    categoryList: [] as string[],
    otherCategory: '',
    contractTypeList: [] as string[],
    technicalSpecs: {} as any
  })

  const CONTRACT_TYPES = [
    { id: 'INSTALLATION', label: 'Instalación Nueva' },
    { id: 'MAINTENANCE', label: 'Mantenimiento' },
    { id: 'REPAIR', label: 'Reparación' },
    { id: 'OTHER', label: 'Otro' }
  ]

  const CATEGORIES = [
    { id: 'PISCINA', label: 'Piscina' },
    { id: 'JACUZZI', label: 'Jacuzzi' },
    { id: 'BOMBAS', label: 'Sistema de Bombeo' },
    { id: 'TRATAMIENTO', label: 'Tratamiento de Agua' },
    { id: 'RIEGO', label: 'Sistema de Riego' },
    { id: 'CALENTAMIENTO', label: 'Calentamiento' },
    { id: 'CONTRA_INCENDIOS', label: 'Contra Incendios' },
    { id: 'MANTENIMIENTO', label: 'Mantenimiento General' },
    { id: 'OTRO', label: 'Otros' }
  ]

  const SPECS_BY_CATEGORY: any = {
    PISCINA: [
      { id: 'p_dim', label: 'Dimensiones (L x A)', type: 'text', placeholder: 'Ej: 8m x 4m' },
      { id: 'p_vol', label: 'Volumen (Galones)', type: 'number', placeholder: '15000' },
      { id: 'p_acabado', label: 'Tipo de Acabado', type: 'select', options: ['Diamond Brite', 'Azulejo', 'Pintura', 'Liner'] }
    ],
    JACUZZI: [
      { id: 'j_jets', label: 'Número de Jets', type: 'number', placeholder: '6' },
      { id: 'j_calor', label: 'Sistema de Calor', type: 'select', options: ['Gas', 'Bomba de Calor', 'Eléctrico'] }
    ],
    BOMBAS: [
      { id: 'b_potencia', label: 'Potencia (HP)', type: 'text', placeholder: '1.5 HP' },
      { id: 'b_voltaje', label: 'Voltaje', type: 'select', options: ['110V', '220V', 'Trifásico'] },
      { id: 'b_caudal', label: 'Caudal (GPM)', type: 'number', placeholder: '60' }
    ],
    RIEGO: [
      { id: 'r_area', label: 'Área m2', type: 'number', placeholder: '200' },
      { id: 'r_zonas', label: 'Número de Zonas', type: 'number', placeholder: '4' }
    ],
    TRATAMIENTO: [
      { id: 't_filtro', label: 'Tipo de Filtro', type: 'select', options: ['Arena', 'Cartucho', 'Ablandador'] },
      { id: 't_caudal', label: 'Caudal requerido', type: 'text', placeholder: '5 GPM' }
    ]
  }

  const SPECS_BY_CONTRACT: any = {
    INSTALLATION: [
      { id: 'c_inst_desc', label: '¿Qué se va a instalar?', type: 'text', placeholder: 'Ej: Bomba calor hidropónica' },
      { id: 'c_inst_loc', label: 'Ubicación específica', type: 'text', placeholder: 'Ej: Terraza posterior' }
    ],
    MAINTENANCE: [
      { id: 'c_maint_freq', label: 'Frecuencia', type: 'select', options: ['Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Otro'] },
      { id: 'c_maint_last', label: 'Último mantenimiento', type: 'date' }
    ],
    REPAIR: [
      { id: 'c_rep_desc', label: 'Falla reportada', type: 'text', placeholder: 'Ej: Fuga en tubería 2"' },
      { id: 'c_rep_urg', label: 'Urgencia', type: 'select', options: ['Baja', 'Media', 'Crítica'] }
    ]
  }

  // Step 2: Cliente
  const [isNewClient, setIsNewClient] = useState(true)
  const [clientData, setClientData] = useState({
    id: null as string | null,
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: ''
  })
  const [clients, setClients] = useState<any[]>([])

  // Step 3: Fases
  const [phases, setPhases] = useState<any[]>([
    { id: '1', title: 'Fas e Inicial / Planificación', description: '', estimatedDays: 5 }
  ])

  // Step 4: Equipo
  const [availableTeam, setAvailableTeam] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])

  // Step 5: Presupuesto
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [searchMaterial, setSearchMaterial] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customQty, setCustomQty] = useState(1)

  // Step 6+: Files (Persistent)
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([])

  useEffect(() => {
    // Fetch clients
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setClients(data) })
      .catch(console.error)

    // Fetch operators
    fetch('/api/users?role=OPERATOR')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAvailableTeam(data) })
      .catch(console.error)
    // Fetch materials
    fetch('/api/materials')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setMaterials(data) })
      .catch(err => {
        console.error('Error fetching materials:', err)
        setMaterials([])
      })
  }, [])

  const handleNext = () => {
    // Basic validation per step
    if (step === 1 && (projectData.categoryList.length === 0 || projectData.contractTypeList.length === 0)) {
        return setError('Selecciona al menos una categoría y un tipo de contrato.')
    }
    if (step === 2 && !clientData.name) return setError('El nombre del cliente es obligatorio.')
    if (step === 4 && phases.length === 0) return setError('Debes añadir al menos una fase.')
    if (step === 5 && selectedTeam.length === 0) return setError('Debes seleccionar al menos un integrante del equipo.')
    
    setError('')
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(s => s - 1)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')

    try {
      const resp = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          client: clientData,
          phases: phases,
          team: selectedTeam,
          budgetItems: budgetItems,
          categoryList: projectData.categoryList.map(c => c === 'OTRO' ? (projectData.otherCategory || 'OTRO') : c),
          contractTypeList: projectData.contractTypeList,
          technicalSpecs: projectData.technicalSpecs,
          clientId: clientData.id,
          files: uploadedFiles
        })
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'Error al crear proyecto')
      }

      const newProj = await resp.json()
      router.push(`/admin/proyectos/${newProj.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const addPhase = () => {
    const newId = (phases.length + 1).toString()
    setPhases([...phases, { id: newId, title: `Fase ${newId}: Nueva Fase`, description: '', estimatedDays: 0 }])
  }

  const removePhase = (index: number) => {
    const newPhases = [...phases]
    newPhases.splice(index, 1)
    setPhases(newPhases)
  }

  const updatePhase = (index: number, field: string, value: any) => {
    const newPhases = [...phases]
    newPhases[index] = { ...newPhases[index], [field]: value }
    setPhases(newPhases)
  }

  const totalEstimatedDays = phases.reduce((acc, p) => acc + (Number(p.estimatedDays) || 0), 0)

  const toggleCategory = (catId: string) => {
    const current = projectData.categoryList
    if (current.includes(catId)) {
      setProjectData({ ...projectData, categoryList: current.filter(c => c !== catId) })
    } else {
      setProjectData({ ...projectData, categoryList: [...current, catId] })
    }
  }

  const toggleContractType = (typeId: string) => {
    const current = projectData.contractTypeList
    if (current.includes(typeId)) {
      setProjectData({ ...projectData, contractTypeList: current.filter(t => t !== typeId) })
    } else {
      setProjectData({ ...projectData, contractTypeList: [...current, typeId] })
    }
  }

  const updateSpec = (specId: string, value: any) => {
    setProjectData({
      ...projectData,
      technicalSpecs: { ...projectData.technicalSpecs, [specId]: value }
    })
  }

  const toggleTeamMember = (id: string) => {
    if (selectedTeam.includes(id)) {
      setSelectedTeam(selectedTeam.filter(t => t !== id))
    } else {
      setSelectedTeam([...selectedTeam, id])
    }
  }

  const addBudgetItem = (m: any) => {
    const newItem = {
      materialId: m.id,
      name: m.name,
      quantity: 1,
      estimatedCost: Number(m.unitPrice || 0)
    }
    setBudgetItems([...budgetItems, newItem])
    setSearchMaterial('')
  }

  const addCustomBudgetItem = () => {
    const newItem = {
      materialId: null,
      name: customDescription,
      quantity: Number(customQty),
      estimatedCost: Number(customPrice)
    }
    setBudgetItems([...budgetItems, newItem])
    setCustomDescription('')
    setCustomPrice('')
    setCustomQty(1)
  }

  const removeBudgetItem = (index: number) => {
    const newItems = [...budgetItems]
    newItems.splice(index, 1)
    setBudgetItems(newItems)
  }

  const selectExistingClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (id === 'NEW') {
      setIsNewClient(true)
      setClientData({ id: null, name: '', phone: '', email: '', city: '', address: '', notes: '' })
    } else {
      const c = clients.find(c => c.id === id)
      if (c) {
        setIsNewClient(false)
        setClientData({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          city: c.city || '',
          address: c.address || '',
          notes: c.notes || ''
        })
      }
    }
  }

  // Common UI styles
  const inputGroupStyle = { marginBottom: '20px' }
  const labelStyle = { display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem' }

  const filteredMaterials = searchMaterial.trim() === '' ? [] : materials.filter(m => 
    m.name.toLowerCase().includes(searchMaterial.toLowerCase()) || 
    m.category?.toLowerCase().includes(searchMaterial.toLowerCase())
  ).slice(0, 5)

  const totalBudget = budgetItems.reduce((acc, item) => acc + (item.quantity * item.estimatedCost), 0)

  return (
    <div className="p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="dashboard-header mb-6">
        <div>
          <h2>Crear Nuevo Proyecto</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Asistente de configuración paso a paso.</p>
        </div>
      </div>

      {/* Stepper Wizard Component */}
      <div className="card mb-6" style={{ padding: '0', overflow: 'visible' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-deep)' }}>
          {[1, 2, 3, 4, 5, 6].map((num, idx) => (
            <div key={num} style={{
              flex: 1, 
              padding: '15px', 
              textAlign: 'center', 
              borderBottom: step === num ? '3px solid var(--primary)' : '3px solid transparent',
              color: step === num ? 'var(--primary)' : (step > num ? 'var(--success)' : 'var(--text-muted)'),
              fontWeight: step === num ? 'bold' : 'normal',
              cursor: 'default',
              position: 'relative'
            }}>
              <div>Paso {num}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {num === 1 ? 'General' : num === 2 ? 'Cliente' : num === 3 ? 'Especific.' : num === 4 ? 'Fases' : num === 5 ? 'Equipo' : 'Presupuesto'}
              </div>
              {idx < 5 && <div style={{ position: 'absolute', right: 0, top: '20%', height: '60%', width: '1px', backgroundColor: 'var(--border-color)' }} />}
            </div>
          ))}
        </div>

        <div style={{ padding: '30px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
                <div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Título del Proyecto *</label>
                        <input type="text" className="form-input" placeholder="Ej. Instalación de Piscina Residencial" value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} autoFocus />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Fecha de Inicio Prevista</label>
                            <input type="date" className="form-input" value={projectData.startDate} onChange={e => setProjectData({...projectData, startDate: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Ciudad</label>
                            <input type="text" className="form-input" placeholder="Ej. Loja" value={projectData.city} onChange={e => setProjectData({...projectData, city: e.target.value})} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Dirección Física (Opcional)</label>
                            <input type="text" className="form-input" placeholder="Ej. Calle 123" value={projectData.address} onChange={e => setProjectData({...projectData, address: e.target.value})} />
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Tipo de Contrato (Multiselección) *</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {CONTRACT_TYPES.map(ct => {
                                const isSelected = projectData.contractTypeList.includes(ct.id)
                                return (
                                    <div 
                                        key={ct.id} 
                                        onClick={() => toggleContractType(ct.id)}
                                        style={{ 
                                            padding: '8px 16px', 
                                            borderRadius: '20px', 
                                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)', 
                                            backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-deep)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {ct.label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Categorías del Proyecto (Puedes marcar varias) *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        {CATEGORIES.map(cat => {
                            const isSelected = projectData.categoryList.includes(cat.id)
                            return (
                                <div 
                                    key={cat.id} 
                                    onClick={() => toggleCategory(cat.id)}
                                    style={{ 
                                        padding: '12px', 
                                        borderRadius: '8px', 
                                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)', 
                                        backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-deep)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--text)' : 'var(--text-muted)' }}>{cat.label}</span>
                                </div>
                            )
                        })}
                    </div>
                    {projectData.categoryList.includes('OTRO') && (
                        <div style={{ ...inputGroupStyle, marginTop: '15px' }} className="animate-fade-in">
                            <label style={labelStyle}>Especificar otra categoría *</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Ej: Sauna, Fuente Decorativa, etc." 
                                value={projectData.otherCategory} 
                                onChange={e => setProjectData({...projectData, otherCategory: e.target.value})} 
                            />
                        </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Información del Cliente</h3>
              
              <div style={inputGroupStyle}>
                <label style={labelStyle}>¿Cliente Existente o Nuevo?</label>
                <select className="form-input" onChange={selectExistingClient} defaultValue={isNewClient ? 'NEW' : ''}>
                  <option value="NEW">+ Añadir Nuevo Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-deep)' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Nombre/Razón Social *</label>
                  <input type="text" className="form-input" placeholder="Juan Pérez" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} disabled={!isNewClient} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Teléfono</label>
                    <input type="tel" className="form-input" placeholder="+593..." value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} disabled={!isNewClient} />
                  </div>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" className="form-input" placeholder="correo@ejemplo.com" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} disabled={!isNewClient} />
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Notas adicionales</label>
                  <textarea className="form-input" rows={2} placeholder="Cliente preferencial, facturación especial, etc." value={clientData.notes} onChange={e => setClientData({...clientData, notes: e.target.value})} disabled={!isNewClient} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Especificaciones Técnicas</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Proporciona detalles técnicos específicos para las categorías seleccionadas.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {/* Contract Type Specs */}
                {projectData.contractTypeList.map(ctId => {
                  const specs = SPECS_BY_CONTRACT[ctId]
                  if (!specs) return null
                  const ctLabel = CONTRACT_TYPES.find(c => c.id === ctId)?.label
                  
                  return (
                    <div key={ctId} style={{ padding: '20px', backgroundColor: 'var(--primary-glow)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--primary)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Detalle del Contrato ({ctLabel})
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {specs.map((spec: any) => (
                            <div key={spec.id} style={inputGroupStyle}>
                            <label style={labelStyle}>{spec.label}</label>
                            {spec.type === 'select' ? (
                                <select 
                                className="form-input" 
                                value={projectData.technicalSpecs[spec.id] || ''} 
                                onChange={e => updateSpec(spec.id, e.target.value)}
                                >
                                <option value="">Seleccionar...</option>
                                {spec.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input 
                                type={spec.type} 
                                className="form-input" 
                                placeholder={spec.placeholder}
                                value={projectData.technicalSpecs[spec.id] || ''}
                                onChange={e => updateSpec(spec.id, e.target.value)}
                                />
                            )}
                            </div>
                        ))}
                        </div>
                    </div>
                  )
                })}

                {/* Category Specs */}
                {projectData.categoryList.map(catId => {
                  const specs = SPECS_BY_CATEGORY[catId]
                  if (!specs) return null
                  const catLabel = CATEGORIES.find(c => c.id === catId)?.label
                  
                  return (
                    <div key={catId} style={{ padding: '20px', backgroundColor: 'var(--bg-deep)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <h4 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                        {catLabel}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {specs.map((spec: any) => (
                          <div key={spec.id} style={inputGroupStyle}>
                            <label style={labelStyle}>{spec.label}</label>
                            {spec.type === 'select' ? (
                              <select 
                                className="form-input" 
                                value={projectData.technicalSpecs[spec.id] || ''} 
                                onChange={e => updateSpec(spec.id, e.target.value)}
                              >
                                <option value="">Seleccionar...</option>
                                {spec.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input 
                                type={spec.type} 
                                className="form-input" 
                                placeholder={spec.placeholder}
                                value={projectData.technicalSpecs[spec.id] || ''}
                                onChange={e => updateSpec(spec.id, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {projectData.categoryList.filter(c => SPECS_BY_CATEGORY[c]).length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-deep)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  No se requieren especificaciones técnicas adicionales para las categorías seleccionadas.
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>Fases de Trabajo Estimadas</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        Total Estimado: {totalEstimatedDays} días
                    </div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={addPhase}>+ Añadir Fase</button>
                </div>
              </div>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Las fases organizan el trabajo en campo y permiten estructurar la bitácora de los operadores. Podrás añadir más después.</p>

              {phases.map((phase, index) => (
                <div key={phase.id} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', position: 'relative', border: '1px solid var(--border)' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" className="form-input mb-3" placeholder="Título de Fase (Ej. Excavación y Drenaje)" value={phase.title} onChange={e => updatePhase(index, 'title', e.target.value)} />
                    <textarea className="form-input mb-3" rows={2} placeholder="Descripción teórica de los trabajos a realizar..." value={phase.description} onChange={e => updatePhase(index, 'description', e.target.value)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Días estimados para esta fase:</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            style={{ width: '80px' }} 
                            value={phase.estimatedDays} 
                            onChange={e => updatePhase(index, 'estimatedDays', e.target.value)} 
                        />
                    </div>
                  </div>
                  {phases.length > 1 && (
                    <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger)', padding: '5px' }} onClick={() => removePhase(index)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Asignar Equipo Operativo</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Selecciona los operadores que estarán asignados a este proyecto en campo.</p>
              
              {availableTeam.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                  {availableTeam.map(operator => {
                    const isSelected = selectedTeam.includes(operator.id)
                    return (
                      <div 
                        key={operator.id}
                        onClick={() => toggleTeamMember(operator.id)}
                        style={{ 
                          padding: '15px', 
                          border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border-color)', 
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--primary)', fontWeight: 'bold' }}>
                          {operator.name.substring(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, color: 'var(--text)' }}>{operator.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: operator.activeProjectsCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                            {operator.activeProjectsCount} Proyectos Activos
                          </span>
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid var(--border-color)', backgroundColor: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
                  No hay operadores disponibles o activos en el sistema.
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="animate-fade-in" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>Presupuesto Estimado</h3>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>$ {totalBudget.toLocaleString()}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>Añadir Materiales o Servicios</h4>
                  <div style={{ ...inputGroupStyle, position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buscar en catálogo..." 
                      value={searchMaterial} 
                      onChange={e => setSearchMaterial(e.target.value)} 
                    />
                    {filteredMaterials.length > 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        zIndex: 1000, 
                        backgroundColor: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        marginTop: '5px', 
                        boxShadow: 'var(--shadow-lg)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {filteredMaterials.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => addBudgetItem(m)} 
                            style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ fontWeight: '600', color: 'var(--text)' }}>{m.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$ {m.unitPrice} - {m.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.03)' }}>
                    <label style={{ ...labelStyle, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '5px', marginBottom: '15px' }}>Otras partidas / Servicios</label>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Descripción</label>
                      <input type="text" className="form-input" value={customDescription} onChange={e => setCustomDescription(e.target.value)} placeholder="Ej: Mano de obra especializada" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>Precio Unitario ($)</label>
                        <input type="number" className="form-input" value={customPrice} onChange={e => setCustomPrice(e.target.value)} placeholder="0.00" />
                      </div>
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>Cantidad</label>
                        <input type="number" className="form-input" value={customQty} onChange={e => setCustomQty(Number(e.target.value))} />
                      </div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm btn-full" onClick={addCustomBudgetItem} disabled={!customDescription || !customPrice}>
                      + Agregar al Listado
                    </button>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>Resumen del Presupuesto</h4>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ backgroundColor: 'var(--bg-deep)' }}>Item</th>
                          <th style={{ backgroundColor: 'var(--bg-deep)', textAlign: 'center' }}>Cant.</th>
                          <th style={{ backgroundColor: 'var(--bg-deep)', textAlign: 'right' }}>Total</th>
                          <th style={{ backgroundColor: 'var(--bg-deep)' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetItems.length === 0 ? (
                          <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay items en el presupuesto</td></tr>
                        ) : (
                          budgetItems.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.name}</td>
                              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>$ {(item.quantity * item.estimatedCost).toLocaleString()}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button type="button" onClick={() => removeBudgetItem(idx)} style={{ color: 'var(--danger)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}>&times;</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {budgetItems.length > 0 && (
                        <tfoot>
                          <tr>
                            <td colSpan={2} style={{ textAlign: 'right', padding: '15px', fontWeight: 'bold', fontSize: '1rem', backgroundColor: 'var(--bg-deep)' }}>TOTAL ESTIMADO:</td>
                            <td style={{ textAlign: 'right', padding: '15px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)', backgroundColor: 'var(--bg-deep)' }}>$ {totalBudget.toLocaleString()}</td>
                            <td style={{ backgroundColor: 'var(--bg-deep)' }}></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Project Uploader (Shows in all steps) */}
        <div style={{ padding: '0 30px 30px 30px' }}>
          <ProjectUploader 
            files={uploadedFiles} 
            onAddFile={(file) => setUploadedFiles(prev => [...prev, file])}
            onRemoveFile={(url) => setUploadedFiles(prev => prev.filter(f => f.url !== url))}
            title="Archivos Adjuntos del Proyecto"
          />
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between' }}>
          {step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={() => { setError(''); setStep(s => s - 1) }} disabled={loading}>
              &larr; Volver
            </button>
          ) : (
            <Link href="/admin/proyectos" className="btn btn-ghost">Cancelar</Link>
          )}

          {step < 6 ? (
            <button type="button" className="btn btn-primary" onClick={handleNext}>Continuar &rarr;</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Proyecto Completado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
