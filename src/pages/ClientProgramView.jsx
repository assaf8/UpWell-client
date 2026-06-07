import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Video, Lightbulb, CheckCircle, Circle, Play, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { getMediaUrl } from '../lib/media'

export default function ClientProgramView() {
  const { id } = useParams()
  const [cp, setCp] = useState(null)
  const [content, setContent] = useState([])
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    api.get(`/client-programs/${id}`).then(r => {
      setCp(r.data)
      setActiveWeek(r.data.currentWeek || 1)
    }).catch(() => {})
    api.get(`/client-programs/${id}/content`).then(r => setContent(r.data || [])).catch(() => {})
  }, [id])

  const toggleWatched = async (contentId) => {
    const isWatched = cp?.viewedContent?.includes(contentId)
    const res = await api.post(`/client-programs/${id}/progress`, { contentId, watched: !isWatched })
    setCp(res.data)
  }

  if (!cp) return (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
    </div>
  )

  const weeks = Array.from({ length: cp.program?.duration || 1 }, (_, i) => i + 1)
  const weekContent = content.filter(c => c.week === activeWeek)
  const totalContent = content.length
  const viewedCount = cp.viewedContent?.length || 0
  const progress = totalContent > 0 ? Math.round((viewedCount / totalContent) * 100) : 0

  const typeGrad = { workout: 'from-blue-500 to-blue-700', diet: 'from-green-500 to-green-700', therapy: 'from-purple-500 to-purple-700' }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/clients/${cp.client?._id}`} className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">{cp.program?.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            <span className={`inline-flex bg-gradient-to-r ${typeGrad[cp.program?.type] || typeGrad.workout} text-white text-xs px-2 py-0.5 rounded-full font-medium capitalize`}>{cp.program?.type}</span>
            <span className="ml-2">{cp.client?.name}</span>
          </p>
        </div>
      </div>

      {/* Progress banner */}
      <div className="bg-gradient-to-r from-[#00969E] to-[#007A81] rounded-2xl p-5 mb-6 text-white shadow-lg shadow-[#00969E]/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-lg">{progress}% Complete</p>
            <p className="text-white/70 text-sm">{viewedCount} of {totalContent} items done</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Current Week</p>
            <p className="font-black text-3xl">{cp.currentWeek}<span className="text-lg font-normal text-white/50">/{cp.program?.duration}</span></p>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700 shadow-sm" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Week nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Weeks</p>
            <div className="space-y-1">
              {weeks.map(w => {
                const wContent = content.filter(c => c.week === w)
                const wViewed = wContent.filter(c => cp.viewedContent?.includes(c._id)).length
                const done = wContent.length > 0 && wViewed === wContent.length
                const isActive = activeWeek === w
                return (
                  <button key={w} onClick={() => setActiveWeek(w)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/20' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <span className="font-medium">Week {w}</span>
                    {done && <CheckCircle size={14} className={isActive ? 'text-white' : 'text-green-500'} />}
                    {!done && wViewed > 0 && (
                      <span className={`text-xs px-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{wViewed}/{wContent.length}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Week {activeWeek}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{weekContent.length} items</p>
            </div>

            {weekContent.length === 0 ? (
              <div className="py-14 text-center text-sm text-gray-400">
                <TrendingUp size={28} className="mx-auto text-gray-200 mb-2" />
                No content for this week yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {weekContent.map(c => {
                  const watched = cp.viewedContent?.includes(c._id)
                  return (
                    <li key={c._id} className={`px-5 py-4 transition-colors ${watched ? 'bg-green-50/30' : ''}`}>
                      <div className="flex items-start gap-4">
                        <button onClick={() => toggleWatched(c._id)} className="flex-shrink-0 mt-0.5">
                          {watched
                            ? <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                                <CheckCircle size={14} className="text-white" />
                              </div>
                            : <div className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-[#00969E] transition-colors" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${c.contentType === 'video' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                              {c.contentType === 'video' ? <Video size={12} className="text-blue-500" /> : <Lightbulb size={12} className="text-yellow-500" />}
                            </div>
                            <p className={`text-sm font-semibold transition-all ${watched ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {c.title}
                            </p>
                            {watched && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-auto">✓ Done</span>}
                          </div>
                          {c.content && <p className="text-sm text-gray-500 leading-relaxed">{c.content}</p>}
                          {c.videoUrl && (
                            <div className="mt-3">
                              <video
                                src={getMediaUrl(c.videoUrl)}
                                controls
                                className="w-full max-w-lg rounded-xl bg-gray-900 shadow-md"
                                style={{ maxHeight: '260px' }}
                                onPlay={() => !watched && toggleWatched(c._id)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
