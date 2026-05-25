'use client'

import { useUserStore } from '@/store/useUserStore'

const API_BASE = 'http://localhost:8000'

export const getAuthHeaders = () => {
  const user = useUserStore.getState().user

  if (!user) {
    return {}
  }

  return {
    'x-user-id': user._id,
    'x-user-email': user.email,
    'x-user-name': user.displayName,
  }
}

export const apiFetch = async (input: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  const authHeaders = getAuthHeaders()

  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${API_BASE}${input}`, {
    ...init,
    headers,
  })
}
