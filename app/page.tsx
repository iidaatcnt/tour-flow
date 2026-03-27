import { redirect } from 'next/navigation'

// ルートは (dashboard)/page.tsx に委譲
// middleware.ts が認証を処理し、未ログインは /login にリダイレクト
export default function RootPage() {
  redirect('/dashboard')
}
