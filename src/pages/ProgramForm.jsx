import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import api from '../lib/api'

export default function ProgramForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id) && id !== 'new'
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'workout', duration: 4, level: 'beginner' }
  })

  useEffect(() => {
    if (isEdit) api.get(`/programs/${id}`).then(r => reset(r.data)).catch(() => navigate('/programs'))
  }, [id])

  const onSubmit = async (data) => {
    if (isEdit) { await api.put(`/programs/${id}`, data); navigate(`/programs/${id}`) }
    else { const res = await api.post('/programs', data); navigate(`/programs/${res.data._id}`) }
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

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
              {isSubmitting ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור תוכנית'}
            </button>
            <Link to="/programs" className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">ביטול</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
