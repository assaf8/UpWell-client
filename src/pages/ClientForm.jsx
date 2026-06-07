import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight, User, Phone, Mail, Calendar, Target, AlertCircle } from 'lucide-react'
import api from '../lib/api'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id) && id !== 'new'
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (isEdit) api.get(`/clients/${id}`).then(r => reset(r.data)).catch(() => navigate('/clients'))
  }, [id])

  const onSubmit = async (data) => {
    if (isEdit) await api.put(`/clients/${id}`, data)
    else await api.post('/clients', data)
    navigate('/clients')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/clients" className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50">
          <ArrowRight size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="font-bold text-gray-900">{isEdit ? 'עריכת לקוח' : 'הוספת לקוח חדש'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'עדכן פרטי לקוח' : 'מלא את הפרטים למטה'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><User size={16} className="text-[#00969E]" /> פרטים אישיים</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מלא *</label>
                <input {...register('name', { required: 'שם הוא שדה חובה' })} placeholder="למשל: שרה לוי"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Phone size={13} /> טלפון</label>
                <input {...register('phone')} type="tel" placeholder="050-000-0000" dir="ltr"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Mail size={13} /> אימייל</label>
                <input {...register('email')} type="email" placeholder="client@example.com" dir="ltr"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar size={13} /> תאריך לידה</label>
                <input {...register('dateOfBirth')} type="date" dir="ltr"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
              </div>
            </div>

            <div className="border-t border-gray-50 pt-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Target size={16} className="text-[#00969E]" /> מטרות ובריאות</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">מטרות</label>
                  <textarea {...register('goals')} rows={3}
                    placeholder="מה המטרות של הלקוח? למשל: ירידה במשקל, בניית שריר, שיפור גמישות..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><AlertCircle size={13} className="text-orange-500" /> הערות רפואיות</label>
                  <textarea {...register('medicalNotes')} rows={3}
                    placeholder="פציעות, מצבים רפואיים, או מגבלות שיש לדעת עליהן..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all resize-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center gap-3">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
              {isSubmitting ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />שומר...</span> : isEdit ? 'שמור שינויים' : 'הוסף לקוח'}
            </button>
            <Link to="/clients" className="px-6 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">ביטול</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
