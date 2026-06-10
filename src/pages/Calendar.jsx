import { useEffect, useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, X, Clock, User, Bell, CheckCircle, Trash2, Hourglass, XCircle, MessageSquare, Users, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
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

const FREQ_OPTIONS = [
  { value: 'daily',    label: 'יומי' },
  { value: 'weekly',   label: 'שבועי' },
  { value: 'biweekly', label: 'דו-שבועי' },
  { value: 'monthly',  label: 'חודשי' },
]

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [sessions, setSessions] = useState([])
  const [groupSessions, setGroupSessions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [sessionType, setSessionType] = useState('individual')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedGroupSession, setSelectedGroupSession] = useState(null)
  const [clients, setClients] = useState([])
  const [groups, setGroups] = useState([])
  const [form, setForm] = useState({ clientId: '', date: '', time: '09:00', duration: 60, price: '' })
  const [groupForm, setGroupForm] = useState({
    groupId: '', title: '', date: '', time: '09:00', duration: 60,
    maxParticipants: 10, location: '', notes: '',
    isRecurring: false, frequency: 'weekly', recurringUntil: '',
  })
  const [saving, setSaving] = useState(false)
  const [requests, setRequests] = useState([])
  const [requestAction, setRequestAction] = useState(null)
  const [trainerNote, setTrainerNote] = useState('')
  const [actionForm, setActionForm] = useState({ time: '09:00', duration: 60, price: '' })
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    api.get(`/sessions?year=${year}&month=${month + 1}`).then(r => setSessions(r.data || [])).catch(() => {})
    api.get(`/group-sessions?year=${year}&month=${month + 1}`).then(r => setGroupSessions(r.data || [])).catch(() => {})
    api.get('/clients').then(r => setClients(r.data.clients || [])).catch(() => {})
    api.get('/groups').then(r => setGroups(r.data || [])).catch(() => {})
  }, [year, month])

  useEffect(() => {
    api.get('/inbox/session-requests').then(r => setRequests(r.data || [])).catch(() => {})
  }, [])

  const pendingRequests = requests.filter(r => r.status === 'pending')

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const sessionsByDay = {}
  sessions.forEach(s => {
    const d = new Date(s.date).getDate()
    if (!sessionsByDay[d]) sessionsByDay[d] = []
    sessionsByDay[d].push({ ...s, _type: 'individual' })
  })
  groupSessions.forEach(s => {
    const d = new Date(s.date).getDate()
    if (!sessionsByDay[d]) sessionsByDay[d] = []
    sessionsByDay[d].push({ ...s, _type: 'group' })
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

  const saveGroupSession = async () => {
    if (!groupForm.groupId || !groupForm.title || !groupForm.date) return
    setSaving(true)
    try {
      const res = await api.post('/group-sessions', {
        groupId: groupForm.groupId,
        title: groupForm.title,
        date: groupForm.date,
        time: groupForm.time,
        duration: groupForm.duration,
        maxParticipants: groupForm.maxParticipants,
        location: groupForm.location,
        notes: groupForm.notes,
        isRecurring: groupForm.isRecurring,
        frequency: groupForm.frequency,
        recurringUntil: groupForm.isRecurring ? groupForm.recurringUntil : undefined,
      })
      // res.data is an array of created sessions
      setGroupSessions(prev => [...prev, ...res.data])
      setShowModal(false)
      setGroupForm({ groupId: '', title: '', date: '', time: '09:00', duration: 60, maxParticipants: 10, location: '', notes: '', isRecurring: false, frequency: 'weekly', recurringUntil: '' })
    } catch (e) {
      alert(e.response?.data?.message || 'שגיאה בשמירה')
    } finally { setSaving(false) }
  }

  const cancelGroupSession = async (id) => {
    await api.delete(`/group-sessions/${id}`).catch(() => {})
    setGroupSessions(prev => prev.filter(s => s._id !== id))
    setSelectedGroupSession(null)
  }

  const deleteSession = async (id) => {
    await api.delete(`/sessions/${id}`).catch(() => {})
    setSessions(prev => prev.filter(s => s._id !== id))
  }

  const sendReminder = async (id, channel = 'whatsapp') => {
    await api.post(`/sessions/${id}/remind`, { channel })
    setSessions(prev => prev.map(s => s._id === id ? { ...s, reminderSent: true, reminderChannel: channel } : s))
  }

  const approveRequest = async () => {
    const r = requestAction.request
    setActioning(true)
    try {
      // 1. Mark request as confirmed
      await api.put(`/inbox/session-requests/${r._id}`, { status: 'confirmed', trainerNote })
      // 2. Create actual session on the calendar
      const session = await api.post('/sessions', {
        clientId: r.client._id,
        date: r.preferredDate,
        time: actionForm.time || r.preferredTime,
        duration: actionForm.duration,
        price: actionForm.price || undefined,
      })
      setSessions(prev => [...prev, session.data])
      setRequests(prev => prev.map(x => x._id === r._id ? { ...x, status: 'confirmed' } : x))
      setRequestAction(null); setTrainerNote(''); setActionForm({ time: '09:00', duration: 60, price: '' })
    } catch (e) { alert(e.response?.data?.message || 'שגיאה') }
    finally { setActioning(false) }
  }

  const declineRequest = async () => {
    const r = requestAction.request
    setActioning(true)
    try {
      await api.put(`/inbox/session-requests/${r._id}`, { status: 'declined', trainerNote })
      setRequests(prev => prev.map(x => x._id === r._id ? { ...x, status: 'declined' } : x))
      setRequestAction(null); setTrainerNote('')
    } catch {}
    finally { setActioning(false) }
  }

  const sessionColors = ['bg-[#00969E]', 'bg-purple-500', 'bg-orange-400', 'bg-green-500', 'bg-pink-500']
  const [searchParams] = useSearchParams()
  const [calTab, setCalTab] = useState(searchParams.get('tab') === 'requests' ? 'requests' : 'calendar')

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

      {selectedGroupSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">אימון קבוצתי</h2>
              <button onClick={() => setSelectedGroupSession(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                <p className="font-bold text-gray-900 text-base">{selectedGroupSession.title}</p>
                <p className="text-sm text-purple-600 font-medium flex items-center gap-1.5"><Users size={13} /> {selectedGroupSession.group?.name}</p>
                <p className="text-sm text-gray-500">📅 {new Date(selectedGroupSession.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                {selectedGroupSession.time && <p className="text-sm text-gray-500">🕐 {selectedGroupSession.time} · {selectedGroupSession.duration} דק׳</p>}
                {selectedGroupSession.location && <p className="text-sm text-gray-500">📍 {selectedGroupSession.location}</p>}
                {selectedGroupSession.isRecurring && <p className="text-sm text-gray-500 flex items-center gap-1.5"><RefreshCw size={12} /> אימון קבוע — {FREQ_OPTIONS.find(f => f.value === selectedGroupSession.frequency)?.label}</p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">רשומים ({selectedGroupSession.registrations?.length || 0}/{selectedGroupSession.maxParticipants})</p>
                {selectedGroupSession.registrations?.length > 0
                  ? <div className="space-y-1">{selectedGroupSession.registrations.map(r => <p key={r._id} className="text-sm text-gray-700">{r.name}</p>)}</div>
                  : <p className="text-sm text-gray-400">אין רשומים עדיין</p>}
              </div>
              <button onClick={() => cancelGroupSession(selectedGroupSession._id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                <Trash2 size={14} /> בטל אימון זה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setCalTab('calendar')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${calTab === 'calendar' ? 'bg-[#00969E] text-white shadow-lg shadow-[#00969E]/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <CheckCircle size={15} /> יומן אימונים
        </button>
        <button onClick={() => setCalTab('requests')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${calTab === 'requests' ? 'bg-[#00969E] text-white shadow-lg shadow-[#00969E]/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Hourglass size={15} /> בקשות אימון
          {pendingRequests.length > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ── REQUESTS TAB ── */}
      {calTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Hourglass size={15} className="text-yellow-500" /> בקשות אימון
            </h3>
            <span className="text-xs text-gray-400">{requests.length} סה״כ</span>
          </div>

          {requests.length === 0 ? (
            <div className="py-16 text-center">
              <Hourglass size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">אין בקשות אימון</p>
              <p className="text-xs text-gray-300 mt-1">בקשות מלקוחות יופיעו כאן</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map(r => {
                const isPending = r.status === 'pending'
                const dateStr = r.preferredDate
                  ? new Date(r.preferredDate).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'תאריך גמיש'
                return (
                  <div key={r._id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{r.client?.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                          r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                     'bg-red-100 text-red-600'
                        }`}>
                          {r.status === 'pending' ? 'ממתין' : r.status === 'confirmed' ? 'אושר' : 'נדחה'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">📅 {dateStr}{r.preferredTime && ` · ${r.preferredTime}`}</p>
                      {r.notes && <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>}
                      {r.trainerNote && <p className="text-xs text-[#00969E] mt-1">💬 {r.trainerNote}</p>}
                    </div>
                    {isPending && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setRequestAction({ request: r, type: 'approve' }); setActionForm(f => ({ ...f, time: r.preferredTime || '09:00' })); setTrainerNote('') }}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-green-500/20">
                          <CheckCircle size={13} /> אשר
                        </button>
                        <button onClick={() => { setRequestAction({ request: r, type: 'decline' }); setTrainerNote('') }}
                          className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold border border-red-100 transition-colors">
                          <XCircle size={13} /> דחה
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {calTab === 'calendar' && <>
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
                      onClick={e => { e.stopPropagation(); s._type === 'group' ? setSelectedGroupSession(s) : setSelectedSession(s) }}
                      className={`${s._type === 'group' ? 'bg-purple-500' : sessionColors[i % sessionColors.length]} text-white text-xs rounded-lg px-1.5 py-0.5 truncate font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}>
                      {s._type === 'group' ? <Users size={8} className="flex-shrink-0" /> : s.reminderSent ? <Bell size={8} className="flex-shrink-0" /> : null}
                      {s.time} {s._type === 'group' ? s.title : s.client?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {daySessions.length > 2 && <p className="text-xs text-gray-400 font-medium">+{daySessions.length - 2} עוד</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </>}

      {/* Approve / Decline modal */}
      {requestAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {requestAction.type === 'approve' ? '✅ אישור בקשת אימון' : '❌ דחיית בקשה'}
              </h2>
              <button onClick={() => setRequestAction(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="font-semibold text-gray-900">{requestAction.request.client?.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {requestAction.request.preferredDate
                    ? new Date(requestAction.request.preferredDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'תאריך גמיש'}
                  {requestAction.request.preferredTime && ` · ${requestAction.request.preferredTime}`}
                </p>
                {requestAction.request.notes && <p className="text-xs text-gray-400 mt-1 italic">"{requestAction.request.notes}"</p>}
              </div>

              {requestAction.type === 'approve' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Clock size={11} /> שעה</label>
                      <input type="time" value={actionForm.time} onChange={e => setActionForm(f => ({...f, time: e.target.value}))} dir="ltr"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">משך (דק׳)</label>
                      <select value={actionForm.duration} onChange={e => setActionForm(f => ({...f, duration: e.target.value}))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                        {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} דק׳</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">מחיר (₪) — אופציונלי</label>
                    <input type="number" value={actionForm.price} onChange={e => setActionForm(f => ({...f, price: e.target.value}))} placeholder="0" dir="ltr"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><MessageSquare size={11} /> הודעה ללקוח (אופציונלי)</label>
                <textarea value={trainerNote} onChange={e => setTrainerNote(e.target.value)} rows={2}
                  placeholder={requestAction.type === 'approve' ? 'למשל: מחכה לך! הכנס בכניסה הראשית.' : 'למשל: אנא בחר תאריך אחר.'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none" />
              </div>

              <div className="flex gap-2">
                {requestAction.type === 'approve' ? (
                  <button onClick={approveRequest} disabled={actioning}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60">
                    {actioning ? 'מאשר...' : '✅ אשר ותזמן אימון'}
                  </button>
                ) : (
                  <button onClick={declineRequest} disabled={actioning}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60">
                    {actioning ? 'שולח...' : '❌ דחה בקשה'}
                  </button>
                )}
                <button onClick={() => setRequestAction(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">הוסף אימון</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
            </div>

            {/* Type toggle */}
            <div className="px-5 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSessionType('individual')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${sessionType === 'individual' ? 'border-[#00969E] bg-[#E6F7F8] text-[#00969E]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                  <User size={15} /> אימון יחידני
                </button>
                <button onClick={() => setSessionType('group')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${sessionType === 'group' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                  <Users size={15} /> אימון קבוצתי
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {sessionType === 'individual' ? (
                <>
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5"><Users size={11} /> קבוצה</label>
                    <select value={groupForm.groupId} onChange={e => setGroupForm(f => ({...f, groupId: e.target.value}))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400 bg-white">
                      <option value="">בחר קבוצה...</option>
                      {groups.map(g => <option key={g._id} value={g._id}>{g.name} ({g.members?.length || 0} מתאמנים)</option>)}
                    </select>
                    {groups.length === 0 && <p className="text-xs text-gray-400 mt-1">אין קבוצות — <a href="/groups" className="text-[#00969E] underline">צור קבוצה קודם</a></p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">שם האימון *</label>
                    <input value={groupForm.title} onChange={e => setGroupForm(f => ({...f, title: e.target.value}))} placeholder="למשל: אימון פונקציונלי שבועי"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">תאריך</label>
                      <input type="date" value={groupForm.date} onChange={e => setGroupForm(f => ({...f, date: e.target.value}))} dir="ltr"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Clock size={11} /> שעה</label>
                      <input type="time" value={groupForm.time} onChange={e => setGroupForm(f => ({...f, time: e.target.value}))} dir="ltr"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">משך (דק׳)</label>
                      <select value={groupForm.duration} onChange={e => setGroupForm(f => ({...f, duration: Number(e.target.value)}))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400 bg-white">
                        {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} דק׳</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">מקסימום משתתפים</label>
                      <input type="number" min={1} value={groupForm.maxParticipants} onChange={e => setGroupForm(f => ({...f, maxParticipants: Number(e.target.value)}))} dir="ltr"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">מיקום (אופציונלי)</label>
                    <input value={groupForm.location} onChange={e => setGroupForm(f => ({...f, location: e.target.value}))} placeholder="למשל: אולם ספורט 2"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                  </div>

                  {/* Recurring toggle */}
                  <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setGroupForm(f => ({...f, isRecurring: !f.isRecurring}))}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${groupForm.isRecurring ? 'bg-purple-500' : 'bg-gray-200'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${groupForm.isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><RefreshCw size={13} /> אימון קבוע</p>
                        <p className="text-xs text-gray-400">יוצר מספר אימונים בלוח השנה</p>
                      </div>
                    </label>
                    {groupForm.isRecurring && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">תדירות</label>
                          <select value={groupForm.frequency} onChange={e => setGroupForm(f => ({...f, frequency: e.target.value}))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400 bg-white">
                            {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">עד תאריך</label>
                          <input type="date" value={groupForm.recurringUntil} onChange={e => setGroupForm(f => ({...f, recurringUntil: e.target.value}))} dir="ltr"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:border-purple-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-gray-100">
              {sessionType === 'individual' ? (
                <>
                  <button onClick={save} disabled={saving || !form.clientId || !form.date}
                    className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'שומר...' : 'שמור אימון'}
                  </button>
                </>
              ) : (
                <button onClick={saveGroupSession} disabled={saving || !groupForm.groupId || !groupForm.title || !groupForm.date || (groupForm.isRecurring && !groupForm.recurringUntil)}
                  className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'שומר...' : groupForm.isRecurring ? 'צור סדרת אימונים' : 'צור אימון קבוצתי'}
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
