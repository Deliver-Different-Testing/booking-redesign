import { useState } from 'react'

const s = {
  topBar: { background: 'var(--brand-dark)', color: '#fff', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  searchRow: { background: 'var(--brand-dark)', padding: '0 20px 10px', display: 'flex', gap: 8 } as React.CSSProperties,
  page: { padding: '10px 20px 20px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } as React.CSSProperties,
  card: { background: 'var(--surface-white)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' } as React.CSSProperties,
  sectionHeader: { fontSize: 11, textTransform: 'uppercase' as const, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 700 },
  field: { marginBottom: 6 } as React.CSSProperties,
  label: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, display: 'block' } as React.CSSProperties,
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } as React.CSSProperties,
  divider: { borderTop: '1px solid var(--border-light)', margin: '10px 0' } as React.CSSProperties,
  strip: { background: 'var(--surface-cream)', textAlign: 'center' as const, padding: '6px 0', fontSize: 12, color: 'var(--text-secondary)', margin: '10px 0', borderRadius: 8 },
  halfRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } as React.CSSProperties,
}

function Field({ label, value, type, rows, helper }: { label: string; value?: string; type?: string; rows?: number; helper?: string }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {rows ? <textarea rows={rows} defaultValue={value} /> :
        type === 'select' ? <select><option>{value}</option></select> :
        <input defaultValue={value} />}
      {helper && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{helper}</div>}
    </div>
  )
}

const services = [
  { name: 'DIRECT', desc: '15 minutes', price: 78.89, color: 'var(--warning)' },
  { name: 'Half Hour', desc: '30 minutes', price: 59.17, color: 'var(--success)' },
  { name: '45 Minutes', desc: '45 minutes', price: 39.47, color: 'var(--success)' },
  { name: 'One Hour', desc: '60 minutes', price: 19.70, color: 'var(--success)' },
  { name: '75 Minutes', desc: '75 minutes', price: 18.74, color: 'var(--success)' },
]

const additionalServices = ['Tail Lift Required', 'Hand Unload', 'Inside Pickup', 'Pallet Jack Required', 'Stairs (per flight)', 'Wait Time (per 15 min)']

export default function App() {
  const [selectedService, setSelectedService] = useState(3)
  const [selectedChips, setSelectedChips] = useState<Set<number>>(new Set())
  const [searchType, setSearchType] = useState<'google' | 'addressbook'>('google')
  const [reviewed, setReviewed] = useState(true)
  const [dangerousGoods, setDangerousGoods] = useState(false)
  const [packageType, setPackageType] = useState<'standard' | 'custom'>('standard')

  const toggleChip = (i: number) => {
    const n = new Set(selectedChips)
    n.has(i) ? n.delete(i) : n.add(i)
    setSelectedChips(n)
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

      {/* Search Bar */}
      <div style={s.searchRow}>
        <input placeholder="Search saved bookings..." style={{ flex: 1, height: 34, borderRadius: 8, border: 'none', padding: '0 12px', fontSize: 13 }} />
        <button style={{ background: 'var(--brand-cyan)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 34, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
      </div>

      <div style={s.page}>
        {/* Row 1: Pickup + Delivery */}
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>From: Test Company Ltd</span>
              <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>🗑</span>
            </div>
            <Field label="Address" value="123 Queen St, Auckland CBD, Auckland" />
            <Field label="Extra From Info" />
            <div style={s.halfRow}>
              <Field label="Pickup Contact Name" value="Test User" />
              <Field label="Pickup Contact Phone" value="0211234567" />
            </div>
            <Field label="Pickup Notes" rows={2} />
          </div>

          <div style={s.card}>
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
            <Field label="Address" value="87 Kings Road, Panmure, Auckland, 1072" />
            <Field label="Extra To Info" value="LifeHealthcare Auckland" />
            <div style={s.halfRow}>
              <Field label="Delivery Contact Name" />
              <Field label="Delivery Contact Phone" />
            </div>
            <Field label="Delivery Notes" rows={2} />
          </div>
        </div>

        {/* Route Strip */}
        <div style={s.strip}>📍 Queen St CBD → Kings Rd, Panmure • 12.4km • ~18 min</div>

        {/* Row 2: Package + Service */}
        <div style={s.grid}>
          {/* Package + Services */}
          <div style={s.card}>
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
            <Field label="Package Size" value="Banana Box (53x39x24cm @ 8kg)" type="select" />
            <div style={s.halfRow}>
              <Field label="Quantity" value="1" />
              <Field label="Total Weight (kg)" value="8" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={dangerousGoods} onChange={() => setDangerousGoods(!dangerousGoods)} /> Dangerous Goods
            </label>

            <div style={s.divider} />
            <div style={s.sectionHeader}>ADDITIONAL SERVICES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {additionalServices.map((svc, i) => (
                <button key={i} onClick={() => toggleChip(i)}
                  style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
                    border: selectedChips.has(i) ? '1px solid var(--brand-cyan)' : '1px solid var(--border)',
                    background: selectedChips.has(i) ? 'var(--brand-cyan)' : 'var(--surface-cream)',
                    color: selectedChips.has(i) ? '#fff' : 'var(--text-secondary)' }}>
                  {svc}
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', marginBottom: 6 }}>
              <input type="checkbox" checked={reviewed} onChange={() => setReviewed(!reviewed)} /> I have reviewed pickup additional services
            </label>

            <div style={s.divider} />
            <Field label="Tracking Method" value="Web Site" type="select" />
            <Field label="Leave my Parcel" value="Currently Signature Required" type="select" />
          </div>

          {/* Service Options + References */}
          <div style={s.card}>
            <div style={s.sectionHeader}>SERVICE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {services.map((svc, i) => (
                <div key={i} onClick={() => setSelectedService(i)}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                    border: selectedService === i ? `2px solid ${svc.color}` : '1px solid var(--border-light)',
                    background: selectedService === i ? 'var(--surface-cream)' : 'var(--surface-white)' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Base Rate</span><span>NZ${(services[selectedService].price * 0.8).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Fuel Surcharge</span><span>NZ${(services[selectedService].price * 0.1).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>GST (15%)</span><span>NZ${(services[selectedService].price * 0.1).toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-light)', paddingTop: 4, marginTop: 2 }}><span>Total</span><span>NZ${services[selectedService].price.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            <div style={s.divider} />
            <Field label="Date + Time" value="Ready Now / Deliver ASAP" type="select" />

            <div style={s.divider} />
            <div style={s.sectionHeader}>REFERENCES</div>
            <Field label="Client Ref A - Cost Centre" />
            <Field label="Client Ref B" />
            <Field label="Client Notes" rows={2} helper="Notes entered here are for your reference only" />
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
    </div>
  )
}
