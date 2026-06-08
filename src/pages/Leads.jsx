import { useEffect, useState } from 'react'
import { Plus, Phone, Mail, MessageCircle, Pencil, Trash2, X, ChevronDown, UserPlus, Target, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react'
import api from '../lib/api'

const STATUSES = [
  { key: 'all',        label: 'הכל',        color: 'bg-gray-100 text-gray-700' },
  { key: 'new',        label: '🆕 חדש',      color: 'bg-blue-100 text-blue-700' },
  { key: 'contacted',  label: '📞 נוצר קשר', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'interested', label: '🔥 מעוניין',  color: 'bg-orange-100 text-orange-700' },
  { key: 'converted',  label: '✅ הפך לקוח', color: 'bg-green-100 text-green-700' },
  { key: 'lost',       label: '❌ אבד',       color: 'bg-red-100 text-red-700' },
]

const SOURCES = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'referral',  label: 'המלצה' },
  { key: 'website',   label: 'אתר' },
  { key: 'walk-in',   label: 'ביקור ישיר' },
  { key: 'other',     label: 'אחר' },
]

const STATUS_BADGE = {
  new:        'bg-blue-100 text-blue-700',
  contacted:  'bg-yellow-100 text-yellow-700',
  interested: 'bg-orange-100 text-orange-700',
  converted:  'bg-green-100 text-green-700',
  lost:       'bg-red-100 text-red-700',
}
const STATUS_LABELS = {
  new: '🆕 חדש', contacted: '📞 נוצר קשר', interested: '🔥 מעוניין',
  converted: '✅ הפך לקוח', lost: '❌ אבד',
}

const EMPTY = { name: '', phone: '', email: '', source: 'other', status: 'new', notes: '', nextFollowUp: '' }

function whatsappUrl(phone, name) {
  const clean = phone.replace(/\D/g, '').replace(/^0/, '972')
  const msg = encodeURIComponent(`היי ${name}! 😊 רוצה לשמוע קצת יותר על האימונים שלנו — מתי נוח לך לדבר?`)
  return `https://wa.me/${clean}?text=${msg}`
}

function Modal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || EMPTY)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" dir="rtl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{lead?._id ? 'עריכת ליד' : 'ליד חדש'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">שם מלא *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30 focus:border-[#00969E]"
              placeholder="שם הליד" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">טלפון</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30"
                placeholder="05X-XXXXXXX" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">אימייל</label>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30"
                placeholder="email@..." dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">מקור</label>
              <select value={form.source} onChange={e => set('source', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30">
                {SOURCES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">סטטוס</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30">
                {STATUSES.filter(s => s.key !== 'all').map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">מעקב הבא</label>
            <input type="date" value={form.nextFollowUp ? form.nextFollowUp.slice(0, 10) : ''}
              onChange={e => set('nextFollowUp', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">הערות</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00969E]/30"
              placeholder="הערות, עניין מיוחד..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            ביטול
          </button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#00969E] text-white text-sm font-bold hover:bg-[#007A81] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            שמור
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Leads() {
  const [leads, setLeads]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null) // null | 'new' | lead-object

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/leads')
      setLeads(r.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    if (form._id) {
      await api.put(`/leads/${form._id}`, form)
    } else {
      await api.post('/leads', form)
    }
    setModal(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('למחוק את הליד?')) return
    await api.delete(`/leads/${id}`)
    setLeads(l => l.filter(x => x._id !== id))
  }

  const handleStatusChange = async (lead, status) => {
    await api.put(`/leads/${lead._id}`, { ...lead, status })
    setLeads(ls => ls.map(l => l._id === lead._id ? { ...l, status } : l))
  }

  const filtered = leads.filter(l => {
    const matchTab = activeTab === 'all' || l.status === activeTab
    const matchSearch = !search || l.name.includes(search) || l.phone?.includes(search)
    return matchTab && matchSearch
  })

  // Funnel counts
  const counts = {}
  STATUSES.forEach(s => { counts[s.key] = s.key === 'all' ? leads.length : leads.filter(l => l.status === s.key).length })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target size={22} className="text-[#00969E]" />
            לידים וניהול פניות
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">עקוב אחרי לקוחות פוטנציאליים עד להמרה</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#00969E]/20 transition-all">
          <Plus size={16} /> ליד חדש
        </button>
      </div>

      {/* Funnel stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: 'new',        label: 'חדשים',      icon: UserPlus,    color: 'text-blue-600',   bg: 'bg-blue-50' },
          { key: 'contacted',  label: 'נוצר קשר',   icon: Phone,       color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { key: 'interested', label: 'מעוניינים',  icon: Target,      color: 'text-orange-600', bg: 'bg-orange-50' },
          { key: 'converted',  label: 'הומרו',      icon: CheckCircle2,color: 'text-green-600',  bg: 'bg-green-50' },
          { key: 'lost',       label: 'אבדו',       icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50' },
        ].map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className={`${bg} rounded-2xl p-4 text-center cursor-pointer hover:shadow-md transition-all ${activeTab === key ? 'ring-2 ring-offset-1 ring-[#00969E]' : ''}`}
            onClick={() => setActiveTab(activeTab === key ? 'all' : key)}>
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className={`text-2xl font-black ${color}`}>{counts[key]}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/30"
            placeholder="חפש שם או טלפון..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s.key} onClick={() => setActiveTab(s.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === s.key ? 'bg-[#00969E] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.label} {counts[s.key] > 0 ? `(${counts[s.key]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Leads list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#00969E]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-1">אין לידים עדיין</p>
          <p className="text-sm text-gray-400 mb-4">הוסף את הפניה הראשונה שלך</p>
          <button onClick={() => setModal('new')} className="px-5 py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-bold hover:bg-[#007A81]">
            ➕ הוסף ליד ראשון
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => {
            const followUp = lead.nextFollowUp ? new Date(lead.nextFollowUp) : null
            const isOverdue = followUp && followUp < new Date()
            return (
              <div key={lead._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00969E]/20 to-[#00969E]/10 flex items-center justify-center text-[#00969E] font-black text-lg flex-shrink-0">
                      {lead.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900">{lead.name}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                        {lead.source && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                            {SOURCES.find(s => s.key === lead.source)?.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {lead.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} />{lead.phone}</span>}
                        {lead.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={11} />{lead.email}</span>}
                      </div>
                      {lead.notes && <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">💬 {lead.notes}</p>}
                      {followUp && (
                        <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-500' : 'text-[#00969E]'}`}>
                          {isOverdue ? '⚠️' : '📅'} מעקב: {followUp.toLocaleDateString('he-IL')}
                          {isOverdue ? ' (באיחור!)' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Quick status change */}
                    <div className="relative group">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                        עדכן <ChevronDown size={11} />
                      </button>
                      <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 w-36 hidden group-hover:block">
                        {STATUSES.filter(s => s.key !== 'all' && s.key !== lead.status).map(s => (
                          <button key={s.key} onClick={() => handleStatusChange(lead, s.key)}
                            className="w-full text-right px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700">
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {lead.phone && (
                      <a href={whatsappUrl(lead.phone, lead.name)} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                        title="שלח WhatsApp">
                        <MessageCircle size={14} className="text-white" />
                      </a>
                    )}
                    <button onClick={() => setModal(lead)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                      <Pencil size={13} className="text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(lead._id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal
          lead={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
