import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Dumbbell, Apple, HeartPulse, Users, Clock, Search, Trash2 } from 'lucide-react'
import api from '../lib/api'

const typeConfig = {
  workout: { label: 'אימון', icon: Dumbbell, gradient: 'from-blue-500 to-blue-700', badge: 'bg-blue-50 text-blue-600' },
  diet: { label: 'תזונה', icon: Apple, gradient: 'from-green-500 to-green-700', badge: 'bg-green-50 text-green-600' },
  therapy: { label: 'טיפול', icon: HeartPulse, gradient: 'from-purple-500 to-purple-700', badge: 'bg-purple-50 text-purple-600' },
}
const levelLabel = { beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם' }
const levelColor = { beginner: 'text-green-600 bg-green-50', intermediate: 'text-orange-600 bg-orange-50', advanced: 'text-red-600 bg-red-50' }

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/programs').then(r => setPrograms(r.data || [])).finally(() => setLoading(false))
  }, [])

  const deleteProgram = async (e, id) => {
    e.preventDefault()
    if (!confirm('למחוק את התוכנית? פעולה זו אינה ניתנת לביטול.')) return
    setDeletingId(id)
    try {
      await api.delete(`/programs/${id}`)
      setPrograms(prev => prev.filter(p => p._id !== id))
    } catch {
      alert('שגיאה במחיקה — נסה שוב')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = programs.filter(p => {
    const matchType = filter === 'all' || p.type === filter
    const matchSearch = !search || p.title.includes(search)
    return matchType && matchSearch
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{programs.length} תוכניות בספרייה</p>
        <Link to="/programs/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
          <Plus size={16} /> תוכנית חדשה
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש תוכניות..."
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] shadow-sm" />
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {[
            { key: 'all', label: 'הכל' },
            { key: 'workout', label: 'אימון' },
            { key: 'diet', label: 'תזונה' },
            { key: 'therapy', label: 'טיפול' },
          ].map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === t.key ? 'bg-[#00969E] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-52"><div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" /><div className="h-4 bg-gray-100 rounded w-3/4 mb-2" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Dumbbell size={36} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">{search ? 'לא נמצאו תוכניות' : 'אין תוכניות עדיין'}</h3>
          <p className="text-gray-400 text-sm mb-5">צור תוכנית פעם אחת, שייך ללקוחות מרובים</p>
          {!search && (
            <Link to="/programs/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-semibold hover:bg-[#007A81] transition-colors shadow-lg shadow-[#00969E]/20">
              <Plus size={15} /> צור תוכנית ראשונה
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const tc = typeConfig[p.type] || typeConfig.workout
            const Icon = tc.icon
            return (
              <Link key={p._id} to={`/programs/${p._id}`}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${tc.gradient}`} />
                <button
                  onClick={(e) => deleteProgram(e, p._id)}
                  disabled={deletingId === p._id}
                  className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 transition-all z-10"
                >
                  {deletingId === p._id
                    ? <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    : <Trash2 size={14} />}
                </button>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shadow-md`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.badge}`}>{tc.label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#00969E] transition-colors">{p.title}</h3>
                  {p.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> {p.duration} שב׳</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={11} /> {p.assignedCount || 0} לקוחות</span>
                    <span className={`mr-auto text-xs font-medium px-2 py-0.5 rounded-full ${levelColor[p.level] || levelColor.beginner}`}>{levelLabel[p.level] || p.level}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
