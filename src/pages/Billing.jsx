import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Zap, Star, Building2, ArrowLeft, CreditCard, Clock, AlertCircle, Loader } from 'lucide-react'
import api from '../lib/api'

const PLANS = [
  {
    key:      'starter',
    name:     'Starter',
    price:    49,
    icon:     Zap,
    color:    'from-blue-500 to-blue-600',
    light:    'bg-blue-50 border-blue-100 text-blue-600',
    maxClients: 10,
    features: ['עד 10 לקוחות', 'יומן אימונים', 'צ\'אט עם לקוחות', 'תוכניות אימון ותזונה', 'אפליקציית לקוח'],
  },
  {
    key:      'pro',
    name:     'Pro',
    price:    199,
    icon:     Star,
    color:    'from-purple-500 to-purple-600',
    light:    'bg-purple-50 border-purple-100 text-purple-600',
    maxClients: 50,
    popular:  true,
    features: ['עד 50 לקוחות', 'כל פיצ\'רי Starter', 'דוחות מתקדמים', 'אינטגרציית Google Calendar', 'תמיכה מועדפת'],
  },
  {
    key:      'studio',
    name:     'Studio',
    price:    349,
    icon:     Building2,
    color:    'from-amber-500 to-orange-500',
    light:    'bg-amber-50 border-amber-100 text-amber-600',
    maxClients: Infinity,
    features: ['לקוחות ללא הגבלה', 'כל פיצ\'רי Pro', 'מיתוג אישי', 'API גישה', 'תמיכת VIP 24/7'],
  },
]

const STATUS_CONFIG = {
  trial:    { label: 'תקופת ניסיון',  color: 'bg-blue-50 text-blue-700 border-blue-100',   icon: Clock },
  active:   { label: 'מנוי פעיל',     color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle },
  past_due: { label: 'תשלום נכשל',    color: 'bg-red-50 text-red-700 border-red-100',       icon: AlertCircle },
  cancelled:{ label: 'מנוי בוטל',     color: 'bg-gray-100 text-gray-600 border-gray-200',   icon: AlertCircle },
  blocked:  { label: 'חשבון חסום',    color: 'bg-red-100 text-red-800 border-red-200',      icon: AlertCircle },
}

export default function Billing() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [sub,      setSub]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [paying,   setPaying]   = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    if (params.get('success') === 'true') setSuccess(true)
    if (params.get('error')) setError('התשלום נכשל — אנא נסה שוב.')
    api.get('/subscription/my').then(r => setSub(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async (planKey) => {
    setError('')
    setPaying(planKey)
    try {
      const { data } = await api.post('/subscription/upgrade', { plan: planKey })
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setError('שגיאה ביצירת עמוד תשלום — פנה לתמיכה.')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה — אנא נסה שוב.')
    } finally {
      setPaying('')
    }
  }

  const currentPlan = PLANS.find(p => p.key === sub?.plan) || PLANS[0]
  const StatusIcon  = STATUS_CONFIG[sub?.status]?.icon || Clock

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm">
            <ArrowLeft size={16} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">מנוי & חיוב</h1>
            <p className="text-sm text-gray-500">בחר תוכנית המתאימה לעסק שלך</p>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-800">התשלום התקבל בהצלחה! 🎉</p>
              <p className="text-sm text-green-600">המנוי שלך פעיל. תודה שבחרת UpWell.</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Current status card */}
        {sub && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan.color} flex items-center justify-center shadow-md`}>
                  <currentPlan.icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">התוכנית הנוכחית שלך</p>
                  <p className="text-xl font-black text-gray-900">UpWell {currentPlan.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${STATUS_CONFIG[sub.status]?.color}`}>
                  <StatusIcon size={13} />
                  {STATUS_CONFIG[sub.status]?.label}
                </div>
                {sub.status === 'trial' && sub.daysLeftInTrial > 0 && (
                  <span className="text-sm text-gray-500">{sub.daysLeftInTrial} ימים נותרו</span>
                )}
                {sub.status === 'active' && sub.currentPeriodEnd && (
                  <span className="text-sm text-gray-500">
                    חידוש ב-{new Date(sub.currentPeriodEnd).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trial notice */}
        {sub?.status === 'trial' && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
            <Clock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800">החודש הראשון חינם!</p>
              <p className="text-sm text-blue-600">אחרי תקופת הניסיון תצטרך לבחור תוכנית כדי להמשיך להשתמש ב-UpWell.</p>
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">בחר תוכנית</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const isCurrent = sub?.plan === plan.key && sub?.status === 'active'
              const isPayingThis = paying === plan.key
              return (
                <div key={plan.key} className={`relative bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
                  plan.popular ? 'border-purple-400 shadow-purple-100' : 'border-gray-100 hover:border-gray-200'
                } ${isCurrent ? 'ring-2 ring-[#00969E] ring-offset-2' : ''}`}>

                  {plan.popular && (
                    <div className="bg-purple-500 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                      הכי פופולרי ⭐
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-md`}>
                        <plan.icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-400">{plan.maxClients === Infinity ? 'ללא הגבלה' : `עד ${plan.maxClients} לקוחות`}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-3xl font-black text-gray-900">₪{plan.price}</span>
                      <span className="text-sm text-gray-400"> / חודש</span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-[#00969E] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <div className="w-full py-2.5 bg-[#E6F7F8] text-[#00969E] rounded-xl text-sm font-bold text-center border border-[#00969E]/20">
                        ✓ התוכנית הנוכחית
                      </div>
                    ) : (
                      <button onClick={() => handleUpgrade(plan.key)} disabled={!!paying}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2`}>
                        {isPayingThis ? (
                          <><Loader size={14} className="animate-spin" /> מעבד...</>
                        ) : (
                          <><CreditCard size={14} /> בחר תוכנית</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment history */}
        {sub?.payments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">היסטוריית תשלומים</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {[...sub.payments].reverse().map((p, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${p.status === 'success' ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className="text-sm text-gray-600">{new Date(p.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {p.reference && <span className="text-xs text-gray-400 hidden sm:block">#{p.reference}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">₪{p.amount}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {p.status === 'success' ? 'הצליח' : 'נכשל'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          כל המחירים כוללים מע"מ · ביטול בכל עת · תמיכה: support@upwell.live
        </p>
      </div>
    </div>
  )
}
