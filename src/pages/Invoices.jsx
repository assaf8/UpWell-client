import { useEffect, useState } from 'react'
import { Plus, FileText, CheckCircle, Clock, AlertCircle, X, Download, Send, ExternalLink, Settings, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../lib/api'

const VAT_RATE = 0.17
const statusConfig = {
  paid:    { label: 'שולם',    icon: CheckCircle,  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-100'  },
  pending: { label: 'ממתין',   icon: Clock,        color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  overdue: { label: 'באיחור', icon: AlertCircle,  color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-100'    },
}

function LineItemsEditor({ items, onChange }) {
  const add = () => onChange([...items, { description: '', qty: 1, price: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, field, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={item.description} onChange={e => update(i, 'description', e.target.value)}
            placeholder="תיאור פריט"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          <input type="number" value={item.qty} onChange={e => update(i, 'qty', e.target.value)}
            min={1} className="w-14 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          <input type="number" value={item.price} onChange={e => update(i, 'price', e.target.value)}
            placeholder="₪" dir="ltr"
            className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          {items.length > 1 && (
            <button onClick={() => remove(i)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button onClick={add} className="flex items-center gap-1.5 text-xs text-[#00969E] font-semibold hover:bg-[#E6F7F8] px-2 py-1.5 rounded-lg transition-colors">
          <Plus size={12} /> הוסף פריט
        </button>
        <p className="text-xs text-gray-400">כמות × מחיר</p>
      </div>
    </div>
  )
}

function NewInvoiceModal({ clients, onClose, onCreated }) {
  const [form, setForm] = useState({ clientId: '', dueDate: '', description: '', includeVat: true })
  const [lineItems, setLineItems] = useState([{ description: '', qty: 1, price: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = lineItems.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
  const vat = form.includeVat ? Math.round(subtotal * VAT_RATE) : 0
  const total = subtotal + vat

  const save = async () => {
    if (!form.clientId) return setError('בחר לקוח')
    if (subtotal === 0) return setError('הוסף לפחות פריט אחד עם מחיר')
    setLoading(true); setError('')
    try {
      const description = lineItems.filter(i => i.description).map(i => `${i.description} ×${i.qty}`).join(', ')
      const res = await api.post('/invoices', {
        clientId: form.clientId,
        amount: total,
        subtotal,
        vat,
        includeVat: form.includeVat,
        dueDate: form.dueDate,
        description: description || form.description,
        lineItems: lineItems.filter(i => i.description || i.price),
      })
      onCreated(res.data); onClose()
    } catch (e) { setError(e.response?.data?.message || 'שגיאה') } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">חשבונית חדשה</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-5">
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">לקוח *</label>
              <select value={form.clientId} onChange={e => setForm(f => ({...f, clientId: e.target.value}))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                <option value="">בחר לקוח...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">תאריך לתשלום</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} dir="ltr"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors ${form.includeVat ? 'bg-[#00969E]' : 'bg-gray-200'}`}
                  onClick={() => setForm(f => ({...f, includeVat: !f.includeVat}))}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${form.includeVat ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">כולל מע״מ (17%)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">פריטים</label>
            <LineItemsEditor items={lineItems} onChange={setLineItems} />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>סכום לפני מע״מ</span>
              <span dir="ltr">₪{subtotal.toLocaleString()}</span>
            </div>
            {form.includeVat && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>מע״מ (17%)</span>
                <span dir="ltr">₪{vat.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>סה״כ לתשלום</span>
              <span dir="ltr" className="text-[#00969E] text-lg">₪{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={save} disabled={loading || !form.clientId || subtotal === 0}
            className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50">
            {loading ? 'יוצר...' : 'צור חשבונית'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function GreenInvoicePanel() {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('greenInvoiceKey') || '')
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('greenInvoiceKey', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <span className="text-lg">🟢</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">חשבונית ירוקה</p>
            <p className="text-xs text-gray-400">חבר לפלטפורמת החשבוניות שלך</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {localStorage.getItem('greenInvoiceKey') && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">מחובר</span>}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
          <p className="text-sm text-gray-500">
            הזן את ה-API Key שלך מ-<a href="https://www.greeninvoice.co.il" target="_blank" rel="noreferrer" className="text-green-600 underline">חשבונית ירוקה</a> כדי לסנכרן חשבוניות.
          </p>
          <div className="flex gap-2">
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} dir="ltr"
              placeholder="הדבק כאן את ה-API Key"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
            <button onClick={save} disabled={!apiKey}
              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors">
              {saved ? '✓ שמור' : 'שמור'}
            </button>
          </div>
          <a href="https://www.greeninvoice.co.il" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-green-600 hover:underline">
            <ExternalLink size={12} /> פתח חשבונית ירוקה
          </a>
        </div>
      )}
    </div>
  )
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.get('/invoices').then(r => setInvoices(r.data || [])).catch(() => {})
    api.get('/clients').then(r => setClients(r.data.clients || [])).catch(() => {})
  }, [])

  const markPaid = async (id) => {
    await api.put(`/invoices/${id}`, { status: 'paid' })
    setInvoices(prev => prev.map(i => i._id === id ? { ...i, status: 'paid' } : i))
  }

  const downloadPdf = async (inv) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/invoices/${inv._id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `invoice-${inv.invoiceNumber}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  const sendWhatsApp = (inv) => {
    const client = clients.find(c => c._id === (inv.client?._id || inv.client))
    const phone = client?.phone?.replace(/\D/g, '').replace(/^0/, '972')
    const msg = encodeURIComponent(`שלום ${inv.client?.name || ''},\nחשבונית #${inv.invoiceNumber} על סך ₪${inv.amount?.toLocaleString()} ${inv.dueDate ? `- תשלום עד ${new Date(inv.dueDate).toLocaleDateString('he-IL')}` : ''}.\nתודה! 🙏`)
    window.open(`https://wa.me/${phone || ''}?text=${msg}`, '_blank')
  }

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const filtered = statusFilter === 'all' ? invoices : invoices.filter(i => i.status === statusFilter)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showModal && <NewInvoiceModal clients={clients} onClose={() => setShowModal(false)} onCreated={inv => setInvoices(prev => [inv, ...prev])} />}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{invoices.length} חשבוניות סה״כ</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
          <Plus size={16} /> חשבונית חדשה
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'ממתין לתשלום', value: totalPending, color: 'text-yellow-600', bg: 'from-yellow-50 to-orange-50', icon: Clock,        border: 'border-yellow-100' },
          { label: 'התקבל',        value: totalPaid,    color: 'text-green-600',  bg: 'from-green-50 to-emerald-50', icon: CheckCircle,  border: 'border-green-100'  },
          { label: 'באיחור',       value: totalOverdue, color: 'text-red-600',    bg: 'from-red-50 to-rose-50',      icon: AlertCircle,  border: 'border-red-100'    },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><s.icon size={20} className={s.color} /></div>
            <div><p className={`text-2xl font-bold ${s.color}`}>₪{s.value.toLocaleString()}</p><p className="text-sm text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Green Invoice integration */}
      <div className="mb-5">
        <GreenInvoicePanel />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit mb-5">
        {[{ k: 'all', l: 'הכל' }, { k: 'pending', l: 'ממתין' }, { k: 'paid', l: 'שולם' }, { k: 'overdue', l: 'באיחור' }].map(s => (
          <button key={s.k} onClick={() => setStatusFilter(s.k)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s.k ? 'bg-[#00969E] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s.l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-600 mb-1">אין חשבוניות</h3>
            <p className="text-gray-400 text-sm">{statusFilter === 'all' ? 'צור את החשבונית הראשונה שלך' : 'אין חשבוניות בסטטוס זה'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['מספר', 'לקוח', 'תיאור', 'סכום', 'תאריך', 'סטטוס', ''].map(h => (
                    <th key={h} className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => {
                  const sc = statusConfig[inv.status] || statusConfig.pending
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-bold text-gray-900 text-xs">#{inv.invoiceNumber}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#E6F7F8] flex items-center justify-center text-[#00969E] font-bold text-xs">{inv.client?.name?.[0]}</div>
                          <span className="font-medium text-gray-900">{inv.client?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs max-w-32 truncate">{inv.description || '—'}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">₪{inv.amount?.toLocaleString()}</p>
                        {inv.includeVat && inv.vat > 0 && <p className="text-xs text-gray-400">כולל מע״מ ₪{inv.vat?.toLocaleString()}</p>}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('he-IL') : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
                          <sc.icon size={11} />{sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {inv.status !== 'paid' && (
                            <button onClick={() => markPaid(inv._id)} className="text-xs font-semibold text-[#00969E] hover:bg-[#E6F7F8] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">סמן כשולם</button>
                          )}
                          <button onClick={() => sendWhatsApp(inv)} title="שלח ב-WhatsApp"
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                            <Send size={14} />
                          </button>
                          <button onClick={() => downloadPdf(inv)} title="הורד PDF"
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#00969E] hover:bg-[#E6F7F8] rounded-lg transition-colors">
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
