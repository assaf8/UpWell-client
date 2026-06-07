import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, CheckCircle, ArrowRight, ChevronRight, ChevronLeft, Sparkles, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'
import { getMediaUrl } from '../../lib/media'
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const DAYS   = ['א','ב','ג','ד','ה','ו','ש']

const mealConfig = {
  breakfast: { label: 'ארוחת בוקר',  emoji: '🌅' },
  lunch:     { label: 'ארוחת צהריים', emoji: '☀️' },
  dinner:    { label: 'ארוחת ערב',    emoji: '🌙' },
  snack:     { label: 'נשנוש',         emoji: '🍎' },
}

// ── Macro pill ─────────────────────────────────────────────────────────────
function MacroPill({ icon: Icon, label, value, unit, color }) {
  return (
    <div className={`flex flex-col items-center p-2.5 rounded-xl ${color}`}>
      <Icon size={14} className="mb-0.5 opacity-70" />
      <p className="font-bold text-sm leading-none">{value}  <span className="text-[10px] font-normal opacity-70">{unit}</span></p>
      <p className="text-[10px] opacity-60 mt-0.5">{label}</p>
    </div>
  )
}

// ── AI Analysis panel ──────────────────────────────────────────────────────
function AiAnalysisPanel({ log, onUpdated }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const analyse = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post(`/trainee/food-log/${log._id}/analyse`)
      onUpdated(res.data)
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בניתוח AI')
    } finally { setLoading(false) }
  }

  if (log.aiAnalysis) {
    const a = log.aiAnalysis
    return (
      <div className="mt-3 space-y-2">
        {/* Macros summary */}
        <div className="grid grid-cols-4 gap-1.5">
          <MacroPill icon={Flame}    label="קלוריות" value={a.totalCalories} unit="kcal" color="bg-orange-50 text-orange-700" />
          <MacroPill icon={Dumbbell} label="חלבון"   value={a.totalProtein}  unit="g"    color="bg-blue-50 text-blue-700"   />
          <MacroPill icon={Wheat}    label="פחמימות" value={a.totalCarbs}    unit="g"    color="bg-yellow-50 text-yellow-700"/>
          <MacroPill icon={Droplets} label="שומן"    value={a.totalFat}      unit="g"    color="bg-pink-50 text-pink-700"   />
        </div>

        {/* Food items breakdown */}
        {a.items?.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            {a.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium">{item.name}</span>
                <span className="text-gray-500">{item.calories} קל׳</span>
              </div>
            ))}
          </div>
        )}

        {/* AI note */}
        {a.notes && (
          <div className="bg-[#E6F7F8] rounded-xl px-3 py-2 flex items-start gap-2">
            <Sparkles size={12} className="text-[#00969E] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#007A81]">{a.notes}</p>
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-left">
          ניתוח AI · {a.confidence === 'high' ? 'דיוק גבוה' : a.confidence === 'medium' ? 'דיוק בינוני' : 'הערכה בלבד'}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button onClick={analyse} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-purple-400/20 disabled:opacity-60">
        {loading
          ? <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> מנתח עם AI...</>
          : <><Sparkles size={12} /> חשב קלוריות עם AI</>}
      </button>
    </div>
  )
}

