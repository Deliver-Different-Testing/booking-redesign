import { useState, useRef, useCallback } from 'react'

/* ─── Style tokens ─────────────────────────────────────── */
const s = {
  topBar: { background: 'var(--brand-dark)', color: '#fff', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  searchRow: { background: 'var(--brand-dark)', padding: '0 20px 10px', display: 'flex', gap: 8 } as React.CSSProperties,
  page: { padding: '10px 20px 20px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } as React.CSSProperties,
  card: { background: 'var(--surface-white)', borderRadius: 10, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
  sectionHeader: { fontSize: 10, textTransform: 'uppercase' as const, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 4, fontWeight: 700 },
  field: { marginBottom: 3 } as React.CSSProperties,
  label: { fontSize: 10, color: 'var(--text-secondary)', marginBottom: 1, display: 'block' } as React.CSSProperties,
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } as React.CSSProperties,
  divider: { borderTop: '1px solid var(--border-light)', margin: '6px 0' } as React.CSSProperties,
  strip: { background: 'var(--surface-cream)', textAlign: 'center' as const, padding: '4px 0', fontSize: 11, color: 'var(--text-secondary)', borderRadius: 6 },
  halfRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 } as React.CSSProperties,
}

/* ─── Controlled field ─────────────────────────────────── */
function Field({ label, value, onChange, type, rows, helper }: {
  label: string; value?: string; onChange?: (v: string) => void;
  type?: string; rows?: number; helper?: string
}) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {rows ? <textarea rows={rows} value={value ?? ''} onChange={e => onChange?.(e.target.value)} /> :
        type === 'select' ? <select value={value ?? ''} onChange={e => onChange?.(e.target.value)}><option>{value}</option></select> :
        <input value={value ?? ''} onChange={e => onChange?.(e.target.value)} />}
      {helper && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{helper}</div>}
    </div>
  )
}

/* ─── Data ─────────────────────────────────────────────── */
const serviceOptions = [
  { name: 'DIRECT', desc: '15 minutes', price: 78.89, color: 'var(--warning)' },
  { name: 'Half Hour', desc: '30 minutes', price: 59.17, color: 'var(--success)' },
  { name: '45 Minutes', desc: '45 minutes', price: 39.47, color: 'var(--success)' },
  { name: 'One Hour', desc: '60 minutes', price: 19.70, color: 'var(--success)' },
  { name: '75 Minutes', desc: '75 minutes', price: 18.74, color: 'var(--success)' },
]

const additionalServices = [
  'Tail Lift Required', 'Hand Unload', 'Inside Pickup (Beyond Door)',
  'Pallet Jack Required', 'Stairs (per flight)', 'Wait Time (per 15 min)',
]

