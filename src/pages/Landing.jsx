import { Link } from 'react-router-dom'
import { CheckCircle, Users, Calendar, FileText, TrendingUp, MessageCircle, Share2, Zap, Star, Building2, ArrowLeft, Phone, BarChart2, Dumbbell, Target, ChevronRight } from 'lucide-react'

const FEATURES = [
  { icon: Users,         title: 'ניהול לקוחות',       desc: 'כרטסת לקוחות מלאה, היסטוריה, תוכניות אישיות ומעקב התקדמות.' },
  { icon: Calendar,      title: 'יומן אימונים',        desc: 'תזמן אימונים, שלח תזכורות WhatsApp ו-SMS בלחיצה אחת.' },
  { icon: TrendingUp,    title: 'מעקב מדדים',          desc: 'גרפים של משקל, שומן גוף ומידות — המתאמן רואה את ההתקדמות שלו.' },
  { icon: FileText,      title: 'חשבוניות דיגיטליות', desc: 'הנפק חשבוניות עם מע"מ, שלח PDF ב-WhatsApp, התחבר ל-Green Invoice.' },
  { icon: MessageCircle, title: 'צ׳אט בזמן אמת',      desc: 'תקשורת ישירה עם מתאמנים — הודעות, תמונות ויומן אוכל עם AI.' },
  { icon: Share2,        title: 'רשתות חברתיות',      desc: 'פרסם תכנים ל-Instagram עם כיתובים שנוצרו ע"י בינה מלאכותית.' },
]

const STATS = [
  { value: 'חינם', label: 'חודש ניסיון ראשון' },
  { value: '₪49',  label: 'Starter לחודש' },
  { value: '₪199', label: 'Pro לחודש' },
  { value: '₪349', label: 'Studio לחודש' },
]

const PRICING = [
  {
    name:      'Starter',
    price:     '₪49',
    period:    'לחודש',
    icon:      Zap,
    color:     'border-gray-100',
    iconColor: 'from-blue-500 to-blue-600',
    highlight: false,
    badge:     null,
    maxClients: 'עד 10 לקוחות',
    features:  ['עד 10 לקוחות', 'יומן אימונים', 'צ׳אט בזמן אמת', 'תוכניות אימון ותזונה', 'אפליקציית לקוח'],
  },
  {
    name:      'Pro',
    price:     '₪199',
    period:    'לחודש',
    icon:      Star,
    color:     'border-[#00969E]',
    iconColor: 'from-[#00969E] to-[#005f66]',
    highlight: true,
    badge:     'הכי פופולרי ⭐',
    maxClients: 'עד 50 לקוחות',
    features:  ['עד 50 לקוחות', 'כל פיצ׳רי Starter', 'דוחות מתקדמים', 'ניהול לידים ו-CRM', 'WhatsApp תזכורות', 'תמיכה מועדפת'],
  },
  {
    name:      'Studio',
    price:     '₪349',
    period:    'לחודש',
    icon:      Building2,
    color:     'border-gray-100',
    iconColor: 'from-amber-500 to-orange-500',
    highlight: false,
    badge:     null,
    maxClients: 'לקוחות ללא הגבלה',
    features:  ['לקוחות ללא הגבלה', 'כל פיצ׳רי Pro', 'מיתוג אישי', 'API גישה', 'תמיכת VIP 24/7'],
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'נרשם ומגדיר את העסק',
    desc: 'הרשמה ב-2 דקות — שם העסק, תחום, תמונת פרופיל. מוכן לעבודה.',
    color: 'from-[#00969E] to-[#007A81]',
  },
  {
    step: '02',
    title: 'מוסיף לקוחות ותוכניות',
    desc: 'הוסף לקוחות, צור תוכניות אימון/תזונה עם AI, ושבץ ללקוחות.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    step: '03',
    title: 'מתאמן רואה הכל מהנייד',
    desc: 'הלקוח מקבל גישה אישית — הזמנת אימונים, תוכניות, גרפים וצ׳אט.',
    color: 'from-orange-400 to-orange-600',
  },
]

