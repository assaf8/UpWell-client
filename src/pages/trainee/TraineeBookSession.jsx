import { useEffect, useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, Hourglass, ArrowRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'

const DAYS    = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const MONTHS  = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const statusConfig = {
  pending:   { label: 'ממתין לאישור', icon: Hourglass,   color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-100' },
  confirmed: { label: 'אושר',         icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-100'  },
  declined:  { label: 'נדחה',         icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100'    },
}

const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

export default function TraineeBookSession() {
  const navigate = useNavigate()
  const today = new Date()

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  // Availability for current month view
  const [monthInfo,  setMonthInfo]  = useState(null)   // { enabledWeekdays, blockedDates }
  const [loadingMonth, setLoadingMonth] = useState(false)

  // Selected date & its time slots
  const [selectedDate, setSelectedDate] = useState(null)   // 'YYYY-MM-DD'
  const [slots,        setSlots]        = useState(null)   // { slots, available, sessionDuration }
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Booking form
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes,        setNotes]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState('')

  // Past requests
  const [requests, setRequests] = useState([])

  // ── Load month availability ────────────────────────────────────────────
  useEffect(() => {
    setLoadingMonth(true)
    api.get(`/availability/month?year=${year}&month=${month + 1}`)
      .then(r => setMonthInfo(r.data))
      .catch(() => setMonthInfo(null))
      .finally(() => setLoadingMonth(false))
    setSelectedDate(null); setSlots(null); setSelectedTime(null)
  }, [year, month])

  // ── Load requests ──────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/trainee/session-requests').then(r => setRequests(r.data || [])).catch(() => {})
  }, [])

  // ── Load time slots for a date ─────────────────────────────────────────
  const selectDate = useCallback(async (dateStr) => {
    setSelectedDate(dateStr); setSelectedTime(null); setSlots(null)
    setLoadingSlots(true)
    try {
      const r = await api.get(`/availability/slots?date=${dateStr}`)
      setSlots(r.data)
    } catch { setSlots({ slots: [], available: false }) }
    finally { setLoadingSlots(false) }
  }, [])

  // ── Submit booking request ─────────────────────────────────────────────
  const submit = async () => {
    if (!selectedDate || !selectedTime) return setError('בחר תאריך ושעה')
    setSaving(true); setError('')
    try {
      const res = await api.post('/trainee/session-requests', {
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        notes,
      })
      setRequests(prev => [res.data, ...prev])
      setSelectedDate(null); setSlots(null); setSelectedTime(null); setNotes('')
      setDone(true); setTimeout(() => setDone(false), 4000)
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה — נסה שוב')
    } finally { setSaving(false) }
  }

  // ── Calendar helpers ───────────────────────────────────────────────────
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

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const isPast = (day) => {
    const d = new Date(year, month, day)
    const t = new Date(); t.setHours(0,0,0,0)
    return d < t
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">

      {/* Header */}
      <div className="relative overflow-hidden pt-10 pb-6 px-5 bg-gradient-to-br from-[#00969E] to-[#007A81]">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <button onClick={() => navigate('/trainee')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowRight size={16} /> חזרה
          </button>
          <h1 className="text-2xl font-black text-white">הזמן אימון</h1>
          <p className="text-white/70 text-sm mt-1">בחר תאריך ושעה פנויה</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">

        {done && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-2xl shadow-sm">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>הבקשה נשלחה! המאמן יאשר את האימון בקרוב.</span>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
            <h2 className="font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={prevMonth} disabled={year === today.getFullYear() && month === today.getMonth()}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-50">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400">{d.slice(0,1)}</div>)}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 p-2 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr    = toDateStr(year, month, day)
              const available  = isDayAvailable(day)
              const past       = isPast(day)
              const todayMark  = isToday(day)
              const selected   = selectedDate === dateStr

              return (
                <button key={day}
                  disabled={!available}
                  onClick={() => selectDate(dateStr)}
                  className={[
                    'aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all',
                    selected  ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/25 scale-105' :
                    available ? 'bg-[#E6F7F8] text-[#00969E] hover:bg-[#00969E] hover:text-white hover:scale-105' :
                    past      ? 'text-gray-200 cursor-not-allowed' :
                                'text-gray-300 cursor-not-allowed',
                    todayMark && !selected ? 'ring-2 ring-[#00969E]/40' : '',
                  ].join(' ')}>
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          {monthInfo && (
            <div className="px-4 pb-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-[#E6F7F8]" />זמין</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-gray-100" />לא זמין</span>
              {loadingMonth && <span className="text-[#00969E]">טוען...</span>}
            </div>
          )}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={15} className="text-[#00969E]" />
              שעות פנויות — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>

            {loadingSlots ? (
              <div className="flex justify-center py-6">
                <div className="w-7 h-7 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
              </div>
            ) : !slots?.available ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  {slots?.reason === 'day_off'  ? 'המאמן לא עובד ביום זה' :
                   slots?.reason === 'blocked'  ? 'יום חסום — המאמן אינו זמין' :
                   slots?.reason === 'no_schedule' ? 'המאמן טרם הגדיר לוח זמינות' :
                   'אין שעות פנויות ביום זה'}
                </p>
              </div>
            ) : slots.slots.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">כל השעות תפוסות ביום זה</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.slots.map(s => (
                  <button key={s.time}
                    disabled={!s.available}
                    onClick={() => setSelectedTime(s.time)}
                    className={[
                      'py-2.5 rounded-xl text-sm font-semibold transition-all',
                      !s.available   ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through' :
                      selectedTime === s.time ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/25' :
                                       'bg-[#E6F7F8] text-[#00969E] hover:bg-[#00969E] hover:text-white',
                    ].join(' ')}>
                    {s.time}
                  </button>
                ))}
              </div>
            )}

            {slots?.sessionDuration && (
              <p className="text-xs text-gray-400 mt-3 text-center">משך אימון: {slots.sessionDuration} דק׳</p>
            )}
          </div>
        )}

        {/* Notes + submit */}
        {selectedTime && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="bg-[#E6F7F8] rounded-xl px-4 py-3 text-sm text-[#007A81] font-semibold flex items-center gap-2">
              <CheckCircle size={15} />
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedTime}
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">הערות (אופציונלי)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="למשל: יש לי כאב גב, מעדיף אימון עליון..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none" />
            </div>

            <button onClick={submit} disabled={saving}
              className="w-full py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
              {saving ? 'שולח...' : 'שלח בקשת אימון 💪'}
            </button>
          </div>
        )}

        {/* Past requests */}
        {requests.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 text-sm mb-3 px-1">הבקשות שלי</h2>
            <div className="space-y-3">
              {requests.map(r => {
                const sc = statusConfig[r.status] || statusConfig.pending
                const Icon = sc.icon
                return (
                  <div key={r._id} className={`bg-white rounded-2xl border ${sc.border} shadow-sm p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          📅 {r.preferredDate
                            ? new Date(r.preferredDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                            : 'תאריך גמיש'}
                          {r.preferredTime && ` · ${r.preferredTime}`}
                        </p>
                        {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                        {r.trainerNote && (
                          <p className="text-xs text-[#00969E] mt-2 bg-[#E6F7F8] px-2 py-1.5 rounded-lg">
                            💬 {r.trainerNote}
                          </p>
                        )}
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
      </div>

      <TraineeNav />
    </div>
  )
}
