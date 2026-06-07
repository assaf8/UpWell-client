import { Link } from 'react-router-dom'
import { CheckCircle, Users, Calendar, FileText, TrendingUp, MessageCircle, Share2, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Users,         title: 'ניהול לקוחות',       desc: 'כרטסת לקוחות מלאה, היסטוריה, תוכניות אישיות ומעקב התקדמות.' },
  { icon: Calendar,      title: 'יומן אימונים',        desc: 'תזמן אימונים, שלח תזכורות WhatsApp ו-SMS בלחיצה אחת.' },
  { icon: TrendingUp,    title: 'מעקב מדדים',          desc: 'גרפים של משקל, שומן גוף ומידות — המתאמן רואה את ההתקדמות שלו.' },
  { icon: FileText,      title: 'חשבוניות דיגיטליות', desc: 'הנפק חשבוניות עם מע"מ, שלח PDF ב-WhatsApp, התחבר ל-Green Invoice.' },
  { icon: MessageCircle, title: 'צ׳אט בזמן אמת',      desc: 'תקשורת ישירה עם מתאמנים — הודעות, תמונות ויומן אוכל עם AI.' },
  { icon: Share2,        title: 'רשתות חברתיות',      desc: 'פרסם תכנים ל-Instagram עם כיתובים שנוצרו ע"י בינה מלאכותית.' },
]

const STATS = [
  { value: '2,400+', label: 'מאמנים פעילים' },
  { value: '18K+',   label: 'תוכניות נוצרו'  },
  { value: '94%',    label: 'שימור לקוחות'   },
  { value: '₪0',     label: 'עלות להתחלה'    },
]