// ── Log Card ───────────────────────────────────────────────────────────────
function LogCard({ log, onUpdated }) {
  const mc      = mealConfig[log.meal] || mealConfig.snack
  const timeStr = new Date(log.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <img src={getMediaUrl(log.imageUrl)} alt="ארוחה" className="w-full h-44 object-cover" />
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">{mc.emoji} {mc.label}</span>
          <span className="text-xs text-gray-400">{timeStr}</span>
        </div>
        {log.caption && <p className="text-sm text-gray-700 mb-1">{log.caption}</p>}
        {log.calories && !log.aiAnalysis && (
          <p className="text-xs text-orange-600 font-semibold">🔥 {log.calories} קל׳</p>
        )}
        {log.trainerNote && (
          <div className="mt-2 bg-[#E6F7F8] border border-[#00969E]/10 rounded-xl px-3 py-2">
            <p className="text-xs text-[#00969E] font-semibold mb-0.5 flex items-center gap-1">
              <CheckCircle size={11} /> פידבק מהמאמן
            </p>
            <p className="text-sm text-gray-700">{log.trainerNote}</p>
          </div>
        )}
        <AiAnalysisPanel log={log} onUpdated={onUpdated} />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TraineeFoodLog() {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)
  const today     = new Date()

  const [year,   setYear]   = useState(today.getFullYear())
  const [month,  setMonth]  = useState(today.getMonth())

  // Calendar dot data: { 'YYYY-MM-DD': { count, calories } }
  const [calData,     setCalData]     = useState({})
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0,10))
  const [logs,        setLogs]        = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Upload form
  const [showForm,     setShowForm]     = useState(false)
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form,         setForm]         = useState({ caption: '', meal: 'lunch' })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  // Load calendar dots for month
  useEffect(() => {
    api.get(`/trainee/food-log/calendar?year=${year}&month=${month + 1}`)
      .then(r => setCalData(r.data || {}))
      .catch(() => {})
  }, [year, month])

  // Load logs for selected date
  const loadDay = useCallback(async (dateStr) => {
    setLoadingLogs(true)
    const res = await api.get(`/trainee/food-log?date=${dateStr}`).catch(() => ({ data: [] }))
    setLogs(res.data || [])
    setLoadingLogs(false)
  }, [])

  useEffect(() => { loadDay(selectedDate) }, [selectedDate])

  const selectDate = (d) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    setSelectedDate(ds)
  }

  const handleImage = (e) => {
    const f = e.target.files[0]; if (!f) return
    setImageFile(f); setImagePreview(URL.createObjectURL(f)); setShowForm(true)
  }

  const submit = async () => {
    if (!imageFile) return
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      fd.append('caption', form.caption)
      fd.append('meal', form.meal)
      const res = await api.post('/trainee/food-log', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false); setImageFile(null); setImagePreview(null)
      setForm({ caption: '', meal: 'lunch' })
      // If log was made today, reload today
      const logDate = res.data.createdAt?.slice(0,10) || selectedDate
      if (logDate === selectedDate) setLogs(prev => [res.data, ...prev])
      // Update calendar dot
      setCalData(prev => {
        const d = { ...prev }
        if (!d[logDate]) d[logDate] = { count: 0, calories: 0 }
        d[logDate].count++
        return d
      })
    } catch (e) { setError(e.response?.data?.message || 'שגיאה') }
    finally { setSaving(false) }
  }

  const onLogUpdated = (updated) => {
    setLogs(prev => prev.map(l => l._id === updated._id ? updated : l))
    // Refresh calendar calories
    setCalData(prev => {
      const ds = updated.createdAt?.slice(0,10)
      if (!ds || !prev[ds]) return prev
      return { ...prev, [ds]: { ...prev[ds], calories: (prev[ds].calories || 0) + (updated.calories || 0) } }
    })
  }

  // Calendar helpers
  const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1)} else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){setMonth(0);setYear(y=>y+1)} else setMonth(m=>m+1) }
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const selectedDateLogs = logs
  const totalCalToday    = selectedDateLogs.reduce((s, l) => s + (l.calories || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 pt-10 pb-6 px-5 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <button onClick={() => navigate('/trainee')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors relative z-10">
          <ArrowRight size={16} /> חזרה
        </button>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">יומן אוכל</h1>
            <p className="text-white/70 text-sm mt-0.5">צלם ארוחות · קבל ניתוח קלוריות</p>
          </div>
          {totalCalToday > 0 && (
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
              <p className="text-white font-black text-xl leading-none">{totalCalToday}</p>
              <p className="text-white/70 text-xs">קל׳ היום</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ChevronRight size={15} className="text-gray-600" />
            </button>
            <span className="font-bold text-gray-900 text-sm">{MONTHS[month]} {year}</span>
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ChevronLeft size={15} className="text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-50">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 p-2 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const ds      = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const hasLog  = !!calData[ds]
              const isToday = ds === today.toISOString().slice(0,10)
              const isSel   = ds === selectedDate
              return (
                <button key={day} onClick={() => selectDate(day)}
                  className={[
                    'relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all',
                    isSel   ? 'bg-green-500 text-white shadow-md scale-105' :
                    isToday ? 'bg-green-50 text-green-700 ring-2 ring-green-400' :
                              'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}>
                  {day}
                  {hasLog && (
                    <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-green-400'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Upload button */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-3.5 bg-white border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 rounded-2xl flex items-center justify-center gap-2 transition-all group">
          <Camera size={18} className="text-green-500" />
          <span className="font-bold text-green-700 text-sm">צלם ארוחה עכשיו</span>
        </button>

        {/* Upload form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">הוסף פרטים</h3>
              <button onClick={() => { setShowForm(false); setImageFile(null); setImagePreview(null) }}
                className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                <X size={13} />
              </button>
            </div>
            {imagePreview && <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />}
            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">סוג ארוחה</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mealConfig).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(f => ({...f, meal: k}))}
                    className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.meal === k ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">תיאור (אופציונלי)</label>
              <input value={form.caption} onChange={e => setForm(f => ({...f, caption: e.target.value}))}
                placeholder="מה אכלת?"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
            </div>
            <button onClick={submit} disabled={saving}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-60">
              {saving ? 'שומר...' : 'שמור ארוחה ✓'}
            </button>
          </div>
        )}

        {/* Day logs */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-gray-700 text-sm">
              {selectedDate === today.toISOString().slice(0,10)
                ? 'היום'
                : new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {totalCalToday > 0 && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                🔥 {totalCalToday} קל׳
              </span>
            )}
          </div>

          {loadingLogs ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
            </div>
          ) : selectedDateLogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <Camera size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">לא צילמת ארוחות ביום זה</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateLogs.map(log => <LogCard key={log._id} log={log} onUpdated={onLogUpdated} />)}
            </div>
          )}
        </div>
      </div>

      <TraineeNav hasDiet={true} />
    </div>
  )
}
