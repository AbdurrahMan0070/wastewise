import { useState, useCallback } from 'react'
import Toast from './Toast'

let toastId = 0
let addToastFn = null

export function useToast() {
  return useCallback((message, type = 'success', duration = 3000) => {
    if (addToastFn) {
      addToastFn(message, type, duration)
    }
  }, [])
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  addToastFn = useCallback((message, type, duration) => {
    const id = toastId++
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}
