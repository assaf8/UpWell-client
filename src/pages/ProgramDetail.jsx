import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Video, Lightbulb, Upload, Trash2, Users, X, BarChart2 } from 'lucide-react'
import api from '../lib/api'
import { getMediaUrl } from '../lib/media'

function AddContentModal({ programId, week, onClose, onAdded }) {
  const [type, setType] = useState('tip')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [videoDuration, setVideoDuration] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const MAX_DURATION = 120 // 2 minutes in seconds

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setError('')
    // Create preview URL and check duration
    const url = URL.createObjectURL(f)
    setVideoPreview(url)
    const vid = document.createElement('video')
    vid.src = url
    vid.onloadedmetadata = () => {
      const dur = Math.round(vid.duration)
      setVideoDuration(dur)
      if (dur > MAX_DURATION) {
        setError(`הסרטון ארוך מדי (${Math.round(dur)}ש׳). מקסימום 2 דקות (120 שניות).`)
        setFile(null)
        setVideoPreview(null)
      }
    }
  }

  const submit = async () => {
    if (!title.trim()) return setError('כותרת היא שדה חובה')
    if (type === 'video' && !file) return setError('בחר קובץ וידאו')
    setLoading(true); setError(''); setUploadProgress(0)
    try {
      const form = new FormData()
      form.append('week', week)
      form.append('contentType', type)
      form.append('title', title)
      if (type === 'tip') form.append('content', content)
      if (type === 'video' && file) {
        form.append('video', file)
        if (videoDuration) form.append('videoDuration', videoDuration)
      }
      const res = await api.post(`/programs/${programId}/content`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(pct)
        }
      })
      onAdded(res.data); onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בהעלאה — נסה שוב')
    } finally { setLoading(false) }
  }

  const formatDuration = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">הוסף תוכן — שבוע {week}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'video', label: '🎥 סרטון', sub: 'עד 2 דקות' },
              { id: 'tip', label: '💡 טיפ חכם', sub: 'עצה בטקסט' }
            ].map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setError('') }}
                className={`p-3 rounded-xl border-2 text-right transition-all ${type === t.id ? 'border-[#00969E] bg-[#E6F7F8]' : 'border-gray-100 hover:border-gray-200'}`}>
                <p className="font-medium text-gray-900 text-sm">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">כותרת *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] transition-all"
              placeholder={type === 'video' ? 'למשל: יום 1 — חימום' : 'למשל: טיפ לשתייה'} />
          </div>

          {type === 'tip' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">תוכן</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none transition-all"
                placeholder="כתוב את הטיפ כאן..." />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">קובץ וידאו (מקסימום 2 דקות)</label>

              {/* Video preview */}
              {videoPreview && !error ? (
                <div className="relative rounded-xl overflow-hidden bg-black mb-2">
                  <video src={videoPreview} controls className="w-full max-h-40" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {videoDuration ? formatDuration(videoDuration) : ''}
                  </div>
                  <button onClick={() => { setFile(null); setVideoPreview(null); setVideoDuration(null) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-[#00969E] bg-[#E6F7F8]' : 'border-gray-200 hover:border-[#00969E]'}`}>
                  <Upload size={20} className={file ? 'text-[#00969E]' : 'text-gray-400'} />
                  <span className="text-sm text-gray-600 text-center">{file ? file.name : 'לחץ לבחירת קובץ וידאו'}</span>
                  <span className="text-xs text-gray-400">MP4, MOV, AVI, WEBM — עד 200MB</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}

              {/* Duration warning */}
              {videoDuration && videoDuration <= MAX_DURATION && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <span>✓</span>
                  <span>אורך: {formatDuration(videoDuration)} — תקין</span>
                </div>
              )}

              {/* Upload progress */}
              {loading && uploadProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>מעלה...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00969E] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={submit} disabled={loading || (type === 'video' && !!error)}
            className="flex-1 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploadProgress > 0 ? `מעלה... ${uploadProgress}%` : 'שומר...'}
                </span>
              : 'הוסף תוכן'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function ProgramDetail() {
  const { id } = useParams()
  const [program, setProgram] = useState(null)
  const [content, setContent] = useState([])
  const [modal, setModal] = useState(null)
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    api.get(`/programs/${id}`).then(r => { setProgram(r.data); setActiveWeek(1) }).catch(() => {})
    api.get(`/programs/${id}/content`).then(r => setContent(r.data || [])).catch(() => {})
  }, [id])

  const deleteContent = async (cid) => {
    if (!confirm('Delete this content?')) return
    await api.delete(`/programs/${id}/content/${cid}`)
    setContent(prev => prev.filter(c => c._id !== cid))
  }

  if (!program) return <div className="p-6 flex justify-center"><div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" /></div>

  const weeks = Array.from({ length: program.duration }, (_, i) => i + 1)
  const weekContent = content.filter(c => c.week === activeWeek)
  const typeGradient = { workout: 'from-blue-500 to-blue-700', diet: 'from-green-500 to-green-700', therapy: 'from-purple-500 to-purple-700' }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {modal && <AddContentModal programId={id} week={modal.week} onClose={() => setModal(null)} onAdded={c => setContent(prev => [...prev, c])} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/programs" className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div>
            <h2 className="font-bold text-gray-900">{program.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${typeGradient[program.type]} text-white font-medium capitalize`}>{program.type}</span>
              <span className="text-xs text-gray-400">{program.duration} weeks · {program.level}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/programs/${id}/assign`}
            className="flex items-center gap-2 px-4 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#00969E]/20 transition-all">
            <Users size={14} /> Assign to Client
          </Link>
          <Link to={`/programs/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm">
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Content stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Items', value: content.length, icon: BarChart2 },
          { label: 'Videos', value: content.filter(c => c.contentType === 'video').length, icon: Video },
          { label: 'Tips', value: content.filter(c => c.contentType === 'tip').length, icon: Lightbulb },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><s.icon size={14} className="text-gray-500" /></div>
            <div><p className="font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Week nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Weeks</p>
            <div className="space-y-1">
              {weeks.map(w => {
                const cnt = content.filter(c => c.week === w).length
                const isActive = activeWeek === w
                return (
                  <button key={w} onClick={() => setActiveWeek(w)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/20' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span className={`font-medium ${isActive ? 'text-white' : ''}`}>Week {w}</span>
                    {cnt > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {cnt}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Week {activeWeek}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{weekContent.length} items</p>
              </div>
              <button onClick={() => setModal({ week: activeWeek })}
                className="flex items-center gap-2 px-4 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                <Plus size={14} /> Add Content
              </button>
            </div>

            {weekContent.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No content yet</p>
                <p className="text-gray-400 text-sm mb-4">Add videos or smart tips for Week {activeWeek}</p>
                <button onClick={() => setModal({ week: activeWeek })}
                  className="text-[#00969E] text-sm font-semibold hover:underline">
                  + Add first item
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {weekContent.map((c, idx) => (
                  <li key={c._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      c.contentType === 'video' ? 'bg-blue-50' : 'bg-yellow-50'
                    }`}>
                      {c.contentType === 'video' ? <Video size={18} className="text-blue-500" /> : <Lightbulb size={18} className="text-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                        <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${c.contentType === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {c.contentType}
                        </span>
                      </div>
                      {c.content && <p className="text-sm text-gray-500 leading-relaxed">{c.content}</p>}
                      {c.videoUrl && (
                        <div className="mt-2">
                          <video src={getMediaUrl(c.videoUrl)}
                            controls className="w-full max-w-sm rounded-xl bg-black shadow-sm" style={{ maxHeight: '180px' }} />
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteContent(c._id)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all flex-shrink-0 mt-0.5">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
