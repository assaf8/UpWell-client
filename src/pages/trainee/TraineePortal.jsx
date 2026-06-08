import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, Dumbbell, Apple, HeartPulse, ChevronLeft, TrendingUp, CheckCircle, Play, MessageCircle, Calendar, Clock } from 'lucide-react'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'

const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const typeConfig = {
  workout: { label: 'אימון', icon: Dumbbell, gradient: 'from-blue-500 to-blue-700', light: 'bg-blue-50 text-blue-600' },
  diet: { label: 'תזונה', icon: Apple, gradient: 'from-green-500 to-green-700', light: 'bg-green-50 text-green-600' },
  therapy: { label: 'טיפול', icon: HeartPulse, gradient: 'from-purple-500 to-purple-700', light: 'bg-purple-50 text-purple-600' },
}

export default function TraineePortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trainee/me').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'בוקר טוב'
    if (h < 17) return 'צהריים טובים'
    return 'ערב טוב'
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const activePrograms = data?.programs?.filter(p => p.status === 'active') || []
  const hasDiet = data?.programs?.some(p => p.program?.type === 'diet') || false
  const upcomingSessions = data?.nextSession ? [data.nextSession] : []
  const totalProgress = activePrograms.length > 0
    ? Math.round(activePrograms.reduce((s, p) => s + (p.progressPercentage || 0), 0) / activePrograms.length)
    : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #00969E 0%, #007A81 100%)'}}>
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" style={{borderWidth: 3}} />
        <p className="text-white/70 text-sm">טוען...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="relative overflow-hidden pb-24 pt-10 px-5" style={{background: 'linear-gradient(135deg, #00969E 0%, #007A81 60%, #005f66 100%)'}}>
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-8 right-8 w-24 h-24 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-[#00969E] font-black text-xs">UW</span>
            </div>
            <span className="text-white font-bold">UpWell</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-xl transition-colors">
            <LogOut size={13} /> יציאה
          </button>
        </div>

        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-black text-white mb-1">{data?.client?.name?.split(' ')[0] || user?.businessName?.split(' ')[0]} 💪</h1>
          <p className="text-white/60 text-sm">בואו נמשיך מאיפה שעצרנו!</p>
        </div>

        {/* Overall progress ring */}
        {activePrograms.length > 0 && (
          <div className="relative z-10 mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{totalProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-base">התקדמות כוללת</p>
              <p className="text-white/60 text-xs mt-0.5">{activePrograms.length} תוכניות פעילות</p>
            </div>
            <TrendingUp size={20} className="text-white/40 mr-auto" />
          </div>
        )}
      </div>

      {/* Programs list - overlaps hero */}
      <div className="px-4 -mt-16 relative z-10 pb-24 max-w-lg mx-auto">

        {/* ── Notification Cards ── */}
        {(data?.unreadCount > 0 || data?.nextSession || data?.pendingRequestsCount > 0) && (
          <div className="space-y-2 mb-4">
            {data?.unreadCount > 0 && (
              <Link to="/trainee/chat"
                className="flex items-center gap-3 bg-white rounded-2xl shadow-lg px-4 py-3 border-r-4 border-[#00969E] hover:shadow-xl transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#E6F7F8] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={17} className="text-[#00969E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">הודעה חדשה מהמאמן</p>
                  <p className="text-xs text-gray-400">{data.unreadCount} הודעות שלא נקראו</p>
                </div>
                <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {data.unreadCount > 9 ? '9+' : data.unreadCount}
                </span>
              </Link>
            )}

            {data?.nextSession && (
              <Link to="/trainee/book"
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/20 px-4 py-3 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white uppercase">
                    {MONTHS[new Date(data.nextSession.date).getMonth()].slice(0,3)}
                  </span>
                  <span className="text-xl font-black text-white leading-none">{new Date(data.nextSession.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">האימון הקרוב שלי</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {new Date(data.nextSession.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {data.nextSession.time && ` · ${data.nextSession.time}`}
                    {data.nextSession.duration && ` · ${data.nextSession.duration} דק׳`}
                  </p>
                </div>
                <CheckCircle size={18} className="text-white/70 flex-shrink-0" />
              </Link>
            )}

            {data?.pendingRequestsCount > 0 && (
              <Link to="/trainee/book"
                className="flex items-center gap-3 bg-white rounded-2xl shadow-lg px-4 py-3 border-r-4 border-yellow-400 hover:shadow-xl transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={17} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">בקשת אימון ממתינה</p>
                  <p className="text-xs text-gray-400">המאמן טרם אישר את הבקשה</p>
                </div>
              </Link>
            )}
          </div>
        )}

        <h2 className="text-base font-bold text-white mb-3 px-1">התוכניות שלי</h2>

        {activePrograms.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <Dumbbell size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">אין תוכניות פעילות עדיין</p>
            <p className="text-gray-400 text-sm mt-1">המאמן שלך ישייך לך תוכנית בקרוב</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activePrograms.map(cp => {
              const tc = typeConfig[cp.program?.type] || typeConfig.workout
              const Icon = tc.icon
              const weeksLeft = (cp.program?.duration || 0) - (cp.currentWeek || 1) + 1
              return (
                <Link key={cp._id} to={`/trainee/programs/${cp._id}`}
                  className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow active:scale-[0.99]">
                  {/* Top gradient bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${tc.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tc.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{cp.program?.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.light}`}>{tc.label}</span>
                          <span className="text-xs text-gray-400">שבוע {cp.currentWeek} מתוך {cp.program?.duration}</span>
                        </div>
                      </div>
                      <ChevronLeft size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">התקדמות</span>
                        <span className="text-xs font-bold text-[#00969E]">{cp.progressPercentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${tc.gradient} rounded-full transition-all duration-700`}
                          style={{ width: `${cp.progressPercentage}%` }} />
                      </div>
                      <p className="text-xs text-gray-400">{weeksLeft} שבועות נותרו</p>
                    </div>
                  </div>

                  {/* CTA bar */}
                  <div className={`bg-gradient-to-r ${tc.gradient} px-5 py-3 flex items-center justify-between`}>
                    <span className="text-white text-sm font-semibold">המשך לשבוע {cp.currentWeek}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Play size={14} className="text-white" fill="white" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Completed programs */}
        {data?.programs?.filter(p => p.status === 'completed').length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">הושלמו 🏆</h2>
            <div className="space-y-3">
              {data.programs.filter(p => p.status === 'completed').map(cp => {
                const tc = typeConfig[cp.program?.type] || typeConfig.workout
                return (
                  <div key={cp._id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm opacity-70">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 text-sm">{cp.program?.title}</p>
                      <p className="text-xs text-gray-400">הושלם ✓</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.light}`}>{tc.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">מופעל על ידי <span className="font-semibold text-[#00969E]">UpWell</span></p>
        </div>
      </div>

      <TraineeNav unread={data?.unreadCount || 0} hasDiet={hasDiet} hasSession={!!data?.nextSession} />
    </div>
  )
}
