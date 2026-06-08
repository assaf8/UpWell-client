import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Calendar, Camera, TrendingUp } from 'lucide-react'

export default function TraineeNav({ unread = 0, hasDiet = false, hasSession = false }) {
  const base     = 'flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-colors'
  const active   = 'text-[#00969E]'
  const inactive = 'text-gray-400'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20 max-w-lg mx-auto">
      <div className="flex items-center justify-around">
        <NavLink to="/trainee" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <Home size={20} />
          <span>בית</span>
        </NavLink>

        <NavLink to="/trainee/book" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <div className="relative">
            <Calendar size={20} />
            {hasSession && (
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span>יומן</span>
        </NavLink>

        <NavLink to="/trainee/chat" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <div className="relative">
            <MessageCircle size={20} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <span>צ׳אט</span>
        </NavLink>

        <NavLink to="/trainee/progress" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <TrendingUp size={20} />
          <span>התקדמות</span>
        </NavLink>

        <NavLink to="/trainee/food-log" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <Camera size={20} />
          <span>יומן אוכל</span>
        </NavLink>
      </div>
    </nav>
  )
}
