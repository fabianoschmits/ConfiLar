'use client'

import { useAuthContext } from '@/contexts/AuthContext'

export function AuthContextDebug() {
  try {
    const { user, profile, loading, isReady } = useAuthContext()
    
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs">
        <h3 className="font-bold mb-2">AuthContext Debug</h3>
        <div>User: {user ? user.id : 'null'}</div>
        <div>Profile: {profile ? profile.full_name : 'null'}</div>
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Ready: {isReady ? 'true' : 'false'}</div>
      </div>
    )
  } catch (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg text-xs max-w-xs">
        <h3 className="font-bold mb-2">AuthContext Error</h3>
        <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    )
  }
}


