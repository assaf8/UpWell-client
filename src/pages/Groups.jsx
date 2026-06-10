import { useEffect, useState } from 'react'
import { Users, Plus, X, Trash2, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react'
import api from '../lib/api'

function GroupModal({ group, clients, onClose, onSaved }) {
  const isEdit = Boolean(group)
  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [members, setMembers] = useState(group?.members?.map(m => m._id) || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id) => setMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const save = async () => {
    if (!name.trim()) return setError('שם הקבוצה הוא שדה חובה')
    setSaving(true); setError('')
    try {
      let res
      if (isEdit) res = await api.put(`/groups/${group._id}`, { name, description, members })
      else res = await api.post('/groups', { name, description, members })
      onSaved(res.data, isEdit)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בשמירה')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEdit ? 'עריכת קבוצה' : 'קבוצה חדשה'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">שם הקבוצה *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="למשל: קבוצת בוקר א׳"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">תיאור</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="תיאור קצר של הקבוצה..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              בחר מתאמנים ({members.length} נבחרו)
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {clients.map(c => (
                <button key={c._id} onClick={() => toggle(c._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-right ${
                    members.includes(c._id) ? 'border-[#00969E] bg-[#E6F7F8]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    members.includes(c._id) ? 'border-[#00969E] bg-[#00969E]' : 'border-gray-300'
                  }`}>
                    {members.includes(c._id) && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  {c.phone && <span className="text-xs text-gray-400 mr-auto">{c.phone}</span>}
                </button>
              ))}
              {clients.length === 0 && <p className="text-sm text-gray-400 text-center py-4">אין לקוחות עדיין</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
            {saving ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור קבוצה'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | group object (edit)
  const [expanded, setExpanded] = useState({})
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/groups').then(r => setGroups(r.data || [])),
      api.get('/clients').then(r => setClients(r.data.clients || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const onSaved = (group, isEdit) => {
    if (isEdit) setGroups(prev => prev.map(g => g._id === group._id ? group : g))
    else setGroups(prev => [group, ...prev])
  }

  const deleteGroup = async (id) => {
    if (!confirm('למחוק את הקבוצה? הסרת הקבוצה לא תמחק את המתאמנים.')) return
    setDeleting(id)
    await api.delete(`/groups/${id}`).catch(() => {})
    setGroups(prev => prev.filter(g => g._id !== id))
    setDeleting(null)
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{groups.length} קבוצות</p>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
          <Plus size={16} /> קבוצה חדשה
        </button>
      </div>

      {(modal === 'new' || (modal && typeof modal === 'object')) && (
        <GroupModal
          group={modal === 'new' ? null : modal}
          clients={clients}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-24" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Users size={36} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">אין קבוצות עדיין</h3>
          <p className="text-gray-400 text-sm mb-5">צור קבוצה ושייך אליה מתאמנים</p>
          <button onClick={() => setModal('new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-semibold hover:bg-[#007A81] transition-colors shadow-lg shadow-[#00969E]/20">
            <Plus size={15} /> צור קבוצה ראשונה
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00969E] to-[#007A81] flex items-center justify-center shadow-md flex-shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.members?.length || 0} מתאמנים{g.description ? ` · ${g.description}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setModal(g)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteGroup(g._id)} disabled={deleting === g._id}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                    {deleting === g._id ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={14} />}
                  </button>
                  <button onClick={() => toggleExpand(g._id)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    {expanded[g._id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>
              {expanded[g._id] && g.members?.length > 0 && (
                <div className="border-t border-gray-50 px-5 py-3 grid grid-cols-2 gap-2">
                  {g.members.map(m => (
                    <div key={m._id} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-[#E6F7F8] text-[#00969E] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {expanded[g._id] && (!g.members || g.members.length === 0) && (
                <div className="border-t border-gray-50 px-5 py-4 text-center text-sm text-gray-400">אין מתאמנים בקבוצה זו</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
