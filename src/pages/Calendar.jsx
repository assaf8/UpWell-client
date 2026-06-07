import { useEffect, useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, X, Clock, User, Bell, CheckCircle, Trash2 } from 'lucide-react'
import api from '../lib/api'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

function SessionDetailModal({ session, onClose, onDelete, onRemind }) {
  const [channel, setChannel] = useState('whatsapp')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(session.reminderSent || false)
  const [error, setError] = useState('')

  const sendReminder = async () => {
    setSending(true); setError('')
    try {
      await onRemind(session._id, channel)
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בשליחת תזכורת')
    } finally { setSending(false) }
  }

  const dateStr = new Date(session.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">פרטי אימון</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="font-bold text-gray-900 text-base">{session.client?.name}</p>
            <p className="text-sm text-gray-500">{dateStr}</p>
            {session.time && <p className="text-sm text-gray-500">🕐 {session.time} · {session.duration} דק׳</p>}
            {session.price && <p className="text-sm text-gray-500">💳 ₪{session.price}</p>}
            {session.client?.phone && <p className="text-sm text-gray-500">📱 {session.client.phone}</p>}
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {session.client?.phone ? (
            <div className="space-y-2">
              {/* Channel picker */}
              {!sent && (
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { k: 'whatsapp', l: '💬 WhatsApp', cls: 'bg-green-50 border-green-200 text-green-700' },
                    { k: 'sms',      l: '📱 SMS',       cls: 'bg-blue-50 border-blue-200 text-blue-700'  },
                    { k: 'both',     l: '🔔 שניהם',     cls: 'bg-purple-50 border-purple-200 text-purple-700' },
                  ].map(c => (
                    <button key={c.k} onClick={() => setChannel(c.k)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${channel === c.k ? c.cls + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      {c.l}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={sendReminder} disabled={sending || sent}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  sent ? 'bg-green-50 text-green-600 border border-green-100'
                       : channel === 'whatsapp' ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                       : 'bg-[#00969E] hover:bg-[#007A81] text-white shadow-lg shadow-[#00969E]/20'
                } disabled:opacity-60`}>
                {sent ? <><CheckCircle size={15} /> תזכורת נשלחה ✓</>
                      : sending ? 'שולח...'
                      : channel === 'whatsapp' ? <><Bell size={15} /> שלח WhatsApp</>
                      : channel === 'sms'      ? <><Bell size={15} /> שלח SMS</>
                      :                          <><Bell size={15} /> שלח WhatsApp + SMS</>}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center bg-gray-50 py-2 rounded-xl">אין מספר טלפון ללקוח זה</p>
          )}

          <button onClick={() => { onDelete(session._id); onClose() }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> מחק אימון
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [sessions, setSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ clientId: '', date: '', time: '09:00', duration: 60, price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/sessions?year=${year}&month=${month + 1}`).then(r => setSessions(r.data || [])).catch(() => {})
    api.get('/clients').then(r => setClients(r.data.clients || [])).catch(() => {})
  }, [year, month])

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const sessionsByDay = {}
  sessions.forEach(s => {
    const d = new Date(s.date).getDate()
    if (!sessionsByDay[d]) sessionsByDay[d] = []
    sessionsByDay[d].push(s)
  })

  const save = async () => {
    if (!form.clientId || !form.date) return
    setSaving(true)
    try {
      const res = await api.post('/sessions', form)
      setSessions(prev => [...prev, res.data])
      setShowModal(false)
      setForm({ clientId: '', date: '', time: '09:00', duration: 60, price: '' })
    } catch {} finally { setSaving(false) }
  }

  const deleteSession = async (id) => {
    await api.delete(`/sessions/${id}`).catch(() => {})
    setSessions(prev => prev.filter(s => s._id !== id))
  }

  const sendReminder = async (id, channel = 'whatsapp') => {
    await api.post(`/sessions/${id}/remind`, { channel })
    setSessions(prev => prev.map(s => s._id === id ? { ...s, reminderSent: true, reminderChannel: channel } : s))
  }

  const sessionColors = ['bg-[#00969E]', 'bg-purple-500', 'bg-orange-400', 'bg-green-500', 'bg-pink-500']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDelete={deleteSession}
          onRemind={sendReminder}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{sessions.length} אימונים החודש</p>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
          <Plus size={16} /> הוסף אימון
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button onClick={next} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-900 text-lg">{MONTHS[month]} {year}</h2>
          <button onClick={prev} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {DAYS.map(d => <div key={d} className="py-3 text-center text-xs font-bold text-gray-400">{d}</div>)}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="h-28 border-b border-r border-gray-50 bg-gray-50/30" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const daySessions = sessionsByDay[day] || []
            return (
              <div key={day} className="h-28 border-b border-r border-gray-50 p-2 hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => { setForm(f => ({...f, date: `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`})); setShowModal(true) }}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold mb-1.5 ${isToday ? 'bg-[#00969E] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 2).map((s, i) => (
                    <div key={i}
                      onClick={e => { e.stopPropagation(); setSelectedSession(s) }}
                      className={`${sessionColors[i % sessionColors.length]} text-white text-xs rounded-lg px-1.5 py-0.5 truncate font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}>
                      {s.reminderSent && <Bell size={8} className="flex-shrink-0" />}
                      {s.time} {s.client?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {daySessions.length > 2 && <p className="text-xs text-gray-400 font-medium">+{daySessions.length - 2} עוד</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">תזמן אימון</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5"><User size={11} /> לקוח</label>
                <select value={form.clientId} onChange={e => setForm(f => ({...f, clientId: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                  <option value="">בחר לקוח...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">תאריך</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} dir="ltr"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Clock size={11} /> שעה</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} dir="ltr"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">משך (דק׳)</label>
                  <select value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                    {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} דק׳</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">מחיר (₪)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="0" dir="ltr"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={save} disabled={saving || !form.clientId || !form.date}
                className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50">
                {saving ? 'שומר...' : 'שמור אימון'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
