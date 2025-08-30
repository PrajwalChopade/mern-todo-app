import React, { useState } from "react"

// types
type Mode = "sign-in" | "sign-up"

interface LoginProps {
  onSignIn?: (payload: { email: string; password: string; remember: boolean }) => Promise<void> | void
  onSignUp?: (payload: { name: string; email: string; password: string }) => Promise<void> | void
}

export default function Login({ onSignIn, onSignUp }: LoginProps) {
  const [mode, setMode] = useState<Mode>("sign-in")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [remember, setRemember] = useState(false)

  const isSignUp = mode === "sign-up"

  function resetError() {
    setError(null)
  }

  function validate(): boolean {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.")
      return false
    }
    if (!/.+@.+\..+/.test(email)) {
      setError("Please enter a valid email address.")
      return false
    }
    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your full name.")
        return false
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return false
      }
      if (password !== confirm) {
        setError("Passwords do not match.")
        return false
      }
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    resetError()
    if (!validate()) return

    try {
      setLoading(true)
      if (isSignUp) {
        await onSignUp?.({ name: name.trim(), email: email.trim(), password })
      } else {
        await onSignIn?.({ email: email.trim(), password, remember })
      }
      if (!onSignIn && !onSignUp) {
        // simulate loading if no props passed
        await new Promise((r) => setTimeout(r, 500))
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50 text-gray-900">
      <section
        className="w-full max-w-sm"
        aria-label={isSignUp ? "Create an account" : "Sign in to your account"}
        >
        <img src="/logo.png" alt="Logo" className="mx-auto mb-4 h-12 w-auto" />
        <div className="border rounded-lg bg-white shadow-sm">
          <header className="px-6 pt-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isSignUp
                ? "Join us by creating your account."
                : "Sign in to continue to your dashboard."}
            </p>
          </header>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="px-6 pb-6 mt-6 grid gap-4"
          >
            {isSignUp && (
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isSignUp && (
              <div className="grid gap-2">
                <label htmlFor="confirm" className="text-sm font-medium">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors"
            >
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>

            <p className="text-center text-sm text-gray-500">
              {isSignUp ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignUp ? "sign-in" : "sign-up")
                  resetError()
                }}
                className="text-blue-600 font-medium hover:underline"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
