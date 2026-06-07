import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { User, Bell, Lock, ChevronLeft, Save, Share2, Phone, Clock, Plus, X, Calendar, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { useSearchParams } from 'react-router-dom'

const DAY_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#00969E]' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}

function AvailabilityTab() {
  const [avail, setAvail] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newBlock, setNewBlock] = useState('')

  useEffect(() => {
    api.get('/availability/me').then(r => setAvail(r.data)).catch(() => {})
  }, [])

  if (!avail) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
    </div>
  )

  const updateDay = (idx, field, value) => {
    setAvail(a => ({ ...a, days: { ...a.days, [idx]: { ...a.days[idx], [field]: value } } }))
  }

  const addBlockedDate = () => {
    if (!newBlock) return
    if (avail.blockedDates?.includes(newBlock)) return
    setAvail(a => ({ ...a, blockedDates: [...(a.blockedDates || []), newBlock].sort() }))
    setNewBlock('')
  }

  const removeBlockedDate = (d) => {
    setAvail(a => ({ ...a, blockedDates: a.blockedDates.filter(x => x !== d) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/availability/me', {
        days: avail.days,
        sessionDuration: avail.sessionDuration,
        bufferTime: avail.bufferTime,
        blockedDates: avail.blockedDates,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {} finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Weekly schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Clock size={16} className="text-[#00969E]" /> לוח זמנים שבועי
        </h3>
        <div className="space-y-3">
          {[0,1,2,3,4,5,6].map(idx => {
            const day = avail.days?.[idx] || { enabled: false, start: '09:00', end: '18:00' }
            return (
              <div key={idx} className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${day.enabled ? 'bg-[#E6F7F8]/50' : 'bg-gray-50'}`}>
                <Toggle checked={!!day.enabled} onChange={v => updateDay(idx, 'enabled', v)} />
                <span className={`w-12 text-xs font-semibold flex-shrink-0 ${day.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {DAY_LABELS[idx]}
                </span>
                {day.enabled ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input type="time" value={day.start} onChange={e => updateDay(idx, 'start', e.target.value)} dir="ltr"
                      className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] flex-1 min-w-0" />
                    <span className="text-gray-400 text-xs flex-shrink-0">—</span>
                    <input type="time" value={day.end} onChange={e => updateDay(idx, 'end', e.target.value)} dir="ltr"
                      className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] flex-1 min-w-0" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 flex-1">לא זמין</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Session settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">הגדרות אימון</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">משך אימון (דקות)</label>
            <select value={avail.sessionDuration} onChange={e => setAvail(a => ({...a, sessionDuration: Number(e.target.value)}))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
              {[30, 45, 60, 75, 90, 120].map(v => <option key={v} value={v}>{v} דק׳</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">זמן מאגר בין אימונים</label>
            <select value={avail.bufferTime} onChange={e => setAvail(a => ({...a, bufferTime: Number(e.target.value)}))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] bg-white">
              {[0, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v === 0 ? 'ללא' : `${v} דק׳`}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Blocked dates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">ימי חסימה (חופשות / ימי מנוחה)</h3>
        <div className="flex gap-2 mb-3">
          <input type="date" value={newBlock} onChange={e => setNewBlock(e.target.value)} dir="ltr"
            min={new Date().toISOString().split('T')[0]}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E]" />
          <button onClick={addBlockedDate} disabled={!newBlock}
            className="px-4 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5">
            <Plus size={14} /> חסום יום
          </button>
        </div>
        {avail.blockedDates?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {avail.blockedDates.map(d => (
              <span key={d} className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-xl">
                {new Date(d + 'T12:00:00').toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                <button onClick={() => removeBlockedDate(d)} className="hover:text-red-800 transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">אין ימי חסימה מוגדרים</p>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
          <Save size={14} />{saving ? 'שומר...' : 'שמור זמינות'}
        </button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</div>נשמר!</span>}
      </div>
    </div>
  )
}

function IntegrationsTab() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    api.get('/integrations/status').then(r => setStatus(r.data)).catch(() => {})
  }, [])

  const googleResult = searchParams.get('google')

  const connectGoogle = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/integrations/google/connect')
      window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  const disconnectGoogle = async () => {
    await api.delete('/integrations/google/disconnect')
    setStatus(s => ({ ...s, googleCalendar: { ...s.googleCalendar, connected: false, enabled: false } }))
  }

  const toggleGoogle = async () => {
    const { data } = await api.put('/integrations/google/toggle')
    setStatus(s => ({ ...s, googleCalendar: { ...s.googleCalendar, enabled: data.enabled } }))
  }

  const toggleEmail = async () => {
    const { data } = await api.put('/integrations/email/toggle')
    setStatus(s => ({ ...s, email: { ...s.email, enabled: data.enabled } }))
  }

  if (!status) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00969E]/20 border-t-[#00969E] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Google result banner */}
      {googleResult === 'connected' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle size={16} /> Google Calendar חובר בהצלחה!
        </div>
      )}
      {googleResult === 'error' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle size={16} /> חיבור Google Calendar נכשל — נסה שוב
        </div>
      )}

      {/* Google Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-xs text-gray-400">סנכרן אימונים אוטומטית ליומן שלך</p>
          </div>
          <div className="mr-auto">
            {status.googleCalendar.connected ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle size={12} /> מחובר
              </span>
            ) : (
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">לא מחובר</span>
            )}
          </div>
        </div>

        {!status.googleCalendar.configured && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3">
            ⚠️ Google Calendar לא מוגדר בשרת — הוסף GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET
          </p>
        )}

        {status.googleCalendar.connected ? (
          <div className="flex items-center gap-3">
            <button onClick={toggleGoogle}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${status.googleCalendar.enabled ? 'bg-[#00969E]' : 'bg-gray-200'}`}>
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: status.googleCalendar.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
            <span className="text-sm text-gray-600">הוספה אוטומטית של אימונים ליומן</span>
            <button onClick={disconnectGoogle} className="mr-auto text-xs text-red-500 hover:text-red-700 underline">
              נתק
            </button>
          </div>
        ) : (
          <button onClick={connectGoogle} disabled={loading || !status.googleCalendar.configured}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
            <Calendar size={15} />
            {loading ? 'מחבר...' : 'חבר Google Calendar'}
          </button>
        )}
      </div>

      {/* Email notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#E6F7F8] text-[#00969E] flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">התראות אימייל</h3>
            <p className="text-xs text-gray-400">שלח מיילים אוטומטיים ללקוחות</p>
          </div>
        </div>

        {!status.email.configured && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3">
            ⚠️ SendGrid לא מוגדר — הוסף SENDGRID_API_KEY בשרת
          </p>
        )}

        <div className="space-y-3">
          {[
            { label: 'אישור קביעת אימון', desc: 'לקוח מקבל מייל כשנקבע אימון' },
            { label: 'ביטול אימון',       desc: 'לקוח מקבל מייל כשאימון מבוטל' },
            { label: 'תזכורת 24 שעות',   desc: 'תזכורת אוטומטית יום לפני האימון' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <button onClick={i === 0 ? toggleEmail : undefined}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${status.email.enabled ? 'bg-[#00969E]' : 'bg-gray-200'}`}>
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: status.email.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('google')) setTab('integrations')
  }, [searchParams])
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { businessName: user?.businessName, email: user?.email, phone: user?.phone }
  })

  const onProfile = async (data) => {
    await api.put('/auth/profile', data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'profile',      label: 'פרופיל',     icon: User     },
    { id: 'availability', label: 'זמינות',     icon: Clock    },
    { id: 'notifications',label: 'התראות',     icon: Bell     },
    { id: 'integrations', label: 'אינטגרציות', icon: Calendar },
    { id: 'security',     label: 'אבטחה',      icon: Lock     },
  ]

  const notifications = [
    { label: 'תזכורות SMS לאימונים',   sub: 'שלח תזכורות אוטומטיות ללקוחות 24 שעות לפני אימון', default: true  },
    { label: 'תזכורות תשלום',           sub: 'התראה ללקוחות כאשר חשבוניות באיחור',              default: true  },
    { label: 'התראות התקדמות',          sub: 'קבל התראה כאשר לקוח מסיים שבוע בתוכנית',          default: false },
    { label: 'סיכום שבועי',             sub: 'קבל דוח שבועי של מדדי העסק שלך',                  default: false },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[#00969E] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 text-center" style={{background: 'linear-gradient(135deg, #00969E 0%, #007A81 100%)'}}>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-3xl mx-auto mb-3 ring-4 ring-white/20">
              {user?.businessName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-bold text-white text-lg">{user?.businessName || 'העסק שלי'}</h2>
            <p className="text-white/70 text-sm">{user?.email}</p>
          </div>
          <form onSubmit={handleSubmit(onProfile)} className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">פרטי העסק</h3>
            {[
              { label: 'שם העסק / שם מלא', name: 'businessName', placeholder: 'למשל: דנה פיטנס' },
              { label: 'כתובת אימייל', name: 'email', type: 'email', placeholder: 'you@example.com', ltr: true },
              { label: 'מספר טלפון', name: 'phone', type: 'tel', placeholder: '050-000-0000', ltr: true },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input {...register(f.name)} type={f.type || 'text'} placeholder={f.placeholder} dir={f.ltr ? 'ltr' : 'rtl'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] focus:bg-white transition-all" />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20 disabled:opacity-60">
                <Save size={14} />{isSubmitting ? 'שומר...' : 'שמור שינויים'}
              </button>
              {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</div>נשמר!</span>}
            </div>
          </form>
        </div>
      )}

      {tab === 'availability'  && <AvailabilityTab />}
      {tab === 'integrations'  && <IntegrationsTab />}

      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">העדפות התראות</h3>
          <div className="space-y-4">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{n.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.sub}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                  <input type="checkbox" className="sr-only peer" defaultChecked={n.default} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#00969E] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">אבטחה ואינטגרציות</h3>
          <div className="space-y-3">
            {[
              { icon: Lock,   label: 'שנה סיסמה',              desc: 'עדכן את סיסמת החשבון שלך',                              color: 'bg-gray-50 text-gray-600'  },
              { icon: Share2, label: 'חיבור אינסטגרם',         desc: 'קשר את חשבון האינסטגרם שלך לפרסום פוסטים',             color: 'bg-pink-50 text-pink-600'  },
              { icon: Phone,  label: 'הגדרות SMS (Twilio)',     desc: 'הגדר תזכורות SMS ללקוחות שלך',                          color: 'bg-green-50 text-green-600' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all text-right group">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}><item.icon size={18} /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronLeft size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
