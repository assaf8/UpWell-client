import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'

const HE = {
  title: 'תנאי שימוש',
  updated: 'עודכן לאחרונה: יוני 2026',
  sections: [
    {
      heading: 'הסכמה לתנאים',
      body: [
        'שימוש ב-UpWell מהווה הסכמה לתנאים אלה במלואם.',
        'אם אינך מסכים לתנאים, אנא הפסק להשתמש בשירות.',
        'תנאים אלה עשויים להשתנות — נודיע לך בדוא"ל על שינויים מהותיים.',
      ],
    },
    {
      heading: 'שימוש בחשבון',
      body: [
        'אתה אחראי לכל פעילות שתתבצע בחשבונך.',
        'שמור על סיסמתך בצורה מאובטחת — אל תשתף אותה.',
        'אתה הבעלים של התוכן שלך (תוכניות, וידאו, נתוני לקוחות).',
        'אסור להשתמש ב-UpWell למטרות בלתי חוקיות.',
        'אתה מסכים לקבלת הודעות SMS מ-UpWell (ניתן לבטל בכל עת).',
      ],
    },
    {
      heading: 'מאמנים ומדריכים',
      body: [
        'אתה אחראי לבטיחות תוכניות האימון שאתה מפתח.',
        'עליך להחזיק בהסמכות המקצועיות הנדרשות לתחומך.',
        'אתה נושא באחריות המלאה לתוכן שאתה מעלה ולשירות שאתה מספק ללקוחותיך.',
        'UpWell לא בודקת ולא מאשרת הסמכות מקצועיות.',
      ],
    },
    {
      heading: 'הגבלת אחריות',
      body: [
        'UpWell אינה אחראית לתוצאות תוכניות האימון.',
        'UpWell אינה אחראית לפציעות לקוחות.',
        'UpWell אינה אחראית לאובדן נתונים (מעבר למחויבות הגיבוי שלנו).',
        'השירות ניתן "כמות שהוא" — אנחנו לא מבטיחים זמינות 100%.',
      ],
    },
    {
      heading: 'תשלום ומנוי',
      body: [
        'מנוי חודשי בין 149 ₪ ל-399 ₪ בהתאם לתכנית שנבחרה.',
        'חיוב אוטומטי מתחדש — ניתן לבטל בכל עת.',
        'לא מוחזרים תשלומים על חודשים חלקיים.',
        'ביטול יכנס לתוקף בסוף תקופת החיוב הנוכחית.',
      ],
    },
    {
      heading: 'סיום שירות',
      body: [
        'אנחנו שומרים את הזכות להשעות חשבון שמפר את התנאים.',
        'במקרה של סיום, תקבל הודעה מוקדמת של 7 ימים.',
        'תוכל לייצא את הנתונים שלך לפני הסגירה.',
      ],
    },
  ],
}

const EN = {
  title: 'Terms of Service',
  updated: 'Last updated: June 2026',
  sections: [
    {
      heading: 'Acceptance of Terms',
      body: [
        'By using UpWell, you agree to these Terms in full.',
        'If you disagree with any part, please stop using the service.',
        'These terms may change — we will notify you by email of material updates.',
      ],
    },
    {
      heading: 'Account Use',
      body: [
        'You are responsible for all activity in your account.',
        'Keep your password secure — do not share it.',
        'You own your content (programs, videos, client data).',
        'You may not use UpWell for unlawful purposes.',
        'You consent to receiving SMS notifications from UpWell (opt-out any time).',
      ],
    },
    {
      heading: 'Trainers & Coaches',
      body: [
        'You are responsible for the safety of the programs you create.',
        'You must hold valid professional certifications for your field.',
        'You bear full responsibility for the content you upload and the service you provide to clients.',
        'UpWell does not verify or endorse professional certifications.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      body: [
        'UpWell is not liable for training program outcomes.',
        'UpWell is not liable for client injuries.',
        'UpWell is not liable for data loss (beyond our backup commitment).',
        'The service is provided "as is" — we do not guarantee 100% uptime.',
      ],
    },
    {
      heading: 'Payment & Subscription',
      body: [
        'Monthly subscription from ₪149 to ₪399 depending on selected plan.',
        'Automatic recurring billing — cancel any time.',
        'No refunds for partial months.',
        'Cancellation takes effect at the end of the current billing period.',
      ],
    },
    {
      heading: 'Termination',
      body: [
        'We reserve the right to suspend accounts that violate these Terms.',
        'In case of termination, you will receive 7 days notice.',
        'You may export your data before account closure.',
      ],
    },
  ],
}

export default function Terms() {
  const [lang, setLang] = useState('he')
  const t = lang === 'he' ? HE : EN

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang}>
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-[#00969E] text-white px-4 py-2 rounded-xl z-50 font-semibold text-sm">
        {lang === 'he' ? 'דלג לתוכן' : 'Skip to content'}
      </a>

      <header className="bg-white border-b border-gray-100" role="banner">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded-lg"
            aria-label={lang === 'he' ? 'חזרה לדף הבית' : 'Back to home'}>
            <ArrowRight size={16} aria-hidden="true" />
            <span className="text-sm font-medium">{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang('he')} aria-pressed={lang === 'he'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] ${lang === 'he' ? 'bg-[#007A81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              עברית
            </button>
            <button onClick={() => setLang('en')} aria-pressed={lang === 'en'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] ${lang === 'en' ? 'bg-[#007A81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              English
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#E6F7F8] rounded-2xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <FileText size={28} className="text-[#00969E]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.updated}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-8">
          <p className="text-amber-800 text-sm font-medium">
            {lang === 'he'
              ? 'שימוש בשירות מהווה הסכמה לתנאים הבאים. אנא קרא בעיון.'
              : 'Use of the service constitutes acceptance of these terms. Please read carefully.'}
          </p>
        </div>

        <div className="space-y-8">
          {t.sections.map((sec, i) => (
            <section key={i} aria-labelledby={`terms-section-${i}`}>
              <h2 id={`terms-section-${i}`} className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00969E] text-white text-xs flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">{i + 1}</span>
                {sec.heading}
              </h2>
              <ul className="space-y-2" role="list">
                {sec.body.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00969E] mt-2 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <nav className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm" aria-label={lang === 'he' ? 'דפים משפטיים' : 'Legal pages'}>
          <Link to="/privacy" className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}</Link>
          <Link to="/health"  className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'כתב ויתור בריאות' : 'Health Disclaimer'}</Link>
          <Link to="/terms"   className="text-gray-400 font-medium">{lang === 'he' ? 'תנאי שימוש (עמוד נוכחי)' : 'Terms of Service (current)'}</Link>
        </nav>
      </main>
    </div>
  )
}
