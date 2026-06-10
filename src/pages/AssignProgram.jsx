import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle, Users } from 'lucide-react'
import api from '../lib/api'

export default function AssignProgram() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/programs/${id}`).then(r => setProgram(r.data)).catch(() => {})
    api.get('/clients').then(r => setClients(r.data.clients || [])).catch(() => {})
  }, [id])

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const assign = async () => {
    if (!selected) return setError('נא לבחור לקוח')
    setLoading(true); setError('')
    try {
      await api.post('/client-programs', { clientId: selected, programId: id, startDate })
      navigate(`/programs/${id}`)
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בשיוך התוכנית')
    } finally { setLoading(false) }
  }

  const selectedClient = clients.find(c => c._id === selected)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/programs/${id}`} className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">שייך תוכנית</h2>
          {program && <p className="text-xs text-gray-400 mt-0.5">{program.title}</p>}
        </div>
      </div>

      <div className="grid gap-4">
        {/* Program card */}
        {program && (
          <div className="bg-gradient-to-r from-[#00969E] to-[#007A81] rounded-2xl p-5 text-white shadow-lg shadow-[#00969E]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold">{program.title}</p>
                <p className="text-white/70 text-sm capitalize">{program.type} · {program.duration} שבועות · {program.level}</p>
              </div>
            </div>
          </div>
        )}

        {/* Client selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">בחר לקוח</h3>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לקוחות..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
            {filtered.map(c => (
              <button key={c._id} onClick={() => setSelected(c._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selected === c._id ? 'bg-[#E6F7F8]' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00969E]/20 to-[#00969E]/10 flex items-center justify-center text-[#00969E] font-bold text-sm flex-shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">{c.name}</span>
                {selected === c._id && <CheckCircle size={16} className="text-[#00969E]" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-6">לא נמצאו לקוחות</p>}
          </div>
        </div>

        {/* Start date */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3">תאריך התחלה</h3>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
        </div>

        {/* Action */}
        <div className="flex gap-3">
          <button onClick={assign} disabled={loading || !selected}
            className="flex-1 py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />משייך...
              </span>
            ) : selectedClient ? `שייך ל${selectedClient.name}` : 'בחר לקוח תחילה'}
          </button>
          <Link to={`/programs/${id}`} className="px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            ביטול
          </Link>
        </div>
      </div>
    </div>
  )
}
