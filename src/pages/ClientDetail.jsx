import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Phone, Mail, Target, AlertCircle, Plus, Dumbbell, TrendingUp, UserCheck, X, Eye, EyeOff, CheckCircle, MessageCircle, Camera, Send, Flame, Wheat, Droplets } from 'lucide-react'
import api from '../lib/api'
import { getMediaUrl } from '../lib/media'

function InviteModal({ client, onClose }) {
  const [email, setEmail] = useState(client.email || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    api.get(`/auth/trainee-for-client/${client._id}`)
      .then(r => setExisting(r.data))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [client._id])

  const submit = async () => {
    if (!email || !password) return setError('נא למלא אימייל וסיסמה')
    if (password.length < 6) return setError('סיסמה חייבת להיות לפחות 6 תווים')
    setLoading(true); setError('')
    try {
      await api.post('/auth/invite-trainee', { clientId: client._id, email, password })
      setDone(true)
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה — נסה שוב')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">הזמנת לקוח לפורטל</h2>
            <p className="text-xs text-gray-400 mt-0.5">{client.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>

        <div className="p-5">
          {checking ? (
            <div className="py-6 text-center"><div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin mx-auto" /></div>
          ) : done ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <p className="font-bold text-gray-900 mb-1">חשבון נוצר בהצלחה!</p>
              <p className="text-sm text-gray-500">שלח ל-{client.name}:</p>
              <div className="mt-3 bg-gray-50 rounded-xl p-3 text-right text-sm space-y-1">
                <p><span className="text-gray-400">אימייל: </span><span className="font-medium">{email}</span></p>
                <p><span className="text-gray-400">סיסמה: </span><span className="font-medium">{password}</span></p>
              </div>
              <button onClick={onClose} className="mt-4 w-full py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-semibold">סגור</button>
            </div>
          ) : existing ? (
            <div className="py-4 text-center">
              <div className="w-12 h-12 bg-[#E6F7F8] rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck size={22} className="text-[#00969E]" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">יש כבר חשבון</p>
              <p className="text-sm text-gray-500">אימייל: <span className="font-medium text-gray-700">{existing.email}</span></p>
              <button onClick={onClose} className="mt-4 w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">סגור</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">צור פרטי כניסה עבור {client.name} לפורטל המתאמן.</p>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">אימייל</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">סיסמה</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} dir="ltr"
                    placeholder="לפחות 6 תווים"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] pr-10" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button onClick={submit} disabled={loading}
                className="w-full py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
                {loading ? 'יוצר חשבון...' : 'צור חשבון מתאמן'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChatTab({ clientId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    api.get(`/inbox/chat/${clientId}`).then(r => setMessages(r.data || [])).catch(() => {})
  }, [clientId])

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      const { data } = await api.post(`/inbox/chat/${clientId}`, { text })
      setMessages(m => [...m, data])
      setText('')
    } catch {} finally { setSending(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-96">
      <div className="px-5 py-3 border-b border-gray-50 font-semibold text-gray-900 text-sm flex items-center gap-2">
        <MessageCircle size={15} className="text-[#00969E]" /> צ׳אט עם לקוח
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && <p className="text-center text-xs text-gray-400 mt-8">אין הודעות עדיין</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'trainer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.sender === 'trainer' ? 'bg-[#E6F7F8] text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-50 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="כתוב הודעה..." dir="rtl"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
        <button onClick={send} disabled={sending || !text.trim()}
          className="px-4 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

function FoodDiaryTab({ clientId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/inbox/food-log/${clientId}`).then(r => setLogs(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [clientId])

  if (loading) return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" /></div>

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-50 font-semibold text-gray-900 text-sm flex items-center gap-2">
        <Camera size={15} className="text-[#00969E]" /> יומן אוכל
      </div>
      {logs.length === 0 ? (
        <div className="py-12 text-center"><Camera size={28} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-400">אין רשומות עדיין</p></div>
      ) : (
        <div className="divide-y divide-gray-50">
          {logs.map(log => (
            <div key={log._id} className="p-4 flex gap-3">
              {log.imageUrl && <img src={getMediaUrl(log.imageUrl)} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">{log.caption || 'ארוחה'}</p>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString('he-IL')}</p>
                </div>
                {log.aiAnalysis?.totalCalories && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-orange-600"><Flame size={11} />{log.aiAnalysis.totalCalories} קל׳</span>
                    <span className="flex items-center gap-1 text-blue-600">{log.aiAnalysis.totalProtein}g חלבון</span>
                    <span className="flex items-center gap-1 text-yellow-600"><Wheat size={11} />{log.aiAnalysis.totalCarbs}g פחמימות</span>
                    <span className="flex items-center gap-1 text-pink-600"><Droplets size={11} />{log.aiAnalysis.totalFat}g שומן</span>
                  </div>
                )}
                {log.aiAnalysis?.notes && <p className="text-xs text-gray-400 mt-1">{log.aiAnalysis.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [programs, setPrograms] = useState([])
  const [showInvite, setShowInvite] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    api.get(`/clients/${id}`).then(r => setClient(r.data)).catch(() => {})
    api.get(`/clients/${id}/programs`).then(r => setPrograms(r.data || [])).catch(() => {})
  }, [id])

  if (!client) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading client...</p>
      </div>
    </div>
  )

  const typeStyle = {
    workout: 'bg-blue-50 text-blue-600 border-blue-100',
    diet: 'bg-green-50 text-green-600 border-green-100',
    therapy: 'bg-purple-50 text-purple-600 border-purple-100',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showInvite && <InviteModal client={client} onClose={() => setShowInvite(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/clients" className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div>
            <h2 className="font-bold text-gray-900">{client.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Client since {new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F8] border border-[#00969E]/20 text-[#00969E] rounded-xl text-sm font-medium hover:bg-[#00969E] hover:text-white shadow-sm transition-all">
            <UserCheck size={14} /> פורטל מתאמן
          </button>
          <Link to={`/clients/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm mb-4 w-fit">
        {[{id:'overview',label:'סקירה'},{id:'chat',label:'💬 צ׳אט'},{id:'food',label:'🍽️ יומן אוכל'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[#00969E] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{display: tab === 'chat' ? 'block' : 'none'}}><ChatTab clientId={id} /></div>
      <div style={{display: tab === 'food' ? 'block' : 'none'}}><FoodDiaryTab clientId={id} /></div>
      {tab === 'overview' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00969E] to-[#007A81] flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-lg shadow-[#00969E]/20">
              {client.name[0].toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
            <div className="mt-4 space-y-2">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#00969E] transition-colors">
                  <Phone size={14} className="text-[#00969E]" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#00969E] transition-colors">
                  <Mail size={14} className="text-[#00969E]" /> {client.email}
                </a>
              )}
            </div>
          </div>

          {/* Stats mini */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-[#00969E]" /> Progress</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#00969E]">{programs.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Programs</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {programs.length > 0 ? Math.round(programs.reduce((s,p) => s + (p.progressPercentage||0), 0) / programs.length) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Avg Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {client.goals && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#E6F7F8] rounded-lg flex items-center justify-center"><Target size={14} className="text-[#00969E]" /></div>
                Goals
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">{client.goals}</p>
            </div>
          )}

          {client.medicalNotes && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center"><AlertCircle size={14} className="text-orange-500" /></div>
                Medical Notes
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">{client.medicalNotes}</p>
            </div>
          )}

          {/* Programs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Dumbbell size={15} className="text-[#00969E]" /> Programs
              </h4>
              <Link to={`/clients/${id}/assign-program`}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#00969E] bg-[#E6F7F8] hover:bg-[#00969E] hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={12} /> Assign Program
              </Link>
            </div>
            {programs.length === 0 ? (
              <div className="py-10 text-center">
                <Dumbbell size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 mb-3">No programs assigned yet</p>
                <Link to={`/clients/${id}/assign-program`} className="text-sm text-[#00969E] font-semibold hover:underline">Assign first program →</Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {programs.map(cp => (
                  <li key={cp._id}>
                    <Link to={`/client-programs/${cp._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeStyle[cp.program?.type] || typeStyle.workout}`}>
                        {cp.program?.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{cp.program?.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Week {cp.currentWeek} of {cp.program?.duration} · {cp.progressPercentage}% complete</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00969E] to-[#22C55E] rounded-full transition-all"
                              style={{ width: `${cp.progressPercentage}%` }} />
                          </div>
                        </div>
                        <ArrowLeft size={14} className="rotate-180 text-gray-300 group-hover:text-[#00969E] transition-colors" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>}
    </div>
  )
}
