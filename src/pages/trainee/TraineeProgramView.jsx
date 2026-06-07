import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Video, Lightbulb, CheckCircle, Play, Lock, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'
import { getMediaUrl } from '../../lib/media'

const typeConfig = {
  workout: { label: 'אימון', gradient: 'from-blue-500 to-blue-700' },
  diet: { label: 'תזונה', gradient: 'from-green-500 to-green-700' },
  therapy: { label: 'טיפול', gradient: 'from-purple-500 to-purple-700' },
}

export default function TraineeProgramView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [cp, setCp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(1)
  const [expandedItem, setExpandedItem] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    api.get(`/trainee/programs/${id}`)
      .then(r => {
        setData(r.data)
        setCp(r.data.cp)
        setActiveWeek(r.data.cp.currentWeek || 1)
      })
      .catch(() => navigate('/trainee'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleWatched = async (contentId) => {
    setUpdating(contentId)
    try {
      const isWatched = cp.viewedContent?.includes(contentId)
      const res = await api.post(`/trainee/programs/${id}/progress`, { contentId, watched: !isWatched })
      setCp(res.data)
    } catch {} finally { setUpdating(null) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
    </div>
  )

  if (!data) return null

  const { content } = data
  const tc = typeConfig[cp.program?.type] || typeConfig.workout
  const weeks = Array.from({ length: cp.program?.duration || 1 }, (_, i) => i + 1)
  const weekContent = content.filter(c => c.week === activeWeek)
  const viewedCount = cp.viewedContent?.length || 0
  const totalContent = content.length
  const progress = totalContent > 0 ? Math.round((viewedCount / totalContent) * 100) : 0

  const isWeekLocked = (w) => w > (cp.currentWeek || 1)
  const isWeekDone = (w) => {
    const wc = content.filter(c => c.week === w)
    return wc.length > 0 && wc.every(c => cp.viewedContent?.includes(c._id))
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden pt-10 pb-8 px-5" style={{background: `linear-gradient(135deg, ${tc.gradient.includes('blue') ? '#3B82F6, #1D4ED8' : tc.gradient.includes('green') ? '#22C55E, #15803D' : '#A855F7, #7E22CE'})`}}>
        <div className={`absolute inset-0 bg-gradient-to-br ${tc.gradient}`} />
        <div className="relative z-10">
          <button onClick={() => navigate('/trainee')}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-5 transition-colors">
            <ArrowRight size={16} /> חזרה לתוכניות
          </button>

          <h1 className="text-xl font-black text-white leading-tight mb-1">{cp.program?.title}</h1>
          <p className="text-white/70 text-sm">שבוע {cp.currentWeek} מתוך {cp.program?.duration}</p>

          {/* Progress */}
          <div className="mt-5 bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-semibold">התקדמות כוללת</span>
              <span className="text-white font-black text-lg">{progress}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/60 text-xs mt-1.5">{viewedCount} מתוך {totalContent} פריטים הושלמו</p>
          </div>
        </div>
      </div>

      {/* Week selector */}
      <div className="px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {weeks.map(w => {
            const done = isWeekDone(w)
            const locked = isWeekLocked(w)
            const active = activeWeek === w
            return (
              <button key={w} onClick={() => !locked && setActiveWeek(w)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active ? 'bg-[#00969E] text-white shadow-md shadow-[#00969E]/20' :
                  locked ? 'bg-gray-50 text-gray-300 cursor-not-allowed' :
                  done ? 'bg-green-50 text-green-600' :
                  'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}>
                {done && !active ? <CheckCircle size={12} className="mb-0.5 text-green-500" /> :
                 locked ? <Lock size={12} className="mb-0.5" /> : null}
                <span>שבוע {w}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content list */}
      <div className="px-4 py-4 space-y-3 pb-24">
        {isWeekLocked(activeWeek) ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 mb-1">שבוע {activeWeek} נעול</h3>
            <p className="text-gray-400 text-sm">השלם את שבוע {activeWeek - 1} כדי לפתוח את השבוע הזה</p>
          </div>
        ) : weekContent.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-gray-400 text-sm">אין תוכן לשבוע זה עדיין</p>
          </div>
        ) : (
          weekContent.map((item, idx) => {
            const watched = cp.viewedContent?.includes(item._id)
            const isExpanded = expandedItem === item._id
            const isUpdating = updating === item._id

            return (
              <div key={item._id} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${watched ? 'border border-green-100' : 'border border-gray-100'}`}>
                {/* Item header */}
                <div className="flex items-center gap-3 p-4" onClick={() => setExpandedItem(isExpanded ? null : item._id)}>
                  {/* Check button */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleWatched(item._id) }}
                    disabled={isUpdating}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      watched ? 'bg-green-500 shadow-md shadow-green-200' : 'border-2 border-gray-200 hover:border-[#00969E]'
                    } ${isUpdating ? 'opacity-50' : ''}`}>
                    {watched ? <CheckCircle size={18} className="text-white" fill="white" /> :
                     isUpdating ? <div className="w-3 h-3 border-2 border-gray-300 border-t-[#00969E] rounded-full animate-spin" /> : null}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.contentType === 'video'
                        ? <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center"><Video size={11} className="text-blue-500" /></div>
                        : <div className="w-5 h-5 bg-yellow-50 rounded-md flex items-center justify-center"><Lightbulb size={11} className="text-yellow-500" /></div>
                      }
                      <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                    </div>
                    <p className={`text-sm font-semibold leading-tight ${watched ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {watched && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ הושלם</span>}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    {item.content && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.content}</p>
                    )}
                    {item.videoUrl && (
                      <div className="rounded-xl overflow-hidden bg-black shadow-md">
                        <video
                          src={getMediaUrl(item.videoUrl)}
                          controls
                          className="w-full"
                          style={{ maxHeight: '220px' }}
                          onPlay={() => !watched && toggleWatched(item._id)}
                        />
                      </div>
                    )}
                    {!watched && (
                      <button onClick={() => toggleWatched(item._id)} disabled={isUpdating}
                        className="w-full mt-3 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#00969E]/20">
                        {isUpdating ? 'שומר...' : '✓ סמן כהושלם'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Week complete celebration */}
        {!isWeekLocked(activeWeek) && weekContent.length > 0 && isWeekDone(activeWeek) && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-center shadow-lg">
            <Trophy size={36} className="text-white mx-auto mb-2" />
            <h3 className="font-black text-white text-lg">כל הכבוד! 🎉</h3>
            <p className="text-white/80 text-sm mt-1">סיימת את שבוע {activeWeek} בהצלחה!</p>
            {activeWeek < (cp.program?.duration || 1) && (
              <button onClick={() => setActiveWeek(w => w + 1)}
                className="mt-3 bg-white text-green-600 font-bold px-5 py-2 rounded-xl text-sm shadow-md hover:bg-green-50 transition-colors">
                המשך לשבוע {activeWeek + 1} →
              </button>
            )}
          </div>
        )}
      </div>
      <TraineeNav />
    </div>
  )
}
