import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Globe, CheckCircle, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'upwell_onboarding_done'
const LANG_KEY = 'upwell_onboarding_lang'
const CHECKIN_24_KEY = 'upwell_checkin_24'
const CHECKIN_72_KEY = 'upwell_checkin_72'
const SIGNUP_TIME_KEY = 'upwell_signup_time'

const steps = [
  {
    id: 'add_client',
    video: '/onboarding/onboard_add_client.mp4',
    nav: '/clients/new',
    he: {
      title: 'שלב 1 — הוסף לקוח ראשון',
      text: 'לחץ על "לקוחות" בתפריט → "לקוח חדש" → מלא שם וטלפון → שמור.',
      cta: 'הוספתי לקוח ✓',
      navBtn: 'פתח הוספת לקוח',
    },
    en: {
      title: 'Step 1 — Add Your First Client',
      text: 'Click "Clients" in the menu → "New Client" → fill in name and phone → Save.',
      cta: 'I added a client ✓',
      navBtn: 'Open Add Client',
    },
  },
  {
    id: 'create_program',
    video: '/onboarding/onboard_create_program.mp4',
    nav: '/programs/new',
    he: {
      title: 'שלב 2 — צור תוכנית אימון',
      text: 'לחץ על "תוכניות" → "תוכנית חדשה" → הגדר שם, סוג ומשך → שמור.',
      cta: 'יצרתי תוכנית ✓',
      navBtn: 'פתח יצירת תוכנית',
    },
    en: {
      title: 'Step 2 — Create a Training Program',
      text: 'Click "Programs" → "New Program" → set name, type and duration → Save.',
      cta: 'I created a program ✓',
      navBtn: 'Open Create Program',
    },
  },
  {
    id: 'assign_program',
    video: '/onboarding/onboard_assign_program.mp4',
    nav: '/clients',
    he: {
      title: 'שלב 3 — שייך תוכנית ללקוח',
      text: 'פתח לקוח → לחץ "שייך תוכנית" → בחר תוכנית → אשר.',
      cta: 'שוניתי תוכנית ✓',
      navBtn: 'פתח רשימת לקוחות',
    },
    en: {
      title: 'Step 3 — Assign Program to Client',
      text: 'Open a client → click "Assign Program" → pick a program → confirm.',
      cta: 'I assigned a program ✓',
      navBtn: 'Open Clients',
    },
  },
  {
    id: 'calendar',
    video: '/onboarding/onboard_calendar.mp4',
    nav: '/calendar',
    he: {
      title: 'שלב 4 — קבע אימון ביומן',
      text: 'לחץ על "יומן" → "אימון חדש" → בחר לקוח ותאריך → שמור.',
      cta: 'קבעתי אימון ✓',
      navBtn: 'פתח יומן',
    },
    en: {
      title: 'Step 4 — Schedule a Session',
      text: 'Click "Calendar" → "New Session" → pick a client and date → Save.',
      cta: 'I scheduled a session ✓',
      navBtn: 'Open Calendar',
    },
  },
  {
    id: 'client_app',
    video: '/onboarding/onboard_client_app.mp4',
    nav: '/clients',
    he: {
      title: 'שלב 5 — שלח ללקוח את הגישה שלו',
      text: 'פתח את פרטי הלקוח → העתק את הקישור האישי → שלח ב-WhatsApp.',
      cta: 'שלחתי את הקישור ✓',
      navBtn: 'פתח לקוחות',
    },
    en: {
      title: 'Step 5 — Share Client App Link',
      text: "Open a client's details → copy their personal link → send via WhatsApp.",
      cta: 'I sent the link ✓',
      navBtn: 'Open Clients',
    },
  },
]

