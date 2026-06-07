import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'

const HE = {
  title: 'מדיניות פרטיות',
  updated: 'עודכן לאחרונה: יוני 2026',
  sections: [
    {
      heading: 'מה אנחנו אוספים',
      body: [
        'שם, כתובת אימייל וטלפון',
        'נתוני לקוחות שאתה מזין (שמות, פרטי קשר, היסטוריית אימונים)',
        'מידע על תהליכי אימון ותשלום',
        'צפיות בוידאו ונתוני התקדמות',
        'תמונות יומן אוכל שהמתאמן מעלה (לצורך ניתוח תזונתי בלבד)',
      ],
    },
    {
      heading: 'איך אנחנו מגינים על המידע',
      body: [
        'הצפנה מלאה בהעברת נתונים (HTTPS/TLS)',
        'שרתים מאובטחים עם גיבוי קבוע',
        'גישה מוגבלת לנתונים — רק עובדים מורשים',
        'אנחנו לא שומרים פרטי כרטיס אשראי',
      ],
    },
    {
      heading: 'מה אנחנו לא עושים',
      body: [
        'לא מוכרים את הנתונים שלך לאף גורם',
        'לא משתפים מידע עם צדדים שלישיים — למעט Twilio (לשליחת SMS/WhatsApp) ו-Instagram API (לפרסום תוכן)',
        'לא משתמשים בנתונים לצרכי שיווק ללא הסכמה',
        'לא מחזיקים נתונים אחרי מחיקת החשבון (תוך 30 יום)',
      ],
    },
    {
      heading: 'הזכויות שלך',
      body: [
        'גישה לנתונים שלך בכל עת',
        'תיקון או מחיקה של נתונים אישיים',
        'ייצוא הנתונים שלך בפורמט נגיש',
        'בקשה לעיון ב-24 שעות',
      ],
    },
    {
      heading: 'יצירת קשר',
      body: ['לשאלות בנושא פרטיות: assaf8@gmail.com'],
    },
  ],
}

const EN = {
  title: 'Privacy Policy',
  updated: 'Last updated: June 2026',
  sections: [
    {
      heading: 'What We Collect',
      body: [
        'Name, email address, and phone number',
        'Client data you enter (names, contact info, training history)',
        'Session and payment information',
        'Video watches and progress tracking data',
        'Food log images uploaded by trainees (used solely for nutritional analysis)',
      ],
    },
    {
      heading: 'How We Protect Your Data',
      body: [
        'Full encryption in transit (HTTPS/TLS)',
        'Secure servers with regular backups',
        'Limited data access — authorised personnel only',
        'We never store credit card numbers',
      ],
    },
    {
      heading: 'What We Do NOT Do',
      body: [
        'We do not sell your data to any party',
        'We do not share data with third parties — except Twilio (SMS/WhatsApp delivery) and Instagram API (content publishing)',
        'We do not use your data for marketing without consent',
        'We do not retain data after account deletion (within 30 days)',
      ],
    },
    {
      heading: 'Your Rights',
      body: [
        'Access your data at any time',
        'Correct or delete personal information',
        'Export your data in an accessible format',
        'Receive a response to enquiries within 24 hours',
      ],
    },
    {
      heading: 'Contact',
      body: ['Privacy questions: assaf8@gmail.com'],
    },
  ],
}

export default function Privacy() {
  const [lang, setLang] = useState('he')
  const t = lang === 'he' ? HE : EN

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang}>
      {/* Skip to main content */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-[#00969E] text-white px-4 py-2 rounded-xl z-50 font-semibold text-sm">
        {lang === 'he' ? 'דלג לתוכן' : 'Skip to content'}
      </a>

      {/* Header */}
      <header className="bg-white border-b border-gray-100" role="banner">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded-lg"
            aria-label={lang === 'he' ? 'חזרה לדף הבית' : 'Back to home'}>
            <ArrowRight size={16} aria-hidden="true" />
            <span className="text-sm font-medium">{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang('he')}
              aria-pressed={lang === 'he'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] ${lang === 'he' ? 'bg-[#007A81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              עברית
            </button>
            <button onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] ${lang === 'en' ? 'bg-[#007A81] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              English
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">
        {/* Icon + Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#E6F7F8] rounded-2xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Shield size={28} className="text-[#00969E]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.updated}</p>
          </div>
        </div>

        <div className="bg-[#E6F7F8] border border-[#00969E]/20 rounded-2xl px-6 py-4 mb-8">
          <p className="text-[#007A81] text-sm font-medium">
            {lang === 'he'
              ? 'אנחנו מכבדים את הפרטיות שלך ומחויבים להגן על המידע שלך.'
              : 'We respect your privacy and are committed to protecting your information.'}
          </p>
        </div>

        <div className="space-y-8">
          {t.sections.map((sec, i) => (
            <section key={i} aria-labelledby={`section-${i}`}>
              <h2 id={`section-${i}`} className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
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

        {/* Footer nav */}
        <nav className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm" aria-label={lang === 'he' ? 'דפים משפטיים' : 'Legal pages'}>
          <Link to="/terms"   className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'תנאי שימוש' : 'Terms of Service'}</Link>
          <Link to="/health"  className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'כתב ויתור בריאות' : 'Health Disclaimer'}</Link>
          <Link to="/privacy" className="text-gray-400 font-medium">{lang === 'he' ? 'מדיניות פרטיות (עמוד נוכחי)' : 'Privacy Policy (current)'}</Link>
        </nav>
      </main>
    </div>
  )
}
