import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Calendar, Share2,
  FileText, Settings, LogOut, Menu, X, ChevronLeft, Bell, MessageCircle,
  Target, AlertCircle, CreditCard
} from 'lucide-react'
import api from '../lib/api'
import OnboardingBot from './OnboardingBot'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'לוח בקרה' },
  { to: '/clients',   icon: Users,            label: 'לקוחות' },
  { to: '/leads',     icon: Target,           label: 'לידים' },
  { to: '/groups',    icon: Users,            label: 'קבוצות' },
  { to: '/programs',  icon: Dumbbell,         label: 'תוכניות' },
  { to: '/calendar',  icon: Calendar,         label: 'יומן' },
  { to: '/social',    icon: Share2,           label: 'רשתות חברתיות' },
  { to: '/invoices',  icon: FileText,         label: 'חשבוניות' },
]

const pageTitle = {
  '/dashboard': 'לוח בקרה',
  '/clients':   'לקוחות',
  '/leads':     'לידים',
  '/groups':    'קבוצות',
  '/programs':  'תוכניות',
  '/calendar':  'יומן',
  '/social':    'רשתות חברתיות',
  '/invoices':  'חשבוניות',
  '/settings':  'הגדרות',
  '/billing':   'מנוי וחיוב',
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState({ unreadMessages: 0, pendingRequests: 0 })
  const [subBanner, setSubBanner] = useState(null) // null | { type: 'trial'|'expired'|'blocked', days: number }

  useEffect(() => {
    const fetchUnread = () => api.get('/inbox/unread').then(r => setUnread(r.data)).catch(() => {})
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)

    // Subscription status check
    api.get('/subscription/my').then(r => {
      const sub = r.data
      if (sub.status === 'blocked') {
        setSubBanner({ type: 'blocked', days: 0 })
      } else if (sub.status === 'trial') {
        const days = sub.daysLeftInTrial ?? 0
        if (days <= 7) setSubBanner({ type: 'trial', days })
      } else if (sub.status === 'past_due') {
        setSubBanner({ type: 'expired', days: 0 })
      }
    }).catch(() => {})

    return () => clearInterval(interval)
  }, [])

  const totalBadge = unread.unreadMessages + unread.pendingRequests

  const handleLogout = () => { logout(); navigate('/login') }
  const title = Object.entries(pageTitle).find(([k]) => location.pathname.startsWith(k))?.[1] || ''

  return (
    <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — right side for RTL */}
      <aside
        style={{background: 'linear-gradient(180deg, #0A1628 0%, #0D1F3C 100%)'}}
        className={`fixed lg:static inset-y-0 right-0 z-30 w-64 flex flex-col transition-transform duration-300 order-last ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-[#00969E] flex items-center justify-center shadow-lg shadow-[#00969E]/30">
            <span className="text-white font-black text-sm">UW</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">UpWell</span>
            <p className="text-[10px] text-white/40 mt-0.5">פלטפורמת כושר</p>
          </div>
          <button className="mr-auto lg:hidden p-1" onClick={() => setOpen(false)}>
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">תפריט ראשי</p>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive ? 'bg-[#00969E] text-white shadow-lg shadow-[#00969E]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />
                  {label}
                  {isActive && <ChevronLeft size={14} className="mr-auto opacity-60" />}
                </>
              )}
            </NavLink>
          ))}


          <div className="pt-4">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">חשבון</p>
            <NavLink to="/settings" onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive ? 'bg-[#00969E] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }>
              {({ isActive }) => (
                <><Settings size={17} className={isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />הגדרות</>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00969E] to-[#22C55E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {user?.businessName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.businessName || 'העסק שלי'}</p>
              <p className="text-xs text-white/35 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors p-1" title="התנתק">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/clients')} className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={16} />
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {totalBadge > 99 ? '99+' : totalBadge}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00969E] to-[#22C55E] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm" onClick={() => navigate('/settings')}>
              {user?.businessName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Subscription banner */}
        {subBanner && (
          <div className={`px-6 py-2.5 flex items-center gap-3 text-sm font-medium ${
            subBanner.type === 'blocked' ? 'bg-red-500 text-white' :
            subBanner.type === 'expired' ? 'bg-red-400 text-white' :
            'bg-amber-400 text-amber-900'
          }`}>
            <AlertCircle size={15} />
            {subBanner.type === 'blocked' && <span>החשבון שלך חסום — <Link to="/billing" className="underline font-bold">שדרג עכשיו</Link> כדי להמשיך.</span>}
            {subBanner.type === 'expired'  && <span>תקופת הניסיון הסתיימה — <Link to="/billing" className="underline font-bold">בחר תכנית</Link> כדי להמשיך.</span>}
            {subBanner.type === 'trial'    && <span>נותרו <strong>{subBanner.days}</strong> ימים בתקופת הניסיון — <Link to="/billing" className="underline font-bold">שדרג</Link> כדי לא לאבד גישה.</span>}
            <button onClick={() => setSubBanner(null)} className="mr-auto opacity-70 hover:opacity-100"><X size={14} /></button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <OnboardingBot />
      </div>
    </div>
  )
}
