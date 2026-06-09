import { useState, useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, Sun, Moon, Eye, Type, MousePointer, Pause, RotateCcw } from 'lucide-react'

const DEFAULTS = {
  fontSize:      0,       // -2 to +4 steps
  contrast:      'none',  // 'none' | 'bright' | 'dark' | 'mono'
  bigCursor:     false,
  highlightLinks: false,
  readingLine:   false,
  pauseAnimations: false,
  dyslexicFont:  false,
  letterSpacing: false,
}

function loadPrefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('a11y') || '{}') } }
  catch { return { ...DEFAULTS } }
}

function applyPrefs(prefs) {
  const html = document.documentElement
  const body = document.body

  // Font size
  html.style.fontSize = prefs.fontSize === 0 ? '' : `${100 + prefs.fontSize * 10}%`

  // Contrast modes
  body.classList.remove('a11y-contrast-bright', 'a11y-contrast-dark', 'a11y-contrast-mono')
  if (prefs.contrast !== 'none') body.classList.add(`a11y-contrast-${prefs.contrast}`)

  // Cursor
  body.classList.toggle('a11y-big-cursor', prefs.bigCursor)

  // Highlight links
  body.classList.toggle('a11y-highlight-links', prefs.highlightLinks)

  // Pause animations
  body.classList.toggle('a11y-pause-animations', prefs.pauseAnimations)

  // Dyslexic font
  body.classList.toggle('a11y-dyslexic', prefs.dyslexicFont)

  // Letter spacing
  body.classList.toggle('a11y-letter-spacing', prefs.letterSpacing)
}

// Inject CSS once
const STYLES = `
  .a11y-contrast-bright { filter: contrast(1.5) brightness(1.1) !important; }
  .a11y-contrast-dark   { filter: invert(1) hue-rotate(180deg) !important; }
  .a11y-contrast-mono   { filter: grayscale(1) contrast(1.3) !important; }
  .a11y-big-cursor, .a11y-big-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23000' stroke='%23fff' stroke-width='2' d='M5 2l20 12-8 2-4 10z'/%3E%3C/svg%3E") 0 0, auto !important; }
  .a11y-highlight-links a { outline: 3px solid #00969E !important; outline-offset: 2px !important; text-decoration: underline !important; font-weight: bold !important; }
  .a11y-pause-animations *, .a11y-pause-animations *::before, .a11y-pause-animations *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
  .a11y-letter-spacing * { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  .a11y-dyslexic * { font-family: 'Arial', sans-serif !important; font-weight: 500 !important; line-height: 1.8 !important; }
`

