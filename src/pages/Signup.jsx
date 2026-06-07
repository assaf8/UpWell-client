import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Signup() {
  const { signup }   = useAuth()
  const navigate     = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const pw = watch('password')

  const onSubmit = async (data) => {
    setError('')
    try {
      await signup({ email: data.email, password: data.password, businessName: data.businessName, phone: data.phone })
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'הרשמה נכשלה. אנא נסה שוב.')
    }
  }

  const perks = [
    'ניהול לקוחות ו-CRM',
    'תוכניות עם תוכן וידאו',
    'מעקב חשבוניות ותשלומים',
    'תזמון פוסטים ברשתות חברתיות',
  ]

  const fields = [
    { id: 'businessName', label: 'שם העסק / שם מלא', placeholder: 'למשל: דנה פיטנס', req: true },
    { id: 'email',        label: 'כתובת אימייל',       placeholder: 'you@example.com', type: 'email', req: true, ltr: true,
      validation: { required: 'שדה חובה', pattern: { value: /\S+@\S+\.\S+/, message: 'כתובת אימייל לא תקינה' } } },
    { id: 'phone', label: 'טלפון (אופציונלי)', placeholder: '050-000-0000', type: 'tel', ltr: true },
  ]

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Skip link */}
      <a href="#signup-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-[#00969E] text-white px-4 py-2 rounded-xl z-50 font-semibold text-sm">
        דלג לטופס הרשמה
      </a>

      {/* Right branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00969E 0%, #007A81 50%, #005f66 100%)' }}
        role="complementary" aria-label="יתרונות UpWell">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center" aria-hidden="true">
            <span className="text-[#00969E] font-black text-sm">UW</span>
          </div>
          <span className="text-white font-bold text-xl">UpWell</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            כל מה שצריך<br />כדי לצמוח<br />את העסק שלך.
          </h1>
          <ul className="space-y-3" aria-label="יתרונות המערכת">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-white/80 text-sm">
                <CheckCircle size={16} className="text-white flex-shrink-0" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5">
          <p className="text-white text-sm italic leading-relaxed">
            "UpWell שינתה את הדרך שבה אני מנהלת את 40+ הלקוחות שלי. תוכניות, אימונים, חשבוניות — הכל במקום אחד."
          </p>
          <footer className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs" aria-hidden="true">מ</div>
            <cite className="not-italic">
              <p className="text-white text-xs font-medium">מאיה כהן</p>
              <p className="text-white/50 text-xs">מאמנת כושר אישי, תל אביב</p>
            </cite>
          </footer>
        </blockquote>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8" aria-hidden="true">
            <div className="w-9 h-9 bg-[#00969E] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">UW</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">UpWell</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">צור חשבון</h2>
          <p className="text-gray-500 text-sm mb-8">חינם לתמיד. ללא כרטיס אשראי.</p>

          {/* Global error */}
          {error && (
            <div role="alert" aria-live="assertive"
              className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {fields.map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1.5">
                  {f.label}{f.req && <span className="text-red-500 mr-0.5" aria-hidden="true">*</span>}
                </label>
                <input
                  id={f.id}
                  type={f.type || 'text'}
                  autoComplete={f.id === 'email' ? 'email' : f.id === 'phone' ? 'tel' : 'organization'}
                  dir={f.ltr ? 'ltr' : 'rtl'}
                  aria-required={f.req ? 'true' : 'false'}
                  aria-invalid={errors[f.id] ? 'true' : 'false'}
                  aria-describedby={errors[f.id] ? `${f.id}-error` : undefined}
                  {...register(f.id, f.validation || (f.req ? { required: 'שדה חובה' } : {}))}
                  placeholder={f.placeholder}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E]/40 focus-visible:border-[#00969E] transition-all ${errors[f.id] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors[f.id] && (
                  <p id={`${f.id}-error`} role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden="true" />{errors[f.id].message}
                  </p>
                )}
              </div>
            ))}

            {/* Password pair */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  סיסמה<span className="text-red-500 mr-0.5" aria-hidden="true">*</span>
                </label>
                <input
                  id="password" type="password" dir="ltr" autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                  {...register('password', { required: 'שדה חובה', minLength: { value: 6, message: 'מינימום 6 תווים' } })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E]/40 focus-visible:border-[#00969E] transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                <p id="password-hint" className="mt-1 text-xs text-gray-400">מינימום 6 תווים</p>
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden="true" />{errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                  אימות<span className="text-red-500 mr-0.5" aria-hidden="true">*</span>
                </label>
                <input
                  id="confirm" type="password" dir="ltr" autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={errors.confirm ? 'true' : 'false'}
                  aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                  {...register('confirm', { required: 'שדה חובה', validate: v => v === pw || 'הסיסמאות אינן תואמות' })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E]/40 focus-visible:border-[#00969E] transition-all ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.confirm && (
                  <p id="confirm-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden="true" />{errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  aria-required="true"
                  aria-invalid={errors.terms ? 'true' : 'false'}
                  aria-describedby={errors.terms ? 'terms-error' : 'terms-label'}
                  {...register('terms', { required: 'יש לאשר את תנאי השימוש' })}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#00969E] focus:ring-[#00969E] focus:ring-2 flex-shrink-0 cursor-pointer accent-[#00969E]"
                />
                <label id="terms-label" htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  קראתי ואני מסכים/ה{' '}
                  <Link to="/terms"   target="_blank" className="text-[#007A81] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">לתנאי השימוש</Link>
                  {', '}
                  <Link to="/privacy" target="_blank" className="text-[#007A81] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">למדיניות הפרטיות</Link>
                  {' ו'}
                  <Link to="/health"  target="_blank" className="text-[#007A81] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">לכתב הויתור הבריאותי</Link>
                  <span className="text-red-500 mr-0.5" aria-hidden="true">*</span>
                </label>
              </div>
              {errors.terms && (
                <p id="terms-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 mr-7">
                  <AlertCircle size={11} aria-hidden="true" />{errors.terms.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007A81] focus-visible:ring-offset-2">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  <span>יוצר חשבון...</span>
                </span>
              ) : 'צור חשבון בחינם'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="text-[#007A81] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">התחבר</Link>
          </p>

          {/* Legal links */}
          <nav className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-400" aria-label="דפים משפטיים">
            <Link to="/privacy" target="_blank" className="hover:text-gray-600 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">פרטיות</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms"   target="_blank" className="hover:text-gray-600 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">תנאים</Link>
            <span aria-hidden="true">·</span>
            <Link to="/health"  target="_blank" className="hover:text-gray-600 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">כתב ויתור</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
