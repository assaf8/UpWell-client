import { useEffect, useState, useRef } from 'react'
import { Plus, Share2, Calendar, BarChart2, Image, X, TrendingUp, Sparkles, Send, RefreshCw, Link, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { getMediaUrl } from '../lib/media'
const statusStyle = { draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-blue-50 text-blue-600', published: 'bg-green-50 text-green-600', failed: 'bg-red-50 text-red-600' }
const statusLabel = { draft: 'טיוטה', scheduled: 'מתוזמן', published: 'פורסם', failed: 'נכשל' }

// ── AI Caption Modal ───────────────────────────────────────────────────────
function AICaptionModal({ onUse, onClose }) {
  const [topic, setTopic]   = useState('')
  const [tone,  setTone]    = useState('motivational')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,  setError]  = useState('')

  const generate = async () => {
    if (!topic.trim()) return setError('תאר את נושא הפוסט')
    setLoading(true); setError(''); setResult('')
    try {
      const res = await api.post('/instagram/generate-caption', { topic, tone })
      setResult(res.data.caption)
    } catch (e) { setError(e.response?.data?.message || 'שגיאה ביצירת כיתוב') }
    finally { setLoading(false) }
  }

  const tones = [
    { k: 'motivational', l: '💪 מוטיבציוני' },
    { k: 'professional', l: '👔 מקצועי' },
    { k: 'casual',       l: '😊 קליל' },
    { k: 'educational',  l: '📚 חינוכי' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <h2 className="font-bold text-gray-900">AI כיתוב חכם</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">נושא הפוסט</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="למשל: אימון בוקר, תזונה נכונה, הצלחה של לקוח..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">טון</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(t => (
                <button key={t.k} onClick={() => setTone(t.k)}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${tone === t.k ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>
          {result && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          {result ? (
            <>
              <button onClick={() => onUse(result)} className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition-colors">
                השתמש בכיתוב זה ✓
              </button>
              <button onClick={generate} disabled={loading} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </>
          ) : (
            <button onClick={generate} disabled={loading || !topic.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> יוצר...
                </span>
              ) : <span className="flex items-center justify-center gap-2"><Sparkles size={15} /> צור כיתוב</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Create Post Modal ──────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated, igConnected }) {
  const [form,   setForm]   = useState({ caption: '', scheduledTime: '' })
  const [image,  setImage]  = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]  = useState('')
  const [showAI,  setShowAI] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleImage = (e) => {
    const f = e.target.files[0]; if (!f) return
    setImage(f)
    const reader = new FileReader(); reader.onloadend = () => setPreview(reader.result); reader.readAsDataURL(f)
  }

  const save = async () => {
    if (!form.caption.trim()) return setError('כיתוב הוא שדה חובה')
    setError(''); setLoading(true); setProgress(0)
    try {
      const fd = new FormData()
      fd.append('caption', form.caption)
      if (form.scheduledTime) fd.append('scheduledTime', form.scheduledTime)
      fd.append('platforms', JSON.stringify(['instagram']))
      if (image) fd.append('image', image)
      const res = await api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => e.total && setProgress(Math.round((e.loaded / e.total) * 100)),
      })
      onCreated(res.data); onClose()
    } catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      {showAI && <AICaptionModal onClose={() => setShowAI(false)} onUse={cap => { setForm(f => ({...f, caption: cap})); setShowAI(false) }} />}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="font-bold text-gray-900">צור פוסט לאינסטגרם</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
          </div>
          <div className="p-5 space-y-4">
            <label className={`block w-full cursor-pointer rounded-2xl overflow-hidden transition-all ${preview ? '' : 'border-2 border-dashed border-gray-200 hover:border-[#00969E]'}`}>
              {preview ? (
                <div className="relative">
                  <img src={preview} className="w-full h-56 object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">שנה תמונה</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Image size={22} className="text-gray-400" /></div>
                  <p className="text-sm font-medium text-gray-500">לחץ להעלאת תמונה</p>
                  <p className="text-xs text-gray-400">PNG, JPG עד 20MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">כיתוב *</label>
                <button onClick={() => setShowAI(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors">
                  <Sparkles size={11} /> AI כיתוב
                </button>
              </div>
              <textarea value={form.caption} onChange={e => setForm(f => ({...f, caption: e.target.value}))} rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none"
                placeholder="כתוב את כיתוב הפוסט שלך... 📸" />
              <p className="text-right text-xs mt-1 text-gray-400">{form.caption.length}/2200</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">תזמון (אופציונלי)</label>
              <input type="datetime-local" value={form.scheduledTime} onChange={e => setForm(f => ({...f, scheduledTime: e.target.value}))} dir="ltr"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">⚠️ {error}</div>}
            {loading && progress > 0 && progress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span>מעלה...</span><span>{progress}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00969E] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
            <button onClick={save} disabled={loading || !form.caption.trim()}
              className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> שומר...</span>
                       : form.scheduledTime ? '📅 תזמן פוסט' : '💾 שמור כטיוטה'}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">ביטול</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Instagram Connect Banner ───────────────────────────────────────────────
function InstagramConnect({ status, onRefresh }) {
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  // Check for ?connected=1 in URL after OAuth redirect
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('connected') === '1' || p.get('error')) {
      onRefresh()
      window.history.replaceState({}, '', '/social')
    }
  }, [])

  const connect = async () => {
    setConnecting(true)
    try {
      const res = await api.get('/instagram/connect')
      window.location.href = res.data.url
    } catch (e) {
      alert(e.response?.data?.message || 'שגיאה — בדוק שה-INSTAGRAM_APP_ID מוגדר ב-.env')
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    setDisconnecting(true)
    await api.post('/instagram/disconnect').catch(() => {})
    setDisconnecting(false)
    onRefresh()
  }

  if (status === null) return null

  if (status) return (
    <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl px-5 py-3.5 mb-5">
      <div className="flex items-center gap-2.5">
        <CheckCircle size={18} className="text-green-500" />
        <span className="text-sm font-semibold text-green-700">אינסטגרם מחובר</span>
      </div>
      <button onClick={disconnect} disabled={disconnecting} className="text-xs text-red-500 hover:underline disabled:opacity-60">
        {disconnecting ? 'מנתק...' : 'נתק'}
      </button>
    </div>
  )

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl px-5 py-4 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Share2 size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">חבר אינסטגרם</p>
          <p className="text-xs text-gray-500">פרסם ישירות מ-UpWell לאינסטגרם שלך</p>
        </div>
      </div>
      <button onClick={connect} disabled={connecting}
        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-60">
        <Link size={14} /> {connecting ? 'מחבר...' : 'חבר'}
      </button>
    </div>
  )
}

// ── Post Card ──────────────────────────────────────────────────────────────
function PostCard({ post, igConnected, onPublish, onDelete }) {
  const [publishing, setPublishing] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const publish = async () => {
    if (!post.imageUrl) return alert('הפוסט חייב לכלול תמונה לפרסום באינסטגרם')
    setPublishing(true)
    try { await onPublish(post._id) }
    catch (e) { alert(e.response?.data?.message || 'שגיאה בפרסום') }
    finally { setPublishing(false) }
  }

  const del = async () => {
    if (!confirm('למחוק פוסט זה?')) return
    setDeleting(true)
    await onDelete(post._id).catch(() => {})
    setDeleting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {post.imageUrl ? (
        <div className="relative overflow-hidden h-52">
          <img src={getMediaUrl(post.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
          {post.status === 'published' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={11} /> פורסם
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-52 bg-gradient-to-br from-[#E6F7F8] to-teal-50 flex items-center justify-center">
          <Image size={36} className="text-[#00969E]/40" />
        </div>
      )}
      <div className="p-4">
        <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-relaxed">{post.caption}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[post.status] || statusStyle.draft}`}>
            {statusLabel[post.status] || 'טיוטה'}
          </span>
          <div className="flex items-center gap-1">
            {igConnected && post.status !== 'published' && (
              <button onClick={publish} disabled={publishing}
                className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
                {publishing ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={11} />}
                {publishing ? 'מפרסם...' : 'פרסם'}
              </button>
            )}
            <button onClick={del} disabled={deleting}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        {post.scheduledTime && (
          <p className="text-gray-400 text-xs mt-2">📅 {new Date(post.scheduledTime).toLocaleDateString('he-IL', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}</p>
        )}
      </div>
    </div>
  )
}

// ── Main Social Page ───────────────────────────────────────────────────────
export default function Social() {
  const [posts,      setPosts]      = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [igStatus,   setIgStatus]   = useState(null)  // null=loading, true/false

  const loadIgStatus = () => {
    api.get('/instagram/status').then(r => setIgStatus(r.data.connected)).catch(() => setIgStatus(false))
  }

  useEffect(() => {
    api.get('/posts').then(r => setPosts(r.data || [])).catch(() => {})
    loadIgStatus()
  }, [])

  const handlePublish = async (postId) => {
    await api.post(`/instagram/publish/${postId}`)
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'published' } : p))
  }

  const handleDelete = async (postId) => {
    await api.delete(`/posts/${postId}`)
    setPosts(prev => prev.filter(p => p._id !== postId))
  }

  const stats = [
    { label: 'סה״כ פוסטים', value: posts.length,                               icon: BarChart2,  color: 'text-[#00969E]', bg: 'bg-[#E6F7F8]'  },
    { label: 'מתוזמנים',    value: posts.filter(p => p.status==='scheduled').length, icon: Calendar, color: 'text-blue-600',    bg: 'bg-blue-50'     },
    { label: 'פורסמו',       value: posts.filter(p => p.status==='published').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50'   },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showModal && <CreatePostModal igConnected={igStatus} onClose={() => setShowModal(false)} onCreated={p => setPosts(prev => [p, ...prev])} />}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{posts.length} פוסטים</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
            <Plus size={16} /> צור פוסט
          </button>
        </div>
      </div>

      {/* Instagram connect */}
      <InstagramConnect status={igStatus} onRefresh={loadIgStatus} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={20} className={s.color} /></div>
            <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 size={28} className="text-purple-500" />
          </div>
          <h3 className="font-bold text-gray-700 mb-1">אין פוסטים עדיין</h3>
          <p className="text-gray-400 text-sm mb-5">צור ותזמן פוסטים לאינסטגרם — עם עזרת AI</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00969E] text-white rounded-xl text-sm font-semibold hover:bg-[#007A81] transition-colors shadow-lg shadow-[#00969E]/20">
            <Plus size={15} /> צור פוסט ראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(p => (
            <PostCard key={p._id} post={p} igConnected={igStatus} onPublish={handlePublish} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