let stylesInjected = false
function injectStyles() {
  if (stylesInjected) return
  const el = document.createElement('style')
  el.textContent = STYLES
  document.head.appendChild(el)
  stylesInjected = true
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(() => !!localStorage.getItem('a11y-hidden'))
  const [prefs, setPrefs] = useState(loadPrefs)
  const panelRef = useRef()
  const [readingLineY, setReadingLineY] = useState(200)

  useEffect(() => {
    injectStyles()
    applyPrefs(prefs)
  }, [])

  useEffect(() => {
    applyPrefs(prefs)
    localStorage.setItem('a11y', JSON.stringify(prefs))
  }, [prefs])

  // Reading guide line — follows mouse
  useEffect(() => {
    if (!prefs.readingLine) return
    const move = (e) => setReadingLineY(e.clientY)
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [prefs.readingLine])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }))
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))
  const reset = () => { setPrefs({ ...DEFAULTS }); localStorage.removeItem('a11y') }

  const isModified = JSON.stringify(prefs) !== JSON.stringify(DEFAULTS)

  if (hidden) return null

  const hideWidget = () => {
    setHidden(true)
    setOpen(false)
    localStorage.setItem('a11y-hidden', '1')
  }

  return (
    <>
      {/* Reading line */}
      {prefs.readingLine && (
        <div className="fixed left-0 right-0 z-[9998] pointer-events-none h-8"
          style={{ top: readingLineY - 16, background: 'rgba(0,150,158,0.15)', borderTop: '2px solid #00969E', borderBottom: '2px solid #00969E' }} />
      )}

      {/* Floating button + dismiss X */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-center gap-1 group">
        {/* X dismiss button — visible on hover */}
        <button
          onClick={hideWidget}
          aria-label="הסתר כפתור נגישות"
          className="w-5 h-5 rounded-full bg-gray-400 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
        >
          <X size={11} />
        </button>

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00969E]"
        style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0D1F3C 100%)' }}
      >
        {/* Wheelchair / accessibility SVG icon */}
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M10 7h4l2 5h3v2h-3.5L14 10.5V16l3 1v2l-4-1.5V11h-2v6.5L7 19v-2l3-1V7z" />
          <path d="M12 19a5 5 0 01-5-5H5a7 7 0 007 7v-2z" />
        </svg>
        {isModified && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00969E] rounded-full ring-2 ring-white" aria-hidden="true" />
        )}
      </button>
      </div>{/* end floating wrapper */}

      {/* Panel */}
      {open && (
        <div ref={panelRef} dir="rtl"
          role="dialog" aria-modal="true" aria-label="תפריט נגישות"
          className="fixed bottom-24 left-6 z-[9999] w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50"
            style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0D1F3C 100%)' }}>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <circle cx="12" cy="4" r="2" />
                <path d="M10 7h4l2 5h3v2h-3.5L14 10.5V16l3 1v2l-4-1.5V11h-2v6.5L7 19v-2l3-1V7z" />
                <path d="M12 19a5 5 0 01-5-5H5a7 7 0 007 7v-2z" />
              </svg>
              <span className="font-bold text-white text-sm">נגישות</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="סגור תפריט נגישות"
              className="text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Font size */}
            <section>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">גודל טקסט</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                <button onClick={() => set('fontSize', Math.max(-2, prefs.fontSize - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                  aria-label="הקטן גופן">
                  <ZoomOut size={16} className="text-gray-600" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-bold text-gray-900">
                    {prefs.fontSize === 0 ? 'רגיל' : prefs.fontSize > 0 ? `+${prefs.fontSize}` : prefs.fontSize}
                  </span>
                  <div className="flex gap-1 justify-center mt-1">
                    {[-2,-1,0,1,2,3,4].map(v => (
                      <div key={v} onClick={() => set('fontSize', v)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${prefs.fontSize === v ? 'bg-[#00969E]' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <button onClick={() => set('fontSize', Math.min(4, prefs.fontSize + 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                  aria-label="הגדל גופן">
                  <ZoomIn size={16} className="text-gray-600" />
                </button>
              </div>
            </section>

            {/* Contrast */}
            <section>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ניגודיות וצבעים</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'none',   label: 'רגיל',             icon: '🔲', desc: 'ברירת מחדל' },
                  { key: 'bright', label: 'ניגודיות גבוהה',  icon: '☀️', desc: 'בהיר' },
                  { key: 'dark',   label: 'מצב כהה',          icon: '🌙', desc: 'כהה' },
                  { key: 'mono',   label: 'מונוכרום',          icon: '⚫', desc: 'גווני אפור' },
                ].map(c => (
                  <button key={c.key} onClick={() => set('contrast', c.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all ${
                      prefs.contrast === c.key ? 'border-[#00969E] bg-[#E6F7F8]' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}>
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-xs font-semibold text-gray-900">{c.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Toggle options */}
            <section>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">התאמות נוספות</p>
              <div className="space-y-2">
                {[
                  { key: 'bigCursor',      label: 'סמן גדול',          icon: MousePointer, desc: 'מגדיל את הסמן' },
                  { key: 'highlightLinks', label: 'הדגש קישורים',      icon: Type,         desc: 'מדגיש כל הלינקים' },
                  { key: 'readingLine',    label: 'קו קריאה',           icon: Eye,          desc: 'קו עוקב אחרי העכבר' },
                  { key: 'pauseAnimations',label: 'עצור אנימציות',     icon: Pause,        desc: 'מבטל תנועה בדף' },
                  { key: 'dyslexicFont',   label: 'פונט דיסלקסיה',     icon: Type,         desc: 'גופן ידידותי לדיסלקסיה' },
                  { key: 'letterSpacing',  label: 'ריווח אותיות',       icon: Type,         desc: 'מרחיק בין האותיות' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <button key={key} onClick={() => toggle(key)}
                    role="switch" aria-checked={prefs[key]}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      prefs[key] ? 'border-[#00969E] bg-[#E6F7F8]' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      prefs[key] ? 'bg-[#00969E]' : 'bg-gray-100'
                    }`}>
                      <Icon size={15} className={prefs[key] ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div className="text-right flex-1">
                      <p className={`text-sm font-semibold ${prefs[key] ? 'text-[#00969E]' : 'text-gray-900'}`}>{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[key] ? 'bg-[#00969E]' : 'bg-gray-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm mt-0.5 transition-all ${prefs[key] ? 'mr-0.5 translate-x-0' : 'translate-x-4'}`} style={{ transform: prefs[key] ? 'translateX(0)' : 'translateX(18px)', margin: '2px' }} />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Reset */}
            {isModified && (
              <button onClick={reset}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors">
                <RotateCcw size={14} />
                איפוס הגדרות
              </button>
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">נגישות — UpWell · WCAG 2.1 AA</p>
          </div>
        </div>
      )}
    </>
  )
}
