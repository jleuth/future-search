import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-pattern">
      <main className="flex-1 flex items-center justify-center">
        <div className="container flex flex-col items-center justify-center py-16 md:py-24">
          <div className="w-full max-w-md px-4 md:px-0 animate-fade-in">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  )
}

