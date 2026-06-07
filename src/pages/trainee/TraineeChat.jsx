import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowRight, Send, Image as ImageIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../../lib/api'
import TraineeNav from './TraineeNav'
import { getMediaUrl } from '../../lib/media'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

function groupByDate(msgs) {
  const groups = []
  let lastDate = null
  for (const m of msgs) {
    const d = new Date(m.createdAt).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
    if (d !== lastDate) { groups.push({ type: 'date', label: d }); lastDate = d }
    groups.push({ type: 'msg', data: m })
  }
  return groups
}

export default function TraineeChat() {
  const navigate  = useNavigate()
  const bottomRef = useRef(null)
  const socketRef = useRef(null)
  const fileRef   = useRef(null)

  const [messages,  setMessages]  = useState([])
  const [text,      setText]      = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [sending,   setSending]   = useState(false)
  const [connected, setConnected] = useState(false)

  // Load history from REST
  const loadHistory = useCallback(async () => {
    const res = await api.get('/trainee/chat').catch(() => ({ data: [] }))
    setMessages(res.data || [])
  }, [])

  // Setup socket
  useEffect(() => {
    const token = localStorage.getItem('token')
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('new-message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    socket.on('messages-read', () => {
      setMessages(prev => prev.map(m => ({ ...m, read: true })))
    })

    loadHistory()
    socket.emit('mark-read', {})

    return () => socket.disconnect()
  }, [loadHistory])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendText = () => {
    if (!text.trim() || !socketRef.current) return
    socketRef.current.emit('send-message', { text: text.trim() })
    // Optimistic
    setMessages(prev => [...prev, {
      _id: `opt-${Date.now()}`,
      sender: 'trainee',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }])
    setText('')
  }

  const sendImage = async () => {
    if (!imageFile) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      if (text.trim()) fd.append('text', text.trim())
      const res = await api.post('/trainee/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMessages(prev => [...prev, res.data])
      setText(''); setImageFile(null); setPreview(null)
    } catch {}
    finally { setSending(false) }
  }

  const handleSend = () => imageFile ? sendImage() : sendText()
  const handleKey  = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const pickImage = (e) => {
    const f = e.target.files[0]; if (!f) return
    setImageFile(f); setPreview(URL.createObjectURL(f))
  }

  const groups = groupByDate(messages)

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 pt-10 pb-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/trainee')}
          className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowRight size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-sm">צ׳אט עם המאמן</h1>
          <p className={`text-xs mt-0.5 ${connected ? 'text-green-500' : 'text-gray-400'}`}>
            {connected ? '● מחובר' : '○ מתחבר...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groups.map((g, i) => {
          if (g.type === 'date') {
            return (
              <div key={i} className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{g.label}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )
          }
          const m  = g.data
          const isMe = m.sender === 'trainee'
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                isMe
                  ? 'bg-[#00969E] text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
              }`}>
                {m.imageUrl && (
                  <img src={getMediaUrl(m.imageUrl)} alt="" className="rounded-xl mb-1.5 max-w-full" />
                )}
                {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F7F8] flex items-center justify-center mb-3">
              <Send size={24} className="text-[#00969E]" />
            </div>
            <p className="font-semibold text-gray-700">התחל שיחה עם המאמן</p>
            <p className="text-sm text-gray-400 mt-1">שלח הודעה, תמונה או שאלה</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {preview && (
        <div className="px-4 pb-2 bg-white">
          <div className="relative inline-block">
            <img src={preview} alt="preview" className="h-20 rounded-xl object-cover" />
            <button onClick={() => { setImageFile(null); setPreview(null) }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center">
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 bg-white border-t border-gray-100 pt-3 sticky bottom-16">
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          <button onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 flex-shrink-0 transition-colors">
            <ImageIcon size={18} />
          </button>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="הקלד הודעה..." rows={1}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00969E]/20 focus:border-[#00969E] resize-none leading-relaxed" />
          <button onClick={handleSend} disabled={(!text.trim() && !imageFile) || sending}
            className="w-10 h-10 rounded-xl bg-[#00969E] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#007A81] flex-shrink-0 transition-colors shadow-lg shadow-[#00969E]/20">
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} />}
          </button>
        </div>
      </div>

      <TraineeNav />
    </div>
  )
}
