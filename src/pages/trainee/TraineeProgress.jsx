import { useEffect, useState } from 'react'
import { ArrowRight, Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'

const METRICS = [
  { key: 'weight',          label: 'משקל',      unit: 'ק"ג',  color: '#00969E' },
  { key: 'bodyFat',         label: '% שומן',     unit: '%',    color: '#f97316' },
  { key: 'measurements.waist', label: 'מותניים', unit: 'ס"מ', color: '#8b5cf6' },
  { key: 'measurements.chest', label: 'חזה',     unit: 'ס"מ', color: '#22c55e' },
]

function getValue(log, key) {
  if (key.startsWith('measurements.')) {
    const sub = key.split('.')[1]
    return log.measurements?.[sub]
  }
  return log[key]
}

function formatDate(d) {
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

function TrendBadge({ data, metricKey }) {
  if (data.length < 2) return null
  const first = getValue(data[0],  metricKey)
  const last  = getValue(data[data.length - 1], metricKey)
  if (first == null || last == null) return null
  const diff = +(last - first).toFixed(1)
  if (diff === 0) return <span className="text-xs text-gray-400 flex items-center gap-1"><Minus size={12} /> ללא שינוי</span>
  if (diff < 0)   return <span className="text-xs text-green-600 flex items-center gap-1 font-semibold"><TrendingDown size={12} /> {diff}</span>
  return <span className="text-xs text-orange-500 flex items-center gap-1 font-semibold"><TrendingUp size={12} /> +{diff}</span>
}

// Custom tooltip
function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 px-3 py-2 text-xs">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-gray-900">{payload[0].value} {unit}</p>
    </div>
  )
}

export default function TraineeProgress() {
  const navigate = useNavigate()
  const today    = new Date().toISOString().slice(0, 10)

  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [activeKey,  setActiveKey]  = useState('weight')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [form, setForm] = useState({
    date: today, weight: '', bodyFat: '',
    chest: '', waist: '', hips: '', thigh: '', arm: '', notes: '',
  })

  useEffect(() => {
    api.get('/progress/me?limit=60')
      .then(r => setLogs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setError('')
    try {
      const body = {
        date:    form.date,
        weight:  form.weight  ? +form.weight  : undefined,
        bodyFat: form.bodyFat ? +form.bodyFat : undefined,
        notes:   form.notes || undefined,
        measurements: {
          chest: form.chest ? +form.chest : undefined,
          waist: form.waist ? +form.waist : undefined,
          hips:  form.hips  ? +form.hips  : undefined,
          thigh: form.thigh ? +form.thigh : undefined,
          arm:   form.arm   ? +form.arm   : undefined,
        },
      }
      const res = await api.post('/progress/me', body)
      setLogs(prev => {
        const idx = prev.findIndex(l => l.date === res.data.date)
        if (idx >= 0) { const n = [...prev]; n[idx] = res.data; return n }
        return [...prev, res.data].sort((a, b) => a.date.localeCompare(b.date))
      })
      setShowForm(false)
      setForm({ date: today, weight: '', bodyFat: '', chest: '', waist: '', hips: '', thigh: '', arm: '', notes: '' })
    } catch (e) { setError(e.response?.data?.message || 'שגיאה') }
    finally { setSaving(false) }
  }

  const activeMetric = METRICS.find(m => m.key === activeKey) || METRICS[0]

  const chartData = logs
    .map(l => ({ date: formatDate(l.date), value: getValue(l, activeKey) }))
    .filter(d => d.value != null)

  const latest = logs[logs.length - 1]

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00969E] to-[#005f66] pt-10 pb-6 px-5 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <button onClick={() => navigate('/trainee')}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors relative z-10">
          <ArrowRight size={16} /> חזרה
        </button>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">התקדמות</h1>
            <p className="text-white/70 text-sm mt-0.5">מעקב מדדים לאורך זמן</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur transition-all">
            <Plus size={15} /> הוסף מדד
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Latest stats strip */}
        {latest && (
          <div className="grid grid-cols-2 gap-3">
            {latest.weight != null && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-0.5">משקל נוכחי</p>
                <p className="text-2xl font-black text-gray-900">{latest.weight} <span className="text-sm font-normal text-gray-400">ק"ג</span></p>
                <TrendBadge data={logs} metricKey="weight" />
              </div>
            )}
            {latest.bodyFat != null && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-0.5">שומן גוף</p>
                <p className="text-2xl font-black text-gray-900">{latest.bodyFat}<span className="text-sm font-normal text-gray-400">%</span></p>
                <TrendBadge data={logs} metricKey="bodyFat" />
              </div>
            )}
          </div>
        )}

        {/* Metric tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setActiveKey(m.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeKey === m.key
                  ? 'text-white shadow-md'
                  : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
              style={activeKey === m.key ? { backgroundColor: m.color } : {}}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{activeMetric.label}</h3>
              <p className="text-xs text-gray-400">{chartData.length} מדידות</p>
            </div>
            <TrendBadge data={logs} metricKey={activeKey} />
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
            </div>
          ) : chartData.length < 2 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <TrendingUp size={28} className="text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">הוסף לפחות 2 מדידות כדי לראות גרף</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit={activeMetric.unit} />} />
                <Line
                  type="monotone" dataKey="value" stroke={activeMetric.color}
                  strokeWidth={2.5} dot={{ fill: activeMetric.color, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Log history */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-gray-700 text-sm px-1">היסטוריה</h3>
            {[...logs].reverse().slice(0, 10).map(log => (
              <div key={log._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(log.date + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {log.weight    != null && <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">⚖️ {log.weight} ק"ג</span>}
                  {log.bodyFat   != null && <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">🔥 {log.bodyFat}% שומן</span>}
                  {log.measurements?.waist != null && <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">📏 מותן {log.measurements.waist} ס"מ</span>}
                  {log.measurements?.chest != null && <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">📏 חזה {log.measurements.chest} ס"מ</span>}
                  {log.measurements?.hips  != null && <span className="text-xs bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full font-medium">📏 ירכיים {log.measurements.hips} ס"מ</span>}
                </div>
                {log.notes && <p className="text-xs text-gray-500 mt-2 italic">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add-log form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">הוסף מדידה</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">תאריך</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} dir="ltr"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'weight',  l: 'משקל (ק"ג)' },
                  { k: 'bodyFat', l: 'שומן גוף (%)' },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l}</label>
                    <input type="number" step="0.1" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} dir="ltr"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">מדידות גוף (ס"מ)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'chest', l: 'חזה' }, { k: 'waist', l: 'מותניים' },
                  { k: 'hips',  l: 'ירכיים' }, { k: 'thigh', l: 'ירך' },
                  { k: 'arm',   l: 'זרוע' },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{l}</label>
                    <input type="number" step="0.5" value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} dir="ltr"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">הערות</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none" />
              </div>

              <button onClick={save} disabled={saving}
                className="w-full py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
                {saving ? 'שומר...' : 'שמור מדידה ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TraineeNav />
    </div>
  )
}
