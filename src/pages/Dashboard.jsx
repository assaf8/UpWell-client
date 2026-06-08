import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Dumbbell, Calendar, TrendingUp, ArrowLeft, Plus, ArrowUpRight, MessageCircle, Clock, Bell } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const sessionData = [
  { month: 'ינו', sessions: 12 }, { month: 'פבר', sessions: 18 },
  { month: 'מרץ', sessions: 15 }, { month: 'אפר', sessions: 22 },
  { month: 'מאי', sessions: 28 }, { month: 'יונ', sessions: 24 },
]
const revenueData = [
  { month: 'ינו', revenue: 4200 }, { month: 'פבר', revenue: 5800 },
  { month: 'מרץ', revenue: 5100 }, { month: 'אפר', revenue: 7200 },
  { month: 'מאי', revenue: 8900 }, { month: 'יונ', revenue: 7600 },
]

function StatCard({ label, value, icon: Icon, gradient, change, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight size={11} />{change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-[#00969E] mt-1 font-medium">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="font-bold">{prefix}{payload[0].value?.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentClients, setRecentClients] = useState([])
  const [inbox, setInbox] = useState({ unreadMessages: 0, pendingRequests: 0 })

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/clients?limit=5').then(r => setRecentClients(r.data.clients || [])).catch(() => {})
    api.get('/inbox/unread').then(r => setInbox(r.data)).catch(() => {})
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'בוקר טוב'
    if (h < 17) return 'צהריים טובים'
    return 'ערב טוב'
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.businessName?.split(' ')[0] || 'שם'} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">הנה מה שקורה בעסק שלך היום.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <Calendar size={14} />
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Notifications */}
      {(inbox.unreadMessages > 0 || inbox.pendingRequests > 0) && (
        <div className="flex flex-wrap gap-3">
          {inbox.unreadMessages > 0 && (
            <Link to="/clients"
              className="flex items-center gap-3 bg-white border border-red-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">הודעות שלא נקראו</p>
                <p className="text-xs text-gray-400">{inbox.unreadMessages} הודעות מלקוחות ממתינות לתשובה</p>
              </div>
              <span className="mr-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                {inbox.unreadMessages}
              </span>
            </Link>
          )}
          {inbox.pendingRequests > 0 && (
            <Link to="/calendar?tab=requests"
              className="flex items-center gap-3 bg-white border border-yellow-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">בקשות אימון חדשות</p>
                <p className="text-xs text-gray-400">{inbox.pendingRequests} בקשות ממתינות לאישור</p>
              </div>
              <span className="mr-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                {inbox.pendingRequests}
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="סה״כ לקוחות" value={stats?.clients ?? 0} icon={Users} gradient="from-[#00969E] to-[#007A81]" change="+12%" />
        <StatCard label="תוכניות" value={stats?.programs ?? 0} icon={Dumbbell} gradient="from-purple-500 to-purple-700" change="+5%" />
        <StatCard label="אימונים החודש" value={stats?.sessions ?? 0} icon={Calendar} gradient="from-orange-400 to-orange-600" />
        <StatCard label="תוכניות פעילות" value={stats?.activePrograms ?? 0} icon={TrendingUp} gradient="from-green-400 to-green-600" sub="מושבצות ופעילות" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">סקירת אימונים</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 חודשים אחרונים</p>
            </div>
            <span className="text-xs font-medium text-[#00969E] bg-[#E6F7F8] px-3 py-1 rounded-full">חודשי</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={sessionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00969E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00969E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Rubik' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sessions" stroke="#00969E" strokeWidth={2.5} fill="url(#colorSessions)" dot={false} activeDot={{ r: 5, fill: '#00969E' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">הכנסות</h3>
              <p className="text-xs text-gray-400 mt-0.5">₪ לחודש</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Rubik' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip prefix="₪" />} />
              <Bar dataKey="revenue" fill="#00969E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">פעולות מהירות</h3>
          <div className="space-y-2">
            {[
              { to: '/clients/new', label: 'הוסף לקוח חדש', sub: 'צור פרופיל לקוח', color: 'bg-[#E6F7F8] text-[#00969E]' },
              { to: '/programs/new', label: 'צור תוכנית', sub: 'בנה תוכנית אימון', color: 'bg-purple-50 text-purple-600' },
              { to: '/invoices', label: 'חשבונית חדשה', sub: 'חייב לקוח', color: 'bg-orange-50 text-orange-600' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center`}>
                  <Plus size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.sub}</p>
                </div>
                <ArrowLeft size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">לקוחות אחרונים</h3>
            <Link to="/clients" className="text-xs text-[#00969E] font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft size={12} />כל הלקוחות
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">אין לקוחות עדיין</p>
              <Link to="/clients/new" className="text-sm text-[#00969E] font-semibold hover:underline">הוסף לקוח ראשון ←</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentClients.map(c => (
                <li key={c._id}>
                  <Link to={`/clients/${c._id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00969E]/20 to-[#00969E]/10 flex items-center justify-center text-[#00969E] font-bold text-sm flex-shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.email || c.phone || 'אין פרטי קשר'}</p>
                    </div>
                    <ArrowLeft size={14} className="text-gray-300 group-hover:text-[#00969E] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
