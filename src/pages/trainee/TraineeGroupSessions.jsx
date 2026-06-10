import { useEffect, useState } from 'react'
import { Users, Clock, MapPin, RefreshCw, CheckCircle, X } from 'lucide-react'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'
import { useAuth } from '../../contexts/AuthContext'

const FREQ_HE = { daily: 'יומי', weekly: 'שבועי', biweekly: 'דו-שבועי', monthly: 'חודשי' }

export default function TraineeGroupSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.trainer) return
    api.get(`/group-sessions/available/${user.trainer}`)
      .then(r => setSessions(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const register = async (id) => {
    setActionId(id); setError('')
    try {
      const res = await api.post(`/group-sessions/${id}/register`)
      setSessions(prev => prev.map(s => s._id === id ? { ...res.data, spotsLeft: res.data.maxParticipants - res.data.registrations.length, isRegistered: true } : s))
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה ברישום')
    } finally { setActionId(null) }
  }

  const unregister = async (id) => {
    setActionId(id); setError('')
    try {
      await api.delete(`/group-sessions/${id}/register`)
      setSessions(prev => prev.map(s => s._id === id ? { ...s, isRegistered: false, spotsLeft: (s.spotsLeft ?? 0) + 1 } : s))
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בביטול הרישום')
    } finally { setActionId(null) }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-5">
        <h1 className="text-xl font-bold text-gray-900">אימונים קבוצתיים</h1>
        <p className="text-sm text-gray-400 mt-0.5">הירשם לאימון — המאמן יראה אותך ברשימה</p>
      </div>

      <div className="p-5 space-y-3">
        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-32" />)
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500">אין אימונים קבוצתיים פתוחים</p>
            <p className="text-sm text-gray-400 mt-1">המאמן יפרסם אימונים בקרוב</p>
          </div>
        ) : (
          sessions.map(s => {
            const date = new Date(s.date)
            const dateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
            const isFull = s.spotsLeft <= 0 && !s.isRegistered
            return (
              <div key={s._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${s.isRegistered ? 'border-[#00969E]' : 'border-gray-100'}`}>
                {s.isRegistered && <div className="h-1 bg-[#00969E]" />}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{s.title}</p>
                        {s.isRegistered && (
                          <span className="flex items-center gap-1 text-xs bg-[#E6F7F8] text-[#00969E] px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle size={10} /> רשום
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-600 font-medium flex items-center gap-1"><Users size={11} /> {s.group?.name}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${
                      isFull ? 'bg-red-50 text-red-500' :
                      s.spotsLeft <= 2 ? 'bg-orange-50 text-orange-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {isFull ? 'מלא' : `${s.spotsLeft} מקומות`}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-gray-500">📅 {dateStr}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5"><Clock size={12} /> {s.time} · {s.duration} דקות</p>
                    {s.location && <p className="text-sm text-gray-500 flex items-center gap-1.5"><MapPin size={12} /> {s.location}</p>}
                    {s.isRecurring && <p className="text-xs text-gray-400 flex items-center gap-1.5"><RefreshCw size={11} /> אימון קבוע — {FREQ_HE[s.frequency]}</p>}
                  </div>

                  {s.isRegistered ? (
                    <button onClick={() => unregister(s._id)} disabled={actionId === s._id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60">
                      {actionId === s._id ? 'מבטל...' : <><X size={14} /> בטל רישום</>}
                    </button>
                  ) : (
                    <button onClick={() => register(s._id)} disabled={isFull || actionId === s._id}
                      className="w-full py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {actionId === s._id ? 'נרשם...' : isFull ? 'האימון מלא' : 'הירשם לאימון'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <TraineeNav />
    </div>
  )
}
