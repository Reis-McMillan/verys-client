<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { getTokens } from '../api/client.js'

const { logout } = useAuth()

onMounted(async () => {
  const { accessToken, refreshToken } = getTokens()
  if (accessToken || refreshToken) {
    await logout()
    // logout() redirects to /api/end-session which redirects back here
    // so this code only runs if the redirect doesn't happen (e.g., no id_token)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md text-center">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <svg class="w-16 h-16 mx-auto mb-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 class="text-2xl font-bold text-white mb-2">Signed Out</h1>
        <p class="text-gray-400 mb-6">You have been successfully logged out.</p>
        <router-link
          to="/login"
          class="inline-block py-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          Sign In Again
        </router-link>
      </div>
    </div>
  </div>
</template>