/* ── Mock Dashboard UI component ── */
function DashboardMockup() {
  return (
    <div className="relative" dir="ltr">
      {/* Main dashboard card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-[#0A1628] to-[#0D1F3C]">
          <div className="w-7 h-7 rounded-lg bg-[#00969E] flex items-center justify-center">
            <span className="text-white font-black text-[9px]">UW</span>
          </div>
          <span className="text-white font-bold text-sm">UpWell</span>
          <div className="mr-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>
        <div className="p-5">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">בוקר טוב,</p>
              <p className="font-black text-gray-900 text-sm">יוני פיטנס 💪</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00969E] to-green-500 flex items-center justify-center text-white font-bold text-xs">Y</div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: '👥', val: '—',  label: 'לקוחות', color: 'bg-teal-50' },
              { icon: '🏋️', val: '—',  label: 'תוכניות', color: 'bg-purple-50' },
              { icon: '📅', val: '—',  label: 'אימונים', color: 'bg-orange-50' },
              { icon: '📈', val: '—',  label: 'הכנסות', color: 'bg-green-50' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-center`}>
                <p className="text-base">{s.icon}</p>
                <p className="font-black text-gray-900 text-xs">{s.val}</p>
                <p className="text-[9px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div className="bg-gray-50 rounded-2xl p-3 mb-3">
            <p className="text-[10px] text-gray-400 mb-2 font-semibold">אימונים החודש</p>
            <div className="flex items-end gap-1 h-10">
              {[4,7,5,9,6,11,8,13,10,8,12,9,14,11].map((v,i) => (
                <div key={i} className="flex-1 rounded-sm transition-all"
                  style={{ height: `${(v/14)*100}%`, background: i === 13 ? '#00969E' : '#E6F7F8' }} />
              ))}
            </div>
          </div>

          {/* Recent clients mini list */}
          <div className="space-y-1.5">
            {[
              { name: 'שרה כהן', status: 'אימון מחר', dot: 'bg-green-400' },
              { name: 'דני לוי', status: 'תוכנית חדשה', dot: 'bg-blue-400' },
              { name: 'מיכל ברק', status: 'דיווח ממתין', dot: 'bg-orange-400' },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 border border-gray-50 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00969E]/20 to-[#00969E]/5 flex items-center justify-center text-[#00969E] font-bold text-[10px]">
                  {c.name[0]}
                </div>
                <span className="text-[11px] font-semibold text-gray-900 flex-1">{c.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className="text-[9px] text-gray-400">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification card */}
      <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-2.5 w-48">
        <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageCircle size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-900">WhatsApp נשלח ✓</p>
          <p className="text-[9px] text-gray-400">תזכורת לשרה כהן</p>
        </div>
      </div>

      {/* Floating card */}
      <div className="absolute -top-5 -right-6 bg-gradient-to-br from-[#00969E] to-[#005f66] rounded-2xl shadow-xl p-3 text-white w-36">
        <p className="text-[9px] text-white/70 mb-0.5">לוח הבקרה שלך</p>
        <p className="font-black text-sm">הכל במקום אחד</p>
        <p className="text-[9px] text-green-300 mt-0.5">לקוחות · יומן · צ׳אט</p>
      </div>
    </div>
  )
}

/* ── Mock Trainee Phone UI ── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-48" dir="ltr">
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-gradient-to-r from-[#00969E] to-[#005f66] px-4 pt-3 pb-5">
            <div className="flex justify-between text-[8px] text-white/60 mb-3">
              <span>9:41</span><span>●●●</span>
            </div>
            <p className="text-[9px] text-white/70">שלום שרה 👋</p>
            <p className="text-white font-black text-sm">האימון הבא</p>
            <p className="text-white/80 text-[10px]">מחר · 10:00 · יוני</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-1.5 p-3 -mt-2">
            {[['⚖️','72.3','ק"ג'],['🔥','18%','שומן'],['📏','78','מותן']].map(([e,v,u]) => (
              <div key={u} className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-xs">{e}</p>
                <p className="font-black text-gray-900 text-[11px]">{v}</p>
                <p className="text-[8px] text-gray-400">{u}</p>
              </div>
            ))}
          </div>

          {/* Program */}
          <div className="px-3 pb-2">
            <div className="bg-purple-50 rounded-xl p-2.5">
              <p className="text-[9px] font-bold text-purple-700 mb-1">📋 התוכנית שלי</p>
              {['שבוע 3 — כוח עליון','5 אימונים | 12 סרטונים'].map(t => (
                <p key={t} className="text-[9px] text-gray-500">{t}</p>
              ))}
            </div>
          </div>

          {/* Chat bubble */}
          <div className="px-3 pb-3">
            <div className="bg-[#E6F7F8] rounded-xl p-2.5 flex items-start gap-2">
              <div className="w-5 h-5 bg-[#00969E] rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle size={10} className="text-white" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-700">מהמאמן</p>
                <p className="text-[8px] text-gray-500">כל הכבוד על האימון! 💪</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-4 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg">
        Live ●
      </div>
    </div>
  )
}

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
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">פיצ׳רים</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">איך זה עובד</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">מחירים</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">כניסה</Link>
            <Link to="/signup" className="px-5 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#00969E]/20">
              התחל בחינם
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="main-content" className="relative overflow-hidden bg-gradient-to-br from-[#00969E] via-[#007A81] to-[#005f66] text-white" aria-label="כותרת ראשית">
        {/* BG blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-white/3 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap size={14} className="text-yellow-300" />
                פלטפורמה לאנשי וולנס בישראל
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                UpWell.<br />
                <span className="text-white/80">לצמוח יחד.</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                לקוחות, תוכניות, חשבוניות, סרטונים — הכל בפלטפורמה אחת. המאמנים הכי טובים בישראל כבר כאן.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <Link to="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#00969E] rounded-2xl font-black text-base hover:bg-gray-50 transition-all shadow-2xl flex items-center justify-center gap-2">
                  התחל בחינם — ללא כרטיס אשראי
                  <ArrowLeft size={16} />
                </Link>
                <Link to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-semibold text-base backdrop-blur transition-all text-center">
                  כניסה לחשבון קיים
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/90">
                  <span>🔒</span> SSL מאובטח
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/90">
                  <span>🇮🇱</span> שרתים בישראל
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs text-white/90">
                  <span>✅</span> ללא כרטיס אשראי
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="hidden lg:flex justify-center items-center py-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-[#00969E]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-[#E6F7F8] text-[#00969E] text-xs font-bold px-3 py-1 rounded-full mb-3">תהליך פשוט</span>
          <h2 className="text-3xl font-black text-gray-900 mb-3">מוכן לעבוד תוך 5 דקות</h2>
          <p className="text-gray-500 text-lg">שלושה צעדים ואתה מנהל את העסק שלך בצורה חכמה</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 right-[16.6%] left-[16.6%] h-0.5 bg-gradient-to-l from-orange-200 via-purple-200 to-[#00969E]/30" />
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg shadow-black/10`}>
                <span className="text-white font-black text-2xl">{step.step}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-[#E6F7F8] text-[#00969E] text-xs font-bold px-3 py-1 rounded-full mb-3">פיצ׳רים</span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">כל מה שצריך כדי להצמיח את העסק שלך</h2>
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
        </div>
      </section>

      {/* ── Trainee portal ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Phone mockup */}
            <div className="flex justify-center py-8">
              <PhoneMockup />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#00969E]/10 text-[#00969E] px-3 py-1 rounded-full text-xs font-bold mb-4">
                ✨ פורטל מתאמן
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">המתאמנים שלך<br />יאהבו את החוויה</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                כל מתאמן מקבל אפליקציה אישית — הזמנת אימונים לפי זמינות המאמן, צ׳אט בזמן אמת, מעקב מדדים עם גרפים, ויומן אוכל עם ניתוח קלוריות ב-AI.
              </p>
              <ul className="space-y-3 mb-8">
                {['הזמנת אימונים לפי זמינות בזמן אמת', 'צ׳אט ישיר + שיתוף תמונות', 'מעקב משקל ומדות עם גרף', 'יומן אוכל + ניתוח AI', 'צפייה בתוכניות אימון ווידאו'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-[#00969E] flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00969E] text-white rounded-2xl font-bold hover:bg-[#007A81] transition-all shadow-lg shadow-[#00969E]/20">
                התחל חינם
                <ArrowLeft size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leads / CRM highlight ── */}
      <section className="bg-gradient-to-br from-purple-50 to-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                🆕 חדש — ניהול לידים
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">הפוך פניות<br />ללקוחות משלמים</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                עקוב אחרי כל ליד מהרגע שפנה אליך — מקור הפניה, שלב הפאנל, תאריך מעקב, ושלח תזכורת WhatsApp בלחיצה אחת.
              </p>
              <ul className="space-y-3">
                {['פאנל מכירות חזותי (חדש ← עניין ← לקוח)', 'שלח WhatsApp ישירות מהמערכת', 'תזכורות מעקב עם תאריך', 'סטטיסטיקות המרה'].map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-purple-500 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* CRM mockup */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-purple-600" />
                  <span className="font-bold text-gray-900 text-sm">לידים פעילים</span>
                </div>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">8 לידים</span>
              </div>
              {/* Funnel pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[['3','🆕 חדש','blue'],['2','🔥 עניין','orange'],['2','✅ הומר','green'],['1','❌ אבד','red']].map(([n,l,c]) => (
                  <span key={l} className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${c}-100 text-${c}-700`}>
                    {n} {l}
                  </span>
                ))}
              </div>
              {/* Lead cards */}
              {[
                { name: 'אורן שמש', status: '🔥 מעוניין', src: 'Instagram', phone: '05X' },
                { name: 'טל גפן', status: '📞 נוצר קשר', src: 'המלצה', phone: '05X' },
                { name: 'ליאת מור', status: '🆕 חדש', src: 'אתר', phone: '05X' },
              ].map(l => (
                <div key={l.name} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                    {l.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-400">{l.src}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{l.status}</span>
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={10} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="pricing">
        <div className="text-center mb-4">
          <span className="inline-block bg-[#E6F7F8] text-[#00969E] text-xs font-bold px-3 py-1 rounded-full mb-3">מחירים</span>
          <h2 className="text-3xl font-black text-gray-900 mb-3">מחירים שקופים</h2>
          <p className="text-gray-500 text-lg">שדרג בכל עת · בטל בכל עת · ללא עמלות נסתרות</p>
        </div>

        {/* Free trial banner */}
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E6F7F8] to-blue-50 border border-[#00969E]/20 rounded-2xl px-6 py-3 mb-10 w-fit mx-auto">
          <Zap size={16} className="text-[#00969E]" />
          <p className="text-sm font-bold text-[#007A81]">החודש הראשון חינם לכולם — ללא כרטיס אשראי</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map(p => (
            <div key={p.name}
              className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col ${p.color} ${p.highlight ? 'shadow-2xl shadow-[#00969E]/15 md:-mt-4 md:-mb-4' : ''}`}>
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00969E] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-[#00969E]/30">
                  {p.badge}
                </div>
              )}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${p.iconColor} flex items-center justify-center shadow-md`}>
                  <p.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.maxClients}</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{p.price}</span>
                  <span className="text-gray-400 text-sm">/{p.period}</span>
                </div>
                <p className="text-xs text-[#00969E] font-semibold mt-1">+ חודש ניסיון חינם</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={14} className={p.highlight ? 'text-[#00969E]' : 'text-gray-300'} fill={p.highlight ? '#E6F7F8' : 'transparent'} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup"
                className={`w-full py-3.5 rounded-2xl text-sm font-bold text-center transition-all ${
                  p.highlight
                    ? 'bg-[#00969E] hover:bg-[#007A81] text-white shadow-lg shadow-[#00969E]/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                התחל חינם
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">כל המחירים כוללים מע"מ · תשלום חודשי · ביטול בכל עת</p>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#00969E] to-[#005f66] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-black mb-4">מוכן לקחת את העסק לרמה הבאה?</h2>
          <p className="text-white/70 text-lg mb-8">התחל לנהל את העסק שלך בצורה חכמה יותר עם UpWell.</p>
          <Link to="/signup"
            className="inline-block px-10 py-4 bg-white text-[#00969E] rounded-2xl font-black text-base hover:bg-gray-50 transition-all shadow-2xl">
            התחל בחינם — ללא כרטיס אשראי
          </Link>
          <p className="text-white/50 text-xs mt-4">ללא כרטיס אשראי · ביטול בכל עת · תמיכה בעברית</p>
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
            <Link to="/privacy" className="text-gray-400 hover:text-gray-700 transition-colors">פרטיות</Link>
            <Link to="/terms"   className="text-gray-400 hover:text-gray-700 transition-colors">תנאים</Link>
            <Link to="/health"  className="text-gray-400 hover:text-gray-700 transition-colors">כתב ויתור בריאות</Link>
            <a href="mailto:assaf8@gmail.com" className="text-gray-400 hover:text-gray-700 transition-colors">צור קשר</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