const t = {
  he: {
    welcome: 'ברוך הבא ל-UpWell! 👋',
    welcomeSub: 'בוא נגדיר הכל ב-5 דקות כדי שתוכל להתחיל לעבוד.',
    start: 'בואו נתחיל',
    skip: 'דלג על ההגדרה',
    done: '🎉 סיימת את ההגדרה!',
    doneSub: 'עכשיו אתה מוכן לנהל את העסק שלך עם UpWell.',
    close: 'סגור',
    of: 'מתוך',
    checkin24: 'היי! עברו 24 שעות — הצלחת להוסיף את הלקוח הראשון שלך?',
    checkin24cta: 'המשך הגדרה',
    checkin72: '💡 טיפ: רוב המאמנים מוסיפים 3 לקוחות בשבוע הראשון. רוצה עזרה?',
    checkin72cta: 'פתח מדריך',
    later: 'אחר כך',
  },
  en: {
    welcome: 'Welcome to UpWell! 👋',
    welcomeSub: "Let's set everything up in 5 minutes so you can get started.",
    start: "Let's go",
    skip: 'Skip setup',
    done: '🎉 Setup complete!',
    doneSub: "You're all set to manage your business with UpWell.",
    close: 'Close',
    of: 'of',
    checkin24: 'Hey! 24 hours in — did you manage to add your first client?',
    checkin24cta: 'Continue setup',
    checkin72: '💡 Tip: Most trainers add 3 clients in their first week. Want help?',
    checkin72cta: 'Open guide',
    later: 'Later',
  },
}

