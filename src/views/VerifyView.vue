<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const { verifyCode, startOAuthFlow } = useAuth()

const code = ref('')
const error = ref('')
const loading = ref(false)
const email = route.query.email || ''
const oauth2Session = route.query.oauth2_session || ''

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await verifyCode(email, code.value, oauth2Session)
    if (res.ok) {
      if (oauth2Session && res.redirected) {
        window.location.href = res.url
      } else {
        await startOAuthFlow()
      }
    } else {
      const data = await res.json().catch(() => ({}))
      error.value = data.detail || 'Invalid or expired code.'
    }
  } catch {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p class="text-gray-400">
            Enter the 6-digit code sent to
            <span class="text-white font-medium">{{ email }}</span>
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              v-model="code"
              type="text"
              inputmode="numeric"
              pattern="[0-9]{6}"
              maxlength="6"
              required
              placeholder="000000"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors font-mono"
            />
          </div>

          <div v-if="error" class="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || code.length !== 6"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>

          <div class="text-center">
            <router-link to="/login" class="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              Back to Sign In
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
