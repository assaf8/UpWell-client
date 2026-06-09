import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

/**
 * Shows an "Install App" banner when the browser fires the
 * beforeinstallprompt event (Chrome / Android).
 * On iOS it shows manual instructions since iOS doesn't fire the event.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Dismissed before?
    if (localStorage.getItem('pwa-dismissed')) return

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    if (ios) {
      setTimeout(() => { setIsIOS(true); setShow(true) }, 3000)
      return
    }

    // Chrome / Android — wait for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000) // slight delay so page loads first
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 flex gap-4 items-start">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#00969E] to-[#005f66] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00969E]/30">
          <span className="text-white font-black text-sm">UW</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">התקן את UpWell</p>
          {isIOS ? (
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              הוסף לדף הבית: לחץ <span className="inline-block bg-gray-100 rounded px-1">שתף</span> ואחר כך <span className="font-semibold">"הוסף למסך הבית"</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1">גישה מהירה מהנייד — כמו אפליקציה אמיתית, ללא חנות האפליקציות</p>
          )}

          {!isIOS && (
            <button onClick={handleInstall}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#00969E] hover:bg-[#007A81] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00969E]/20">
              <Download size={13} />
              התקן עכשיו
            </button>
          )}
        </div>

        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