const PRICING = [
  {
    name: 'Starter',
    price: '₪0',
    period: 'לנצח',
    color: 'border-gray-100',
    highlight: false,
    features: ['עד 5 לקוחות', 'יומן אימונים', 'פורטל מתאמן בסיסי', 'צ׳אט'],
  },
  {
    name: 'Pro',
    price: '₪149',
    period: 'לחודש',
    color: 'border-[#00969E]',
    highlight: true,
    features: ['לקוחות ללא הגבלה', 'WhatsApp תזכורות', 'חשבוניות + PDF', 'Instagram פרסום', 'מעקב מדדים + גרפים', 'AI ניתוח קלוריות'],
  },
  {
    name: 'Studio',
    price: '₪399',
    period: 'לחודש',
    color: 'border-gray-100',
    highlight: false,
    features: ['הכל ב-Pro', 'מאמנים מרובים', 'לוגו מותאם אישית', 'API גישה', 'תמיכה עדיפותית'],
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl" lang="he">
      {/* Skip to main content */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-[#00969E] text-white px-4 py-2 rounded-xl z-50 font-semibold text-sm">
        דלג לתוכן הראשי
      </a>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" aria-label="ניווט ראשי">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#00969E] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">UW</span>
            </div>
            <span className="font-black text-xl text-gray-900">UpWell</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">כניסה</Link>
            <Link to="/signup" className="px-5 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
              התחל בחינם
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" className="relative overflow-hidden bg-gradient-to-br from-[#00969E] via-[#007A81] to-[#005f66] text-white" aria-label="כותרת ראשית">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap size={14} className="text-yellow-300" />
            פלטפורמה מספר 1 למקצועות הבריאות והוולנס
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            UpWell.<br />
            <span className="text-white/80">לצמוח יחד.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            לקוחות, תוכניות, חשבוניות, סרטונים — הכל בפלטפורמה אחת.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#00969E] rounded-2xl font-black text-base hover:bg-gray-50 transition-all shadow-2xl">
              התחל בחינם — ללא כרטיס אשראי
            </Link>
            <Link to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-semibold text-base backdrop-blur transition-all">
              כניסה לחשבון קיים
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-[#00969E]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-3">כל מה שצריך כדי לצמוח את העסק שלך</h2>
          <p className="text-gray-500 text-lg">תוכנה שמבינה את עסק הבריאות והוולנס שלך</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#00969E]/20 hover:shadow-lg hover:shadow-[#00969E]/5 transition-all group">
              <div className="w-12 h-12 bg-[#E6F7F8] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#00969E] transition-colors">
                <f.icon size={22} className="text-[#00969E] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trainee portal highlight */}
      <section className="bg-gradient-to-br from-[#E6F7F8] to-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#00969E]/10 text-[#00969E] px-3 py-1 rounded-full text-xs font-bold mb-4">
                ✨ חדש — פורטל מתאמן
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">המתאמנים שלך<br />יאהבו את החוויה</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                כל מתאמן מקבל אפליקציה אישית — הזמנת אימונים לפי זמינות המאמן, צ׳אט בזמן אמת, מעקב מדדים עם גרפים, ויומן אוכל עם ניתוח קלוריות ב-AI.
              </p>
              <ul className="space-y-3">
                {['הזמנת אימונים לפי זמינות בזמן אמת', 'צ׳אט ישיר + שיתוף תמונות', 'מעקב משקל ומדות עם גרף', 'יומן אוכל + ניתוח AI', 'צפייה בתוכניות אימון ווידאו'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-[#00969E] flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
              {/* Mock trainee portal UI */}
              <div className="bg-gradient-to-br from-[#00969E] to-[#005f66] rounded-2xl p-5 text-white mb-4">
                <p className="text-xs text-white/70 mb-1">שלום שרה 👋</p>
                <p className="font-black text-lg">האימון הבא שלך</p>
                <p className="text-white/80 text-sm mt-1">יום ג׳ · 10:00 · עם יוני מאמן</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[['⚖️', '72.3', 'ק"ג'], ['🔥', '18%', 'שומן'], ['📏', '78', 'מותן']].map(([e, v, u]) => (
                  <div key={u} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-sm">{e}</p>
                    <p className="font-black text-gray-900 text-sm">{v}</p>
                    <p className="text-[10px] text-gray-400">{u}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#E6F7F8] rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#00969E] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">הודעה חדשה מהמאמן</p>
                  <p className="text-xs text-gray-400">כל הכבוד על האימון של אתמול! 💪</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-gray-900 mb-3">מחירים שקופים</h2>
          <p className="text-gray-500">שדרג בכל עת. בטל בכל עת.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map(p => (
            <div key={p.name}
              className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col ${p.color} ${p.highlight ? 'shadow-2xl shadow-[#00969E]/10 scale-105' : ''}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00969E] text-white text-xs font-bold px-4 py-1 rounded-full">
                  הכי פופולרי
                </div>
              )}
              <div className="mb-6">
                <p className="font-bold text-gray-500 text-sm mb-1">{p.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm">/{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={14} className={p.highlight ? 'text-[#00969E]' : 'text-gray-400'} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup"
                className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all ${
                  p.highlight
                    ? 'bg-[#00969E] hover:bg-[#007A81] text-white shadow-lg shadow-[#00969E]/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                התחל עכשיו
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#00969E] to-[#005f66] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-black mb-4">מוכן לקחת את העסק לרמה הבאה?</h2>
          <p className="text-white/70 text-lg mb-8">הצטרף לאלפי מאמנים שכבר עובדים חכם יותר עם UpWell.</p>
          <Link to="/signup"
            className="inline-block px-10 py-4 bg-white text-[#00969E] rounded-2xl font-black text-base hover:bg-gray-50 transition-all shadow-2xl">
            התחל בחינם — ללא כרטיס אשראי
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#00969E] rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-black text-[10px]">UW</span>
            </div>
            <span className="font-bold text-gray-700">UpWell</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 UpWell. כל הזכויות שמורות.</p>
          <nav className="flex gap-4 text-sm" aria-label="קישורים משפטיים">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded transition-colors">פרטיות</Link>
            <Link to="/terms"   className="text-gray-400 hover:text-gray-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded transition-colors">תנאים</Link>
            <Link to="/health"  className="text-gray-400 hover:text-gray-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded transition-colors">כתב ויתור בריאות</Link>
            <a href="mailto:assaf8@gmail.com" className="text-gray-400 hover:text-gray-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded transition-colors">צור קשר</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
