<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { register } = useAuth()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const error = ref('')
const loading = ref(false)
const oauth2Session = route.query.oauth2_session || ''

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
    }
    if (oauth2Session) {
      payload.oauth2_session_id = oauth2Session
    }
    const res = await register(payload)
    if (res.ok) {
      const query = { email: email.value }
      if (oauth2Session) query.oauth2_session = oauth2Session
      router.push({ path: '/verify', query })
    } else {
      const data = await res.json().catch(() => ({}))
      error.value = data.detail || 'Failed to register.'
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
          <h1 class="text-3xl font-bold text-white mb-2">Sign Up</h1>
          <p class="text-gray-400">Create an account to get started</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                id="first_name"
                v-model="firstName"
                type="text"
                required
                autocomplete="given-name"
                placeholder="Ada"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                v-model="lastName"
                type="text"
                required
                autocomplete="family-name"
                placeholder="Lovelace"
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>

          <div v-if="error" class="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-400 mt-6">
          Already have an account?
          <router-link to="/login" class="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
