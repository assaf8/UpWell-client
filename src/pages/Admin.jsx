import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, Dumbbell, Calendar, TrendingUp, Trash2, X, ChevronLeft, LogOut, Search, Mail, Phone, CreditCard, CheckCircle, AlertCircle, Clock, ShieldOff, Edit2, Save, DollarSign, Receipt, ExternalLink } from 'lucide-react'
import api from '../lib/api'

const MONTHS = ['ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ']

const PLAN_META = {
  starter: { label: 'Starter', price: '₪49/חו׳', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  pro:     { label: 'Pro',     price: '₪199/חו׳', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  studio:  { label: 'Studio',  price: '₪349/חו׳', color: 'bg-amber-50 text-amber-600 border-amber-100' },
}

const STATUS_META = {
  trial:    { label: 'ניסיון',   color: 'bg-blue-50 text-blue-600',   icon: Clock },
  active:   { label: 'פעיל',     color: 'bg-green-50 text-green-600', icon: CheckCircle },
  past_due: { label: 'חוב',      color: 'bg-red-50 text-red-600',     icon: AlertCircle },
  cancelled:{ label: 'בוטל',     color: 'bg-gray-100 text-gray-500',  icon: X },
  blocked:  { label: 'חסום',     color: 'bg-red-100 text-red-700',    icon: ShieldOff },
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function TrainerModal({ trainerId, onClose, onDelete }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    api.get(`/admin/trainers/${trainerId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [trainerId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/trainers/${trainerId}`)
      onDelete(trainerId)
      onClose()
    } catch {}
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">פרטי מאמן</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <X size={15} />
          </button>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <p className="p-8 text-center text-gray-400">לא נמצא</p>
        ) : (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00969E] to-[#007A81] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#00969E]/20">
                {data.trainer.businessName?.[0]?.toUpperCase() || data.trainer.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{data.trainer.businessName || '—'}</p>
                <p className="text-sm text-gray-500">{data.trainer.email}</p>
                {data.trainer.phone && <p className="text-xs text-gray-400 mt-0.5">{data.trainer.phone}</p>}
              </div>
              <div className="mr-auto text-right">
                <p className="text-xs text-gray-400">הצטרף</p>
                <p className="text-sm font-semibold text-gray-700">{new Date(data.trainer.createdAt).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'לקוחות', value: data.clients.length, color: 'text-[#00969E]' },
                { label: 'אימונים', value: data.sessions.length, color: 'text-purple-600' },
                { label: 'מתאמנים', value: data.clients.length, color: 'text-green-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {data.clients.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-2">לקוחות ({data.clients.length})</h3>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {data.clients.map(c => (
                    <div key={c._id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl text-sm">
                      <div className="w-7 h-7 rounded-lg bg-[#00969E]/10 flex items-center justify-center text-[#00969E] font-bold text-xs flex-shrink-0">{c.name[0]}</div>
                      <span className="font-medium text-gray-800 flex-1">{c.name}</span>
                      {c.email && <span className="text-xs text-gray-400 truncate">{c.email}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.sessions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-2">אימונים אחרונים</h3>
                <div className="space-y-1.5">
                  {data.sessions.slice(0,5).map(s => (
                    <div key={s._id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl text-sm">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-purple-500">{MONTHS[new Date(s.date).getMonth()]}</span>
                        <span className="text-sm font-black text-purple-700 leading-none">{new Date(s.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.client?.name}</p>
                        {s.time && <p className="text-xs text-gray-400">{s.time} · {s.duration} דק׳</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4">
              {!confirm ? (
                <button onClick={() => setConfirm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors border border-red-100">
                  <Trash2 size={14} /> מחק מאמן
                </button>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-700 text-center">מחיקה תמחק גם את כל הלקוחות והמתאמנים שלו!</p>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-60">
                      {deleting ? 'מוחק...' : 'כן, מחק הכל'}
                    </button>
                    <button onClick={() => setConfirm(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold">ביטול</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionRow({ item, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [plan,    setPlan]    = useState(item.subscription.plan)
  const [status,  setStatus]  = useState(item.subscription.status)
  const [note,    setNote]    = useState(item.subscription.adminNote || '')
  const [saving,  setSaving]  = useState(false)

  const s = item.subscription
  const StatusIcon = STATUS_META[s.status]?.icon || Clock
  const planMeta   = PLAN_META[s.plan] || PLAN_META.starter

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/admin/subscriptions/${item.trainer._id}`, { plan, status, adminNote: note })
      onUpdate(item.trainer._id, res.data)
      setEditing(false)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="px-5 py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00969E] to-[#007A81] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {item.trainer.businessName?.[0]?.toUpperCase() || item.trainer.email[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{item.trainer.businessName || '—'}</p>
          <p className="text-xs text-gray-400">{item.trainer.email}</p>
        </div>

        {/* Plan chip */}
        <span className={`hidden md:block text-xs font-bold px-2.5 py-1 rounded-full border ${planMeta.color}`}>
          {planMeta.label} · {planMeta.price}
        </span>

        {/* Status chip */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_META[s.status]?.color}`}>
          <StatusIcon size={11} />
          {STATUS_META[s.status]?.label}
          {s.status === 'trial' && s.daysLeftInTrial > 0 && ` (${s.daysLeftInTrial}י׳)`}
        </div>

        {/* Payment history count */}
        {s.payments?.length > 0 && (
          <span className="hidden lg:block text-xs text-gray-400">{s.payments.length} תשלומים</span>
        )}

        {/* Edit button */}
        <button onClick={() => setEditing(!editing)}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#00969E] hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
          <Edit2 size={13} />
        </button>
      </div>

      {/* Inline edit panel */}
      {editing && (
        <div className="mt-4 bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">תוכנית</label>
              <select value={plan} onChange={e => setPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]">
                <option value="starter">Starter — ₪49/חו׳</option>
                <option value="pro">Pro — ₪199/חו׳</option>
                <option value="studio">Studio — ₪349/חו׳</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">סטטוס</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]">
                <option value="trial">ניסיון</option>
                <option value="active">פעיל</option>
                <option value="past_due">חוב</option>
                <option value="cancelled">בוטל</option>
                <option value="blocked">חסום</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">הערת אדמין</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="הערה פנימית..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          </div>

          {/* Payment history */}
          {s.payments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">היסטוריית תשלומים</p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {s.payments.slice().reverse().map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg">
                    <span className="text-gray-500">{new Date(p.date).toLocaleDateString('he-IL')}</span>
                    <span className="font-semibold text-gray-800">₪{p.amount}</span>
                    <span className={p.status === 'success' ? 'text-green-600 font-semibold' : 'text-red-500'}>{p.status === 'success' ? '✓ הצליח' : '✗ נכשל'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">
              <Save size={13} /> {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold">ביטול</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,      setTab]      = useState('trainers')
  const [stats,    setStats]    = useState(null)
  const [trainers, setTrainers] = useState([])
  const [subs,     setSubs]     = useState([])
  const [payments, setPayments] = useState({ payments: [], totalRevenue: 0, mrr: 0 })
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return }
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/trainers'),
      api.get('/admin/subscriptions'),
      api.get('/admin/payments'),
    ]).then(([s, t, sub, pay]) => {
      setStats(s.data)
      setTrainers(t.data)
      setSubs(sub.data)
      setPayments(pay.data)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const filtered = trainers.filter(t =>
    t.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSubs = subs.filter(s =>
    s.trainer.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    s.trainer.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubUpdate = (trainerId, updated) => {
    setSubs(prev => prev.map(s => s.trainer._id === trainerId ? { ...s, subscription: updated } : s))
  }

  const activeCount  = subs.filter(s => s.subscription.status === 'active').length
  const trialCount   = subs.filter(s => s.subscription.status === 'trial').length
  const blockedCount = subs.filter(s => s.subscription.status === 'blocked').length

  if (loading) return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {selected && (
        <TrainerModal
          trainerId={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => setTrainers(prev => prev.filter(t => t._id !== id))}
        />
      )}

      {/* Top bar */}
      <div className="bg-[#0A1628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00969E] flex items-center justify-center shadow-lg shadow-[#00969E]/30">
            <span className="text-white font-black text-sm">UW</span>
          </div>
          <div>
            <span className="font-bold text-white">UpWell Admin</span>
            <p className="text-[10px] text-white/40 mt-0.5">מנהל מערכת</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm bg-white/5 px-3 py-1.5 rounded-xl transition-colors">
          <LogOut size={14} /> יציאה
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="מאמנים"        value={stats?.trainers}     icon={Users}       color="bg-[#00969E]" />
          <StatCard label="מנויים פעילים" value={activeCount}         icon={CreditCard}  color="bg-green-500" />
          <StatCard label="MRR"           value={`₪${payments.mrr}`}  icon={TrendingUp}  color="bg-purple-500" />
          <StatCard label="הכנסות סה״כ"   value={`₪${payments.totalRevenue}`} icon={DollarSign} color="bg-orange-400" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {[
            { key: 'trainers',      label: 'מאמנים',  icon: Users },
            { key: 'subscriptions', label: 'מנויים',  icon: CreditCard },
            { key: 'payments',      label: 'תשלומים', icon: Receipt },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/20' : 'text-gray-500 hover:text-gray-800'
              }`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Trainers Tab ── */}
        {tab === 'trainers' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
              <h2 className="font-bold text-gray-900">מאמנים ({trainers.length})</h2>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
                  className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="py-16 text-center"><Users size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-400">לא נמצאו מאמנים</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(t => (
                  <div key={t._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setSelected(t._id)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00969E] to-[#007A81] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.businessName?.[0]?.toUpperCase() || t.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{t.businessName || '—'}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} />{t.email}</span>
                        {t.phone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} />{t.phone}</span>}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      <span className="bg-[#E6F7F8] text-[#00969E] text-xs font-bold px-2.5 py-1 rounded-full">{t.clientCount} לקוחות</span>
                      <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-full">{t.sessionCount} אימונים</span>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-gray-400">הצטרף</p>
                      <p className="text-xs font-semibold text-gray-600">{new Date(t.createdAt).toLocaleDateString('he-IL')}</p>
                    </div>
                    <ChevronLeft size={16} className="text-gray-300 group-hover:text-[#00969E] transition-colors flex-shrink-0 rotate-180" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Subscriptions Tab ── */}
        {tab === 'subscriptions' && (
          <div className="space-y-4">
            {/* Sub stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'פעילים',    value: activeCount,  color: 'bg-green-50 border-green-100', textColor: 'text-green-600' },
                { label: 'ניסיון',    value: trialCount,   color: 'bg-blue-50 border-blue-100',   textColor: 'text-blue-600' },
                { label: 'חסומים',   value: blockedCount,  color: 'bg-red-50 border-red-100',     textColor: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className={`bg-white rounded-2xl border ${s.color} p-4 text-center shadow-sm`}>
                  <p className={`text-2xl font-black ${s.textColor}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                <h2 className="font-bold text-gray-900">ניהול מנויים ({subs.length})</h2>
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
                    className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                </div>
              </div>

              {filteredSubs.length === 0 ? (
                <div className="py-16 text-center"><CreditCard size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-400">אין נתונים</p></div>
              ) : (
                <div>
                  {filteredSubs.map(item => (
                    <SubscriptionRow key={item.trainer._id} item={item} onUpdate={handleSubUpdate} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Payments Tab ── */}
        {tab === 'payments' && (
          <div className="space-y-4">
            {/* Revenue summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-500 mb-1">הכנסות חודשיות (MRR)</p>
                <p className="text-3xl font-black text-green-600">₪{payments.mrr}</p>
                <p className="text-xs text-gray-400 mt-1">{activeCount} מנויים פעילים</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-500 mb-1">הכנסות סה״כ</p>
                <p className="text-3xl font-black text-[#00969E]">₪{payments.totalRevenue}</p>
                <p className="text-xs text-gray-400 mt-1">{payments.payments.filter(p => p.status === 'success').length} תשלומים מוצלחים</p>
              </div>
            </div>

            {/* Invoice4U link */}
            <a href={process.env.INVOICE4U_TEST === 'true' ? 'https://privateqa.invoice4u.co.il' : 'https://www.invoice4u.co.il'}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Receipt size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Invoice4U — ניהול חשבוניות</p>
                  <p className="text-xs text-gray-400">צפייה בחשבוניות מס, קבלות וסליקות</p>
                </div>
              </div>
              <ExternalLink size={15} className="text-gray-300 group-hover:text-[#00969E] transition-colors" />
            </a>

            {/* Payments table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                <h2 className="font-bold text-gray-900">היסטוריית תשלומים ({payments.payments.length})</h2>
                <div className="relative">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
                    className="pr-9 pl-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                </div>
              </div>

              {payments.payments.length === 0 ? (
                <div className="py-16 text-center">
                  <Receipt size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400">אין תשלומים עדיין</p>
                  <p className="text-xs text-gray-300 mt-1">תשלומים יופיעו כאן לאחר שמאמן ישלים רכישת מנוי</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {payments.payments
                    .filter(p =>
                      !search ||
                      p.trainer.businessName?.toLowerCase().includes(search.toLowerCase()) ||
                      p.trainer.email?.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((p, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-gray-400">{MONTHS[new Date(p.date).getMonth()]}</span>
                        <span className="text-sm font-black text-gray-700 leading-none">{new Date(p.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{p.trainer.businessName || '—'}</p>
                        <p className="text-xs text-gray-400">{p.trainer.email}</p>
                      </div>
                      <span className={`hidden md:block text-xs font-bold px-2.5 py-1 rounded-full border ${
                        p.plan === 'studio' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        p.plan === 'pro'    ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                              'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {p.planDetails?.name || p.plan}
                      </span>
                      {p.reference && (
                        <span className="hidden lg:block text-xs text-gray-400 font-mono">#{p.reference}</span>
                      )}
                      <span className="font-bold text-gray-900">₪{p.amount}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        p.status === 'success' ? 'bg-green-50 text-green-600' :
                        p.status === 'failed'  ? 'bg-red-50 text-red-500' :
                                                 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {p.status === 'success' ? '✓ הצליח' : p.status === 'failed' ? '✗ נכשל' : '⏳ ממתין'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