export default function OnboardingBot() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'he')
  const [phase, setPhase] = useState('hidden') // hidden | welcome | steps | done | checkin
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const [checkinType, setCheckinType] = useState(null) // '24' | '72'
  const videoRef = useRef(null)

  const isRTL = lang === 'he'

  useEffect(() => {
    if (!user || user.role !== 'trainer') return
    const done = localStorage.getItem(STORAGE_KEY)
    if (done) {
      // Check if we should show a check-in nudge
      const signupTime = parseInt(localStorage.getItem(SIGNUP_TIME_KEY) || '0', 10)
      if (!signupTime) return
      const hoursElapsed = (Date.now() - signupTime) / 36e5
      const shown24 = localStorage.getItem(CHECKIN_24_KEY)
      const shown72 = localStorage.getItem(CHECKIN_72_KEY)

      if (hoursElapsed >= 72 && !shown72) {
        setCheckinType('72')
        setPhase('checkin')
        setOpen(true)
      } else if (hoursElapsed >= 24 && !shown24) {
        setCheckinType('24')
        setPhase('checkin')
        setOpen(true)
      }
      return
    }

    // First time — record signup time and show welcome
    if (!localStorage.getItem(SIGNUP_TIME_KEY)) {
      localStorage.setItem(SIGNUP_TIME_KEY, Date.now().toString())
    }
    setPhase('welcome')
    setOpen(true)
  }, [user])

  // Reload video when step changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [step, phase])

  const switchLang = () => {
    const next = lang === 'he' ? 'en' : 'he'
    setLang(next)
    localStorage.setItem(LANG_KEY, next)
  }

  const startSteps = () => setPhase('steps')

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, '1')
      setPhase('done')
    }
  }

  const prevStep = () => { if (step > 0) setStep(s => s - 1) }

  const closeDone = () => setOpen(false)

  const dismissCheckin = () => {
    if (checkinType === '24') localStorage.setItem(CHECKIN_24_KEY, '1')
    if (checkinType === '72') localStorage.setItem(CHECKIN_72_KEY, '1')
    setOpen(false)
  }

  const continueCheckin = () => {
    if (checkinType === '24') localStorage.setItem(CHECKIN_24_KEY, '1')
    if (checkinType === '72') localStorage.setItem(CHECKIN_72_KEY, '1')
    localStorage.removeItem(STORAGE_KEY) // reopen onboarding
    setPhase('steps')
    setStep(0)
  }

  const tx = t[lang]
  const currentStep = steps[step]

  if (!user || user.role !== 'trainer') return null

  return (
    <>
      {/* Floating bubble — only when widget is closed and onboarding isn't complete */}
      {!open && !localStorage.getItem(STORAGE_KEY) && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00969E] rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-[#007A81] transition-colors"
          title={lang === 'he' ? 'פתח מדריך התחלה' : 'Open setup guide'}
        >
          <MessageCircle size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#00969E] to-[#007A81]">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-xs flex-shrink-0">UW</div>
            <span className="text-white font-semibold text-sm flex-1">UpWell Assistant</span>
            <button onClick={switchLang} className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors">
              <Globe size={13} />
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white ml-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Welcome phase */}
          {phase === 'welcome' && (
            <div className="p-5 flex flex-col gap-4">
              <div className="text-center">
                <p className="text-2xl mb-1">🚀</p>
                <p className="font-bold text-gray-900 text-base">{tx.welcome}</p>
                <p className="text-sm text-gray-500 mt-1">{tx.welcomeSub}</p>
              </div>

              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-[#E6F7F8] text-[#00969E] flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {s[lang].title.replace(/שלב \d — |Step \d — /, '')}
                  </div>
                ))}
              </div>

              <button onClick={startSteps} className="w-full py-2.5 bg-[#00969E] text-white font-semibold rounded-xl hover:bg-[#007A81] transition-colors text-sm">
                {tx.start}
              </button>
              <button onClick={skip} className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
                {tx.skip}
              </button>
            </div>
          )}

          {/* Steps phase */}
          {phase === 'steps' && (
            <div className="flex flex-col">
              {/* Progress bar */}
              <div className="flex gap-1 px-4 pt-3">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#00969E]' : 'bg-gray-200'}`} />
                ))}
              </div>

              {/* Video */}
              <div className="mx-4 mt-3 rounded-xl overflow-hidden bg-gray-900 aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  muted
                >
                  <source src={currentStep.video} type="video/mp4" />
                </video>
              </div>

              {/* Text */}
              <div className="px-4 pt-3 pb-1">
                <p className="font-bold text-gray-900 text-sm">{currentStep[lang].title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{currentStep[lang].text}</p>
              </div>

              {/* Nav button */}
              <div className="px-4 pt-2">
                <button
                  onClick={() => { navigate(currentStep.nav); setOpen(false) }}
                  className="w-full py-2 border border-[#00969E] text-[#00969E] font-medium rounded-xl hover:bg-[#E6F7F8] transition-colors text-xs"
                >
                  {currentStep[lang].navBtn} →
                </button>
              </div>

              {/* Step counter + nav arrows */}
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <span className="text-xs text-gray-400">{step + 1} {tx.of} {steps.length}</span>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00969E] text-white font-semibold rounded-xl hover:bg-[#007A81] transition-colors text-xs"
                >
                  <CheckCircle size={14} />
                  {currentStep[lang].cta}
                </button>
              </div>
            </div>
          )}

          {/* Done phase */}
          {phase === 'done' && (
            <div className="p-5 text-center flex flex-col gap-4">
              <div>
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-gray-900 text-base">{tx.done}</p>
                <p className="text-sm text-gray-500 mt-1">{tx.doneSub}</p>
              </div>
              <div className="flex flex-col gap-2">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    {s[lang].title.replace(/שלב \d — |Step \d — /, '')}
                  </div>
                ))}
              </div>
              <button onClick={closeDone} className="w-full py-2.5 bg-[#00969E] text-white font-semibold rounded-xl hover:bg-[#007A81] transition-colors text-sm">
                {tx.close}
              </button>
            </div>
          )}

          {/* Check-in phase */}
          {phase === 'checkin' && (
            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {checkinType === '24' ? tx.checkin24 : tx.checkin72}
              </p>
              <button onClick={continueCheckin} className="w-full py-2.5 bg-[#00969E] text-white font-semibold rounded-xl hover:bg-[#007A81] transition-colors text-sm">
                {checkinType === '24' ? tx.checkin24cta : tx.checkin72cta}
              </button>
              <button onClick={dismissCheckin} className="text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
                {tx.later}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
