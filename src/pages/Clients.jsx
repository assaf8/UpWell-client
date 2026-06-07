import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Phone, Mail, ArrowLeft, Trash2, Users } from 'lucide-react'
import api from '../lib/api'

const COLORS = ['from-[#00969E]/20 to-[#00969E]/10 text-[#00969E]', 'from-purple-100 to-purple-50 text-purple-600', 'from-orange-100 to-orange-50 text-orange-600', 'from-green-100 to-green-50 text-green-600', 'from-pink-100 to-pink-50 text-pink-600']

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = (q = '') => {
    setLoading(true)
    api.get(`/clients?search=${q}`).then(r => setClients(r.data.clients || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const del = async (id, e) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('האם למחוק לקוח זה?')) return
    await api.delete(`/clients/${id}`)
    setClients(prev => prev.filter(c => c._id !== id))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{clients.length} לקוחות סה״כ</p>
        <Link to="/clients/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
          <Plus size={16} /> הוסף לקוח
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="חיפוש לפי שם, טלפון או אימייל..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] shadow-sm transition-all" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-44">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">{search ? 'לא נמצאו תוצאות' : 'אין לקוחות עדיין'}</h3>
          <p className="text-gray-400 text-sm mb-5">{search ? 'נסה מונח חיפוש אחר' : 'הוסף את הלקוח הראשון שלך כדי להתחיל'}</p>
          {!search && (
            <Link to="/clients/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-semibold hover:bg-[#007A81] transition-colors shadow-lg shadow-[#00969E]/20">
              <Plus size={15} /> הוסף לקוח ראשון
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c, i) => (
            <Link key={c._id} to={`/clients/${c._id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#00969E]/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center font-bold text-lg`}>
                  {c.name[0]}
                </div>
                <button onClick={(e) => del(c._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{c.name}</h3>
              <div className="space-y-1">
                {c.phone && <div className="flex items-center gap-2 text-xs text-gray-400"><Phone size={11} className="flex-shrink-0" /> {c.phone}</div>}
                {c.email && <div className="flex items-center gap-2 text-xs text-gray-400"><Mail size={11} className="flex-shrink-0" /><span className="truncate">{c.email}</span></div>}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">נוסף {new Date(c.createdAt).toLocaleDateString('he-IL')}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#00969E]">
                  <ArrowLeft size={12} /> צפה
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
