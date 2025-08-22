import { SimpleRegistrationForm } from '@/components/forms/SimpleRegistrationForm'
import { Suspense } from 'react'

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Suspense fallback={<div>Carregando...</div>}>
        <SimpleRegistrationForm />
      </Suspense>
    </div>
  )
}


