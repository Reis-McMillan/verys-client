<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { api } from '../api/client.js'
import { OAUTH2_CONFIG } from '../config.js'
import AppLayout from '../components/AppLayout.vue'

const { user, fetchUser } = useAuth()

const linkedAccounts = ref([])
const allProviders = ref([])
const loading = ref(true)
const showProviderSelect = ref(false)

const providerDisplayNames = computed(() => {
  const map = {}
  for (const p of allProviders.value) {
    map[p.provider_id] = p.display_name
  }
  return map
})

async function fetchAccounts() {
  loading.value = true
  try {
    const [linkedRes, providersRes] = await Promise.all([
      api.get('/federation/providers'),
      api.get('/providers/'),
    ])
    if (linkedRes.ok) linkedAccounts.value = await linkedRes.json()
    if (providersRes.ok) allProviders.value = await providersRes.json()
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
}

function startFederation(providerId) {
  const redirectUri = encodeURIComponent(`${window.location.origin}/dashboard`)
  window.location.href = `${OAUTH2_CONFIG.verysBaseUrl}/federation/initiate?provider_id=${encodeURIComponent(providerId)}&redirect_uri=${redirectUri}`
}

const enabledProviders = computed(() => {
  return allProviders.value.filter(p => p.enabled)
})

function handleAddAccount() {
  showProviderSelect.value = !showProviderSelect.value
}

onMounted(() => {
  fetchUser()
  fetchAccounts()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">Account Information</h2>
        <dl class="space-y-4">
          <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <dt class="text-gray-400 text-sm">Name</dt>
            <dd class="text-white font-medium">{{ user?.name || [user?.given_name, user?.family_name].filter(Boolean).join(' ') || '—' }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <dt class="text-gray-400 text-sm">Email</dt>
            <dd class="text-white font-medium">{{ user?.email || '—' }}</dd>
          </div>
          <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <dt class="text-gray-400 text-sm">Email Verified</dt>
            <dd>
              <span
                :class="user?.email_verified ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'"
                class="text-xs font-medium px-2.5 py-1 rounded-full border"
              >
                {{ user?.email_verified ? 'Verified' : 'Unverified' }}
              </span>
            </dd>
          </div>
          <div class="flex justify-between items-center">
            <dt class="text-gray-400 text-sm">Roles</dt>
            <dd class="flex gap-2 flex-wrap justify-end">
              <span
                v-for="role in (user?.roles || [])"
                :key="role"
                class="text-xs font-medium px-2.5 py-1 rounded-full border bg-indigo-400/10 text-indigo-400 border-indigo-400/20"
              >
                {{ role }}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <h2 class="text-lg font-semibold text-white mb-4">Connected Accounts</h2>

      <div v-if="loading" class="text-gray-400 text-sm mb-6">Loading...</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="account in linkedAccounts"
          :key="`${account.provider_id}-${account.subject}`"
          class="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <div class="text-sm text-gray-400 mb-1">Provider</div>
          <div class="text-white font-medium mb-3">{{ providerDisplayNames[account.provider_id] || account.provider_id }}</div>
          <div class="text-sm text-gray-400 mb-1">Subject</div>
          <div class="text-gray-300 text-sm font-mono truncate">{{ account.subject || '—' }}</div>
        </div>

        <div v-if="enabledProviders.length > 0" class="relative">
          <button
            @click="handleAddAccount"
            class="w-full h-full min-h-35 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors cursor-pointer bg-transparent"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-sm font-medium">Add Account</span>
          </button>

          <div
            v-if="showProviderSelect"
            class="absolute top-full left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <button
              v-for="provider in enabledProviders"
              :key="provider.provider_id"
              @click="startFederation(provider.provider_id)"
              class="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
            >
              {{ provider.display_name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
