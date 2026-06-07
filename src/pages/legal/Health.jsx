import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'

const HE = {
  title: 'כתב ויתור בריאותי',
  updated: 'עודכן לאחרונה: יוני 2026',
  warning: 'UpWell אינה מספקת ייעוץ רפואי. כל המידע הוא לצרכים חינוכיים בלבד.',
  sections: [
    {
      heading: 'לא ייעוץ רפואי',
      body: [
        'התוכן ב-UpWell — וידאו, תוכניות, טיפים — הוא לצרכים חינוכיים בלבד.',
        'שום דבר בשירות זה אינו מהווה ייעוץ רפואי, אבחנה או טיפול.',
        'יש להתייעץ עם רופא לפני תחילת כל תוכנית כושר או תזונה.',
        'אנשים עם בעיות רפואיות קיימות חייבים לפנות לאישור רפואי מוקדם.',
      ],
    },
    {
      heading: 'סיכוני בריאות ופציעות',
      body: [
        'פעילות גופנית טומנת בחובה סיכון מסוים לפציעה.',
        'המשתמשים נוטלים על עצמם את מלוא האחריות לסיכונים הבריאותיים.',
        'הפסק פעילות מיד אם אתה חש כאב, סחרחורת, קוצר נשימה או אי נוחות.',
        'UpWell ו/או המאמנים אינם אחראים לפציעות שנגרמות במהלך הפעילות.',
      ],
    },
    {
      heading: 'אחריות המאמן',
      body: [
        'כל מאמן אחראי לוודא שתוכניות האימון בטוחות ומתאימות לרמת הלקוח.',
        'על המאמן להחזיק בהסמכות מקצועיות רלוונטיות (כגון: IFAA, Wingate, Physiotherapy).',
        'המאמן אחראי לבצע הערכת כושר ובריאות ראשונית לפני תחילת תוכנית.',
        'תוכניות תזונה חייבות להיות מותאמות אישית ומאושרות ע"י דיאטנ/ית מוסמכ/ת במקרה הצורך.',
      ],
    },
    {
      heading: 'ניתוח קלוריות ב-AI',
      body: [
        'ניתוח הקלוריות נעשה על ידי בינה מלאכותית ומהווה הערכה בלבד.',
        'ערכי הקלוריות עשויים לחרוג מהמציאות — אל תסתמך עליהם בלעדית.',
        'לניהול תזונה רפואי פנה לדיאטנ/ית מוסמכ/ת.',
      ],
    },
    {
      heading: 'שינויים בתוכנית',
      body: [
        'הפסק כל פעילות שגורמת לאי נוחות ופנה לאיש מקצוע.',
        'המאמן שלך אינו יכול לראות אותך — הקשב לגוף שלך.',
        'בחירום רפואי — התקשר לשירותי חירום (101 בישראל).',
      ],
    },
  ],
}

const EN = {
  title: 'Health Disclaimer',
  updated: 'Last updated: June 2026',
  warning: 'UpWell does not provide medical advice. All content is for educational purposes only.',
  sections: [
    {
      heading: 'Not Medical Advice',
      body: [
        'Content on UpWell — videos, programs, tips — is for educational purposes only.',
        'Nothing in this service constitutes medical advice, diagnosis, or treatment.',
        'Consult a physician before starting any fitness or nutrition programme.',
        'Individuals with pre-existing medical conditions must obtain prior medical clearance.',
      ],
    },
    {
      heading: 'Health Risks & Injuries',
      body: [
        'Physical exercise carries an inherent risk of injury.',
        'Users assume full responsibility for their own health risks.',
        'Stop activity immediately if you feel pain, dizziness, shortness of breath, or discomfort.',
        'UpWell and/or trainers are not liable for injuries sustained during activity.',
      ],
    },
    {
      heading: 'Trainer Responsibility',
      body: [
        'Each trainer is responsible for ensuring programmes are safe and appropriate for their client\'s level.',
        'Trainers must hold relevant professional certifications (e.g. IFAA, Wingate, Physiotherapy).',
        'Trainers are responsible for conducting an initial fitness and health assessment.',
        'Nutrition plans must be personalised and approved by a qualified dietitian when necessary.',
      ],
    },
    {
      heading: 'AI Calorie Analysis',
      body: [
        'Calorie analysis is performed by artificial intelligence and is an estimate only.',
        'Calorie values may deviate from reality — do not rely on them exclusively.',
        'For medical nutritional management, consult a qualified dietitian.',
      ],
    },
    {
      heading: 'Programme Modifications',
      body: [
        'Stop any activity that causes discomfort and consult a professional.',
        'Your trainer cannot see you — listen to your body.',
        'In a medical emergency, call emergency services (101 in Israel, 999 in the UK, 911 in the US).',
      ],
    },
  ],
}

export default function Health() {
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
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.updated}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-8" role="alert">
          <p className="text-red-800 text-sm font-bold">{t.warning}</p>
        </div>

        <div className="space-y-8">
          {t.sections.map((sec, i) => (
            <section key={i} aria-labelledby={`health-section-${i}`}>
              <h2 id={`health-section-${i}`} className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">{i + 1}</span>
                {sec.heading}
              </h2>
              <ul className="space-y-2" role="list">
                {sec.body.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <nav className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm" aria-label={lang === 'he' ? 'דפים משפטיים' : 'Legal pages'}>
          <Link to="/privacy" className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}</Link>
          <Link to="/terms"   className="text-[#007A81] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00969E] rounded">{lang === 'he' ? 'תנאי שימוש' : 'Terms of Service'}</Link>
          <Link to="/health"  className="text-gray-400 font-medium">{lang === 'he' ? 'כתב ויתור בריאות (עמוד נוכחי)' : 'Health Disclaimer (current)'}</Link>
        </nav>
      </main>
    </div>
  )
}
