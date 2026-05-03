import { LoginForm } from '@/components/auth/login-form'
import { Scale } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 bg-zinc-800 rounded-2xl mb-4 border border-zinc-700">
            <Scale className="w-7 h-7 text-zinc-100" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Weighbridge OS</h1>
          <p className="text-zinc-400 text-sm mt-1">Operations Management Platform</p>
        </div>

        {/* Form card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          © {new Date().getFullYear()} Weighbridge OS · Tanzania
        </p>
      </div>
    </div>
  )
}
