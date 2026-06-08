import { useEffect, useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, Hourglass, ArrowRight, Clock, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'

const DAYS   = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

const statusConfig = {
  pending:   { label: 'ממתין לאישור', icon: Hourglass,   color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-100' },
  confirmed: { label: 'אושר',         icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-100'  },
  declined:  { label: 'נדחה',         icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100'    },
}

export default function TraineeBookSession() {
  const navigate = useNavigate()
  const today    = new Date()

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [sessions,  setSessions]  = useState([])
  const [requests,  setRequests]  = useState([])
  const [monthInfo, setMonthInfo] = useState(null)

  // Booking flow
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayDetail,    setDayDetail]    = useState(null) // { type: 'session'|'available'|'request', data }
  const [slots,        setSlots]        = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes,        setNotes]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    api.get('/trainee/sessions').then(r => setSessions(r.data || [])).catch(() => {})
    api.get('/trainee/session-requests').then(r => setRequests(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    api.get(`/availability/month?year=${year}&month=${month + 1}`)
      .then(r => setMonthInfo(r.data))
      .catch(() => setMonthInfo(null))
  }, [year, month])

  // Build lookup maps
  const sessionByDate = {}
  sessions.forEach(s => {
    const d = new Date(s.date).toISOString().slice(0, 10)
    sessionByDate[d] = s
  })

  const requestByDate = {}
  requests.forEach(r => {
    if (r.preferredDate && r.status === 'pending') {
      const d = new Date(r.preferredDate).toISOString().slice(0, 10)
      requestByDate[d] = r
    }
  })

  const upcoming = sessions
    .filter(s => new Date(s.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calendar helpers
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isDayAvailable = (day) => {
    if (!monthInfo) return false
    const d = new Date(year, month, day)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    if (d < todayStart) return false
    const dateStr = toDateStr(year, month, day)
    if (monthInfo.blockedDates?.includes(dateStr)) return false
    return monthInfo.enabledWeekdays?.includes(d.getDay())
  }

  const isPast = (day) => {
    const d = new Date(year, month, day); const t = new Date(); t.setHours(0,0,0,0); return d < t
  }
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  // Click on a calendar day
  const onDayClick = useCallback(async (day) => {
    const dateStr = toDateStr(year, month, day)
    setSelectedDate(dateStr)
    setSelectedTime(null); setSlots(null); setError('')

    const session = sessionByDate[dateStr]
    const request = requestByDate[dateStr]

    if (session) {
      setDayDetail({ type: 'session', data: session })
      return
    }
    if (request) {
      setDayDetail({ type: 'request', data: request })
      return
    }
    if (!isDayAvailable(day)) return

    setDayDetail({ type: 'available' })
    setLoadingSlots(true)
    try {
      const r = await api.get(`/availability/slots?date=${dateStr}`)
      setSlots(r.data)
    } catch { setSlots({ slots: [], available: false }) }
    finally { setLoadingSlots(false) }
  }, [year, month, sessionByDate, requestByDate, monthInfo])

  const submit = async () => {
    if (!selectedDate || !selectedTime) return setError('בחר שעה')
    setSaving(true); setError('')
    try {
      const res = await api.post('/trainee/session-requests', { preferredDate: selectedDate, preferredTime: selectedTime, notes })
      setRequests(prev => [res.data, ...prev])
      setDayDetail(null); setSelectedDate(null); setSlots(null); setSelectedTime(null); setNotes('')
      setDone(true); setTimeout(() => setDone(false), 4000)
    } catch (e) { setError(e.response?.data?.message || 'שגיאה') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">

      {/* Header */}
      <div className="relative overflow-hidden pt-10 pb-6 px-5 bg-gradient-to-br from-[#00969E] to-[#007A81]">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <button onClick={() => navigate('/trainee')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowRight size={16} /> חזרה
          </button>
          <h1 className="text-2xl font-black text-white">האימונים שלי</h1>
          <p className="text-white/70 text-sm mt-1">{upcoming.length > 0 ? `${upcoming.length} אימונים קרובים` : 'אין אימונים קרובים'}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {done && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-2xl shadow-sm">
            <CheckCircle size={16} className="flex-shrink-0" /> הבקשה נשלחה! המאמן יאשר את האימון בקרוב.
          </div>
        )}

        {/* ── Calendar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
            <h2 className="font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={prevMonth} disabled={year === today.getFullYear() && month === today.getMonth()}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-50">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400">{d.slice(0,1)}</div>)}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 p-2 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr  = toDateStr(year, month, day)
              const hasSession  = !!sessionByDate[dateStr]
              const hasRequest  = !!requestByDate[dateStr]
              const available   = isDayAvailable(day)
              const past        = isPast(day)
              const todayMark   = isToday(day)
              const selected    = selectedDate === dateStr

              let cls = 'text-gray-300 cursor-not-allowed'
              if (hasSession)       cls = 'bg-[#00969E] text-white shadow-md'
              else if (hasRequest)  cls = 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              else if (selected)    cls = 'bg-[#00969E]/20 text-[#00969E] ring-2 ring-[#00969E]'
              else if (available)   cls = 'bg-[#E6F7F8] text-[#00969E] hover:bg-[#00969E] hover:text-white'
              else if (past)        cls = 'text-gray-200 cursor-not-allowed'

              return (
                <button key={day}
                  disabled={!hasSession && !hasRequest && !available}
                  onClick={() => onDayClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all relative ${cls} ${todayMark && !hasSession ? 'ring-2 ring-[#00969E]/40' : ''}`}>
                  {day}
                  {hasSession && <span className="absolute bottom-0.5 w-1 h-1 bg-white rounded-full opacity-70" />}
                  {hasRequest && !hasSession && <span className="absolute bottom-0.5 w-1 h-1 bg-yellow-500 rounded-full" />}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="px-4 pb-3 flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#00969E] inline-block" />אימון מתואם</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" />בקשה פתוחה</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#E6F7F8] inline-block" />זמין להזמנה</span>
          </div>
        </div>

        {/* ── Day detail panel ── */}
        {selectedDate && dayDetail && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <p className="font-bold text-gray-900 text-sm">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <button onClick={() => { setDayDetail(null); setSelectedDate(null) }}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X size={13} />
              </button>
            </div>

            {/* Confirmed session */}
            {dayDetail.type === 'session' && (
              <div className="p-5">
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex flex-col items-center justify-center flex-shrink-0 shadow-md shadow-green-500/20">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">אימון מאושר</p>
                    {dayDetail.data.time && (
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {dayDetail.data.time} · {dayDetail.data.duration || 60} דק׳
                      </p>
                    )}
                    {dayDetail.data.notes && <p className="text-xs text-gray-400 mt-1">{dayDetail.data.notes}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Pending request */}
            {dayDetail.type === 'request' && (
              <div className="p-5">
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
                    <Hourglass size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">בקשה ממתינה לאישור</p>
                    {dayDetail.data.preferredTime && (
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {dayDetail.data.preferredTime}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">המאמן יאשר בקרוב</p>
                  </div>
                </div>
              </div>
            )}

            {/* Available — booking form */}
            {dayDetail.type === 'available' && (
              <div className="p-5 space-y-4">
                {loadingSlots ? (
                  <div className="flex justify-center py-6"><div className="w-7 h-7 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" /></div>
                ) : !slots?.available ? (
                  <p className="text-gray-500 text-sm text-center py-4">אין שעות פנויות ביום זה</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-gray-500">בחר שעה:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.slots.map(s => (
                        <button key={s.time} disabled={!s.available} onClick={() => setSelectedTime(s.time)}
                          className={['py-2.5 rounded-xl text-sm font-semibold transition-all',
                            !s.available          ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through' :
                            selectedTime===s.time ? 'bg-[#00969E] text-white shadow-md' :
                                                    'bg-[#E6F7F8] text-[#00969E] hover:bg-[#00969E] hover:text-white',
                          ].join(' ')}>{s.time}</button>
                      ))}
                    </div>
                    {selectedTime && (
                      <div className="space-y-3">
                        <div className="bg-[#E6F7F8] rounded-xl px-4 py-2.5 text-sm text-[#007A81] font-semibold flex items-center gap-2">
                          <CheckCircle size={14} /> {selectedTime} · {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                        </div>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                          placeholder="הערות (אופציונלי)" dir="rtl"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none" />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button onClick={submit} disabled={saving}
                          className="w-full py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
                          {saving ? 'שולח...' : 'שלח בקשת אימון 💪'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Upcoming sessions list ── */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 text-sm mb-3 px-1">אימונים קרובים</h2>
            <div className="space-y-2">
              {upcoming.map(s => (
                <div key={s._id} className="bg-white rounded-2xl border border-[#00969E]/20 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F7F8] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#00969E] uppercase">
                      {MONTHS[new Date(s.date).getMonth()].slice(0,3)}
                    </span>
                    <span className="text-lg font-black text-[#00969E] leading-none">{new Date(s.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(s.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      {s.time && <span className="flex items-center gap-1"><Clock size={11} />{s.time}</span>}
                      {s.duration && <span>{s.duration} דק׳</span>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 flex-shrink-0">
                    <CheckCircle size={11} /> מאושר
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pending requests ── */}
        {requests.filter(r => r.status !== 'declined').length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 text-sm mb-3 px-1">הבקשות שלי</h2>
            <div className="space-y-2">
              {requests.filter(r => r.status !== 'declined').map(r => {
                const sc = statusConfig[r.status] || statusConfig.pending
                const Icon = sc.icon
                return (
                  <div key={r._id} className={`bg-white rounded-2xl border ${sc.border} shadow-sm p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          📅 {r.preferredDate
                            ? new Date(r.preferredDate).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                            : 'תאריך גמיש'}
                          {r.preferredTime && ` · ${r.preferredTime}`}
                        </p>
                        {r.trainerNote && <p className="text-xs text-[#00969E] mt-2 bg-[#E6F7F8] px-2 py-1.5 rounded-lg">💬 {r.trainerNote}</p>}
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border} flex-shrink-0`}>
                        <Icon size={11} /> {sc.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {upcoming.length === 0 && requests.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
            <Plus size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">אין אימונים — לחץ על יום זמין כדי להזמין</p>
          </div>
        )}

      </div>
      <TraineeNav />
    </div>
  )
}