/* ─── Voice parser ─────────────────────────────────────── */
function parseVoice(text: string, current: Record<string, string>): Record<string, string> {
  const t = text.toLowerCase()
  const updates: Record<string, string> = { ...current }

  // Pick up from
  const fromMatch = t.match(/(?:pick\s*up|from|collect)\s+(?:from\s+)?(.+?)(?:\s+(?:deliver|to|drop|send)\s|$)/)
  if (fromMatch) updates.pickupAddress = titleCase(fromMatch[1].replace(/,?\s*$/, ''))

  // Deliver to
  const toMatch = t.match(/(?:deliver|to|drop|send)\s+(?:to\s+)?(.+?)(?:\s+(?:one|half|45|75|direct|banana|standard|custom|quantity|weight)\s|$)/)
  if (toMatch) updates.deliveryAddress = titleCase(toMatch[1].replace(/,?\s*$/, ''))

  // Package size
  if (t.includes('banana box')) updates.packageSize = 'Banana Box (53x39x24cm @ 8kg)'
  if (t.includes('satchel')) updates.packageSize = 'Satchel Small'
  if (t.includes('pallet')) updates.packageSize = 'Pallet'

  // Quantity
  const qtyMatch = t.match(/(\d+)\s*(?:box|boxes|item|items|parcel|parcels|package|packages|quantity)/)
  if (qtyMatch) updates.quantity = qtyMatch[1]

  // Weight
  const weightMatch = t.match(/(\d+)\s*(?:kg|kilo|kilos|kilogram)/)
  if (weightMatch) updates.weight = weightMatch[1]

  // Service
  if (t.includes('direct') || t.includes('15 min')) updates.selectedService = '0'
  else if (t.includes('half hour') || t.includes('30 min')) updates.selectedService = '1'
  else if (t.includes('45 min')) updates.selectedService = '2'
  else if (t.includes('one hour') || t.includes('1 hour') || t.includes('60 min')) updates.selectedService = '3'
  else if (t.includes('75 min')) updates.selectedService = '4'

  // Contact
  const contactMatch = t.match(/(?:contact|name)\s+(?:is\s+)?([a-z]+(?:\s+[a-z]+)?)/i)
  if (contactMatch) updates.pickupContactName = titleCase(contactMatch[1])

  // Phone
  const phoneMatch = t.match(/(?:phone|number|call)\s+(?:is\s+)?(\d[\d\s-]{6,})/)
  if (phoneMatch) updates.pickupContactPhone = phoneMatch[1].replace(/\s/g, '')

  // Dangerous goods
  if (t.includes('dangerous')) updates.dangerousGoods = 'true'

  // Ref
  const refMatch = t.match(/(?:ref|reference)\s+(?:a\s+)?(?:is\s+)?(\S+)/)
  if (refMatch) updates.refA = refMatch[1].toUpperCase()

  return updates
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

/* ─── Main App ─────────────────────────────────────────── */
export default function App() {
  // Form state
  const [pickupAddress, setPickupAddress] = useState('123 Queen St, Auckland CBD, Auckland')
  const [pickupExtra, setPickupExtra] = useState('')
  const [pickupContactName, setPickupContactName] = useState('Test User')
  const [pickupContactPhone, setPickupContactPhone] = useState('0211234567')
  const [pickupNotes, setPickupNotes] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('87 Kings Road, Panmure, Auckland, 1072')
  const [deliveryExtra, setDeliveryExtra] = useState('LifeHealthcare Auckland')
  const [deliveryContactName, setDeliveryContactName] = useState('')
  const [deliveryContactPhone, setDeliveryContactPhone] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [packageSize, setPackageSize] = useState('Banana Box (53x39x24cm @ 8kg)')
  const [quantity, setQuantity] = useState('1')
  const [weight, setWeight] = useState('8')
  const [dangerousGoods, setDangerousGoods] = useState(false)
  const [selectedService, setSelectedService] = useState(3)
  const [pickupChips, setPickupChips] = useState<Set<number>>(new Set())
  const [deliveryChips, setDeliveryChips] = useState<Set<number>>(new Set())
  const [pickupServicesOpen, setPickupServicesOpen] = useState(false)
  const [deliveryServicesOpen, setDeliveryServicesOpen] = useState(false)
  const [searchType, setSearchType] = useState<'google' | 'addressbook'>('google')
  const [_reviewed, _setReviewed] = useState(true) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [packageType, setPackageType] = useState<'standard' | 'custom'>('standard')
  const [refA, setRefA] = useState('')
  const [refB, setRefB] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  // removed global servicesExpanded

  // Voice state
  const [voiceText, setVoiceText] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'done' | 'error'>('idle')
  const recognitionRef = useRef<any>(null)

  const applyVoiceUpdates = useCallback((text: string) => {
    const current: Record<string, string> = {
      pickupAddress, deliveryAddress, packageSize, quantity, weight,
      pickupContactName, pickupContactPhone, refA,
      selectedService: String(selectedService),
    }
    const updates = parseVoice(text, current)

    if (updates.pickupAddress !== pickupAddress) setPickupAddress(updates.pickupAddress)
    if (updates.deliveryAddress !== deliveryAddress) setDeliveryAddress(updates.deliveryAddress)
    if (updates.packageSize && updates.packageSize !== packageSize) setPackageSize(updates.packageSize)
    if (updates.quantity && updates.quantity !== quantity) setQuantity(updates.quantity)
    if (updates.weight && updates.weight !== weight) setWeight(updates.weight)
    if (updates.selectedService) setSelectedService(parseInt(updates.selectedService))
    if (updates.pickupContactName && updates.pickupContactName !== pickupContactName) setPickupContactName(updates.pickupContactName)
    if (updates.pickupContactPhone && updates.pickupContactPhone !== pickupContactPhone) setPickupContactPhone(updates.pickupContactPhone)
    if (updates.dangerousGoods === 'true') setDangerousGoods(true)
    if (updates.refA && updates.refA !== refA) setRefA(updates.refA)
  }, [pickupAddress, deliveryAddress, packageSize, quantity, weight, selectedService, pickupContactName, pickupContactPhone, refA])

  const startVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceStatus('error')
      setVoiceText('Speech recognition not supported in this browser. Try Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-NZ'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setListening(true)
      setVoiceStatus('listening')
      setVoiceText('')
    }
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setVoiceText(transcript)
      if (event.results[0].isFinal) {
        setVoiceStatus('processing')
        setTimeout(() => {
          applyVoiceUpdates(transcript)
          setVoiceStatus('done')
          setTimeout(() => setVoiceStatus('idle'), 3000)
        }, 300)
      }
    }
    recognition.onerror = (event: any) => {
      setListening(false)
      setVoiceStatus('error')
      setVoiceText(`Error: ${event.error}. Try again.`)
      setTimeout(() => setVoiceStatus('idle'), 3000)
    }
    recognition.onend = () => setListening(false)
    recognition.start()
  }, [applyVoiceUpdates])

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const toggleChip = (which: 'pickup' | 'delivery', i: number) => {
    const setter = which === 'pickup' ? setPickupChips : setDeliveryChips
    const current = which === 'pickup' ? pickupChips : deliveryChips
    const n = new Set(current)
    n.has(i) ? n.delete(i) : n.add(i)
    setter(n)
  }

  const base = import.meta.env.BASE_URL

  return (
    <div>
      {/* Top Bar */}
      <div style={s.topBar}>
        <div style={s.logo}>
          <img src={`${base}dfrnt-atom.png`} alt="DFRNT" style={{ height: 28 }} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>DFRNT</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>Booking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#ccc', fontSize: 12 }}>Booking as <strong>TEST001</strong> • Test Company Ltd</span>
          <a href="#" style={{ color: 'var(--brand-cyan)', fontSize: 12 }}>Reset</a>
        </div>
      </div>

      {/* Voice Strip */}
      <div style={{
        background: voiceStatus === 'listening' ? 'rgba(59,199,244,0.08)' : voiceStatus === 'done' ? 'rgba(19,185,100,0.08)' : 'var(--surface-cream)',
        padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--border-light)',
        transition: 'background 0.3s ease',
      }}>
        <button onClick={listening ? stopVoice : startVoice}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: listening ? 'var(--error)' : 'var(--brand-cyan)',
            color: '#fff', fontSize: 16, flexShrink: 0,
            boxShadow: listening ? '0 0 0 4px rgba(220,50,70,0.2)' : 'none',
            animation: listening ? 'pulse 1.5s infinite' : 'none',
          }}>
          {listening ? '⏹' : '🎤'}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {voiceStatus === 'idle' && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              🎤 Say something like <em>"Pick up from Queen Street, deliver to Panmure, banana box, one hour service"</em>
            </div>
          )}
          {voiceStatus === 'listening' && (
            <div style={{ fontSize: 13, color: 'var(--brand-cyan)', fontWeight: 700 }}>
              🔴 Listening... {voiceText && <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{voiceText}</span>}
            </div>
          )}
          {voiceStatus === 'processing' && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              ⏳ Processing: "{voiceText}"
            </div>
          )}
          {voiceStatus === 'done' && (
            <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>
              ✅ Fields updated from: "{voiceText}"
            </div>
          )}
          {voiceStatus === 'error' && (
            <div style={{ fontSize: 13, color: 'var(--error)' }}>
              ⚠️ {voiceText}
            </div>
          )}
        </div>
        {voiceStatus !== 'idle' && voiceStatus !== 'listening' && (
          <button onClick={() => { setVoiceStatus('idle'); setVoiceText('') }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        )}
      </div>

      {/* Search Bar */}
      <div style={s.searchRow}>
        <input placeholder="Search saved bookings..." style={{ flex: 1, height: 34, borderRadius: 8, border: 'none', padding: '0 12px', fontSize: 13 }} />
        <button style={{ background: 'var(--brand-cyan)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 34, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
      </div>

      <div className="booking-page">
        <div className="booking-grid">
          {/* ─── PICKUP CARD ─── */}
          <div className="pickup-card" style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>From: Test Company Ltd</span>
              <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>🗑</span>
            </div>
            <Field label="Address" value={pickupAddress} onChange={setPickupAddress} />
            <Field label="Extra From Info" value={pickupExtra} onChange={setPickupExtra} />
            <div style={s.halfRow}>
              <Field label="Pickup Contact Name" value={pickupContactName} onChange={setPickupContactName} />
              <Field label="Pickup Contact Phone" value={pickupContactPhone} onChange={setPickupContactPhone} />
            </div>
            <Field label="Pickup Notes" value={pickupNotes} onChange={setPickupNotes} rows={2} />

            {/* Pickup Accessorials */}
            <div style={{ position: 'relative', marginTop: 4 }}>
              <button onClick={() => setPickupServicesOpen(!pickupServicesOpen)}
                style={{
                  position: 'absolute', bottom: pickupServicesOpen ? undefined : 0, right: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                  border: pickupChips.size > 0 ? '1px solid var(--brand-cyan)' : '1px solid var(--border)',
                  background: pickupChips.size > 0 ? 'rgba(59,199,244,0.08)' : 'var(--surface-cream)',
                  color: pickupChips.size > 0 ? 'var(--brand-cyan)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 11, transition: 'all 0.15s',
                  ...(pickupServicesOpen ? { position: 'relative', width: '100%', justifyContent: 'space-between' } : {}),
                }}>
                <span>
                  + Services
                  {pickupChips.size > 0 && (
                    <span style={{ marginLeft: 6, background: 'var(--brand-cyan)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>
                      {pickupChips.size}
                    </span>
                  )}
                </span>
                {pickupServicesOpen && <span style={{ fontSize: 10, transform: 'rotate(180deg)' }}>▼</span>}
              </button>
              <div style={{
                maxHeight: pickupServicesOpen ? 200 : 0, overflow: 'hidden',
                transition: 'max-height 0.3s ease, padding 0.3s ease',
                background: 'var(--surface-cream)', borderRadius: '0 0 10px 10px',
                padding: pickupServicesOpen ? '8px 10px 8px' : '0 10px',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {additionalServices.map((svc, i) => (
                    <button key={i} onClick={() => toggleChip('pickup', i)}
                      style={{
                        padding: '4px 10px', borderRadius: 16, fontSize: 10, fontWeight: 700,
                        cursor: 'pointer', transition: 'all .15s',
                        border: pickupChips.has(i) ? '1px solid var(--brand-cyan)' : '1px solid var(--border)',
                        background: pickupChips.has(i) ? 'var(--brand-cyan)' : 'var(--surface-white)',
                        color: pickupChips.has(i) ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {pickupChips.has(i) ? '✓ ' : ''}{svc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── DELIVERY CARD ─── */}
          <div className="delivery-card" style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>To:</span>
              <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>⇄</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="searchType" checked={searchType === 'google'} onChange={() => setSearchType('google')} /> Google
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="radio" name="searchType" checked={searchType === 'addressbook'} onChange={() => setSearchType('addressbook')} /> Address Book
              </label>
            </div>
            <Field label="Address" value={deliveryAddress} onChange={setDeliveryAddress} />
            <Field label="Extra To Info" value={deliveryExtra} onChange={setDeliveryExtra} />
            <div style={s.halfRow}>
              <Field label="Delivery Contact Name" value={deliveryContactName} onChange={setDeliveryContactName} />
              <Field label="Delivery Contact Phone" value={deliveryContactPhone} onChange={setDeliveryContactPhone} />
            </div>
            <Field label="Delivery Notes" value={deliveryNotes} onChange={setDeliveryNotes} rows={2} />

            {/* Delivery Accessorials */}
            <div style={{ position: 'relative', marginTop: 4 }}>
              <button onClick={() => setDeliveryServicesOpen(!deliveryServicesOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                  border: deliveryChips.size > 0 ? '1px solid var(--brand-cyan)' : '1px solid var(--border)',
                  background: deliveryChips.size > 0 ? 'rgba(59,199,244,0.08)' : 'var(--surface-cream)',
                  color: deliveryChips.size > 0 ? 'var(--brand-cyan)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 11, transition: 'all 0.15s',
                  ...(deliveryServicesOpen ? { width: '100%', justifyContent: 'space-between' } : { marginLeft: 'auto' }),
                }}>
                <span>
                  + Services
                  {deliveryChips.size > 0 && (
                    <span style={{ marginLeft: 6, background: 'var(--brand-cyan)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>
                      {deliveryChips.size}
                    </span>
                  )}
                </span>
                {deliveryServicesOpen && <span style={{ fontSize: 10, transform: 'rotate(180deg)' }}>▼</span>}
              </button>
              <div style={{
                maxHeight: deliveryServicesOpen ? 200 : 0, overflow: 'hidden',
                transition: 'max-height 0.3s ease, padding 0.3s ease',
                background: 'var(--surface-cream)', borderRadius: '0 0 10px 10px',
                padding: deliveryServicesOpen ? '8px 10px 8px' : '0 10px',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {additionalServices.map((svc, i) => (
                    <button key={i} onClick={() => toggleChip('delivery', i)}
                      style={{
                        padding: '4px 10px', borderRadius: 16, fontSize: 10, fontWeight: 700,
                        cursor: 'pointer', transition: 'all .15s',
                        border: deliveryChips.has(i) ? '1px solid var(--brand-cyan)' : '1px solid var(--border)',
                        background: deliveryChips.has(i) ? 'var(--brand-cyan)' : 'var(--surface-white)',
                        color: deliveryChips.has(i) ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {deliveryChips.has(i) ? '✓ ' : ''}{svc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ─── ROUTE STRIP ─── */}
          <div className="route-strip" style={s.strip}>📍 Queen St CBD → Kings Rd, Panmure • 12.4km • ~18 min</div>

          {/* ─── PACKAGE CARD ─── */}
          <div className="package-card" style={s.card}>
            <div style={s.sectionHeader}>PACKAGE</div>
            <Field label="Vehicle" value="Car/Van" type="select" />
            <div style={{ display: 'flex', marginBottom: 8, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {['Standard', 'Custom'].map(t => (
                <button key={t} onClick={() => setPackageType(t.toLowerCase() as any)}
                  style={{ flex: 1, padding: '6px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                    background: packageType === t.toLowerCase() ? 'var(--brand-cyan)' : 'var(--surface-cream)',
                    color: packageType === t.toLowerCase() ? '#fff' : 'var(--text-secondary)' }}>
                  {t}
                </button>
              ))}
            </div>
            <Field label="Package Size" value={packageSize} onChange={setPackageSize} type="select" />
            <div style={s.halfRow}>
              <Field label="Quantity" value={quantity} onChange={setQuantity} />
              <Field label="Total Weight (kg)" value={weight} onChange={setWeight} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={dangerousGoods} onChange={() => setDangerousGoods(!dangerousGoods)} /> Dangerous Goods
            </label>

            <div style={s.divider} />
            <Field label="Tracking Method" value="Web Site" type="select" />
            <Field label="Leave my Parcel" value="Currently Signature Required" type="select" />
          </div>

          {/* ─── SERVICE PANEL (right column on wide) ─── */}
          <div className="service-panel" style={s.card}>
            <div style={s.sectionHeader}>SERVICE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {serviceOptions.map((svc, i) => (
                <div key={i} onClick={() => setSelectedService(i)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: 8,
                    cursor: 'pointer', transition: 'all .15s',
                    border: selectedService === i ? `2px solid ${svc.color}` : '1px solid var(--border-light)',
                    background: selectedService === i ? 'var(--surface-cream)' : 'var(--surface-white)',
                  }}>
                  <div style={{ width: 4, height: 28, borderRadius: 2, background: svc.color, marginRight: 10, flexShrink: 0 }} />
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedService === i ? svc.color : 'var(--border)'}`, marginRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selectedService === i && <div style={{ width: 8, height: 8, borderRadius: '50%', background: svc.color }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{svc.desc}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>NZ${svc.price.toFixed(2)}</div>
                </div>
              ))}
              {selectedService !== -1 && (
                <div style={{ background: 'var(--surface-cream)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Base Rate</span><span>NZ${(serviceOptions[selectedService].price * 0.8).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Fuel Surcharge</span><span>NZ${(serviceOptions[selectedService].price * 0.1).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>GST (15%)</span><span>NZ${(serviceOptions[selectedService].price * 0.1).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-light)', paddingTop: 4, marginTop: 2 }}><span>Total</span><span>NZ${serviceOptions[selectedService].price.toFixed(2)}</span></div>
                </div>
              )}
            </div>

          </div>

          {/* ─── REFERENCES CARD (below delivery on wide) ─── */}
          <div className="refs-card" style={s.card}>
            <div style={s.sectionHeader}>REFERENCES</div>
            <Field label="Client Ref A - Cost Centre" value={refA} onChange={setRefA} />
            <Field label="Client Ref B" value={refB} onChange={setRefB} />
            <Field label="Client Notes" value={clientNotes} onChange={setClientNotes} rows={2} helper="Notes entered here are for your reference only" />
            <div style={s.divider} />
            <Field label="Date + Time" value="Ready Now / Deliver ASAP" type="select" />
          </div>
        </div>

        {/* Book Button */}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button style={{ background: 'var(--brand-cyan)', color: '#fff', border: 'none', borderRadius: 24, height: 48, minWidth: 200, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-cyan-glow)' }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,199,244,0.5)')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = 'var(--shadow-cyan-glow)')}>
            🚀 Book Job
          </button>
        </div>
      </div>

      {/* Pulse animation for mic button */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220,50,70,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220,50,70,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,50,70,0); }
        }
      `}</style>
    </div>
  )
}
