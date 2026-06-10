import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight, Video, Upload, X } from 'lucide-react'
import api from '../lib/api'

export default function ProgramForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id) && id !== 'new'
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'workout', duration: 4, level: 'beginner' }
  })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    if (isEdit) api.get(`/programs/${id}`).then(r => {
      reset(r.data)
      if (r.data.coverVideo) setCoverPreview(r.data.coverVideo)
    }).catch(() => navigate('/programs'))
  }, [id])

  const handleCoverSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  const onSubmit = async (data) => {
    let coverVideoUrl = data.coverVideo || ''
    if (coverFile) {
      setUploadingCover(true)
      try {
        const form = new FormData()
        form.append('coverVideo', coverFile)
        const res = await api.post(`/programs/upload-cover`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        coverVideoUrl = res.data.url
      } catch {
        // If upload fails, continue without cover video
      } finally {
        setUploadingCover(false)
      }
    }
    const payload = { ...data, ...(coverVideoUrl ? { coverVideo: coverVideoUrl } : {}) }
    if (isEdit) { await api.put(`/programs/${id}`, payload); navigate(`/programs/${id}`) }
    else { const res = await api.post('/programs', payload); navigate(`/programs/${res.data._id}`) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/programs" className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
          <ArrowRight size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">{isEdit ? 'עריכת תוכנית' : 'צור תוכנית חדשה'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">צור פעם אחת, שייך ללקוחות מרובים</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">שם התוכנית *</label>
            <input {...register('title', { required: 'שם הוא שדה חובה' })}
              placeholder="למשל: תוכנית ירידה במשקל 8 שבועות"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">סוג *</label>
              <select {...register('type', { required: true })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                <option value="workout">אימון</option>
                <option value="diet">תזונה</option>
                <option value="therapy">טיפול</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">משך (שבועות)</label>
              <input type="number" min={1} max={52} {...register('duration', { required: true, min: 1 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">רמה</label>
              <select {...register('level')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
                <option value="beginner">מתחיל</option>
                <option value="intermediate">בינוני</option>
                <option value="advanced">מתקדם</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור</label>
            <textarea {...register('description')} rows={3}
              placeholder="מה כוללת התוכנית הזו?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all resize-none" />
          </div>

          {/* Cover video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Video size={15} className="text-gray-400" /> סרטון מבוא (אופציונלי)
            </label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video src={coverPreview} controls className="w-full max-h-48" />
                <button type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 hover:border-[#00969E] rounded-xl cursor-pointer transition-all">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">לחץ להעלאת סרטון מבוא לתוכנית</span>
                <span className="text-xs text-gray-400">MP4, MOV — יוצג ללקוח בראש התוכנית</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleCoverSelect} />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting || uploadingCover}
              className="px-6 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
              {uploadingCover ? 'מעלה סרטון...' : isSubmitting ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור תוכנית'}
            </button>
            <Link to="/programs" className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">ביטול</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
