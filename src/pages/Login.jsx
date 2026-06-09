import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  const [demoLoading, setDemoLoading] = useState('')

  const directLogin = async (email, password) => {
    setError(''); setDemoLoading(email)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (e) {
      setError('כניסת דמו נכשלה — ודא שהשרת רץ על פורט 5000')
    } finally { setDemoLoading('') }
  }

  const onSubmit = async (data) => {
    setError('')
    try {
      const result = await login(data.email, data.password)
      if (result.user.role === 'admin') navigate('/admin')
      else if (result.user.role === 'trainee') navigate('/trainee')
      else navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'אימייל או סיסמה שגויים.')
    }
  }

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Skip link */}
      <a href="#login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-[#00969E] text-white px-4 py-2 rounded-xl z-50 font-semibold text-sm">
        דלג לטופס כניסה
      </a>

      {/* Right branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00969E 0%, #007A81 50%, #005f66 100%)' }}
        role="complementary" aria-label="מידע על UpWell">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center" aria-hidden="true">
            <span className="text-[#00969E] font-black text-sm" aria-hidden="true">UW</span>
          </div>
          <span className="text-white font-bold text-xl">UpWell</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            UpWell. לצמוח יחד.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            מערכת הניהול לאנשי מקצוע בתחום הבריאות והוולנס.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          {[
            { icon: '🔒', text: 'SSL מאובטח — הנתונים שלך מוצפנים' },
            { icon: '🇮🇱', text: 'שרתים בישראל — עמידה בתקנות הגנת הפרטיות' },
            { icon: '✅', text: 'חודש ניסיון חינם — ללא כרטיס אשראי' },
          ].map(s => (
            <div key={s.text} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <span className="text-lg">{s.icon}</span>
              <p className="text-white/80 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Login form panel */}
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8" aria-hidden="true">
            <div className="w-9 h-9 bg-[#00969E] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">UW</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">UpWell</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">ברוך שובך</h2>
          <p className="text-gray-500 text-sm mb-8">התחבר לחשבונך</p>

          {/* Global error */}
          {error && (
            <div role="alert" aria-live="assertive"
              className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                כתובת אימייל<span className="text-red-500 mr-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="email" type="email" dir="ltr" autoComplete="email"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', { required: 'שדה חובה', pattern: { value: /\S+@\S+\.\S+/, message: 'כתובת אימייל לא תקינה' } })}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E]/40 focus-visible:border-[#00969E] transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={11} aria-hidden="true" />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  סיסמה<span className="text-red-500 mr-0.5" aria-hidden="true">*</span>
                </label>
                <button type="button" className="text-xs text-[#007A81] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">
                  שכחת סיסמה?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password', { required: 'שדה חובה' })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E]/40 focus-visible:border-[#00969E] transition-all ps-11 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  aria-pressed={showPw}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">
                  {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={11} aria-hidden="true" />{errors.password.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007A81] focus-visible:ring-offset-2">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  <span>מתחבר...</span>
                </span>
              ) : 'כניסה'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            אין לך חשבון?{' '}
            <Link to="/signup" className="text-[#007A81] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00969E] rounded">
              הירשם בחינם
            </Link>
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
      </main>
    </div>
  )
}
