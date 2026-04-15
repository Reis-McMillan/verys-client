<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/client.js'
import AppLayout from '../../components/AppLayout.vue'

const providers = ref([])
const loading = ref(true)
const error = ref('')

const showCreate = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = ref({
  provider_id: '',
  display_name: '',
  discovery_url: '',
  client_id: '',
  client_secret: '',
  authorization_endpoint: '',
  token_endpoint: '',
  scopes: '',
})

const showDetail = ref(null)
const detailProvider = ref(null)
const editForm = ref({})
const editLoading = ref(false)

onMounted(() => fetchProviders())

async function fetchProviders() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/providers/')
    if (res.ok) {
      providers.value = await res.json()
    } else {
      error.value = 'Failed to load providers.'
    }
  } catch {
    error.value = 'Network error.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  return {
    provider_id: '',
    display_name: '',
    discovery_url: '',
    client_id: '',
    client_secret: '',
    authorization_endpoint: '',
    token_endpoint: '',
    scopes: '',
  }
}

async function createProvider() {
  createError.value = ''
  createLoading.value = true
  try {
    const body = {
      ...form.value,
      scopes: form.value.scopes ? form.value.scopes.split(/[\s,]+/).filter(Boolean) : [],
    }
    const res = await api.post('/providers/', body)
    if (res.ok) {
      form.value = resetForm()
      showCreate.value = false
      await fetchProviders()
    } else {
      const data = await res.json().catch(() => ({}))
      createError.value = data.detail || 'Failed to create provider.'
    }
  } catch {
    createError.value = 'Network error.'
  } finally {
    createLoading.value = false
  }
}

async function viewDetail(providerId) {
  try {
    const res = await api.get(`/providers/${encodeURIComponent(providerId)}`)
    if (res.ok) {
      detailProvider.value = await res.json()
      showDetail.value = providerId
      editForm.value = {
        display_name: detailProvider.value.display_name || '',
        client_id: detailProvider.value.client_id || '',
        client_secret: '',
        authorization_endpoint: detailProvider.value.authorization_endpoint || '',
        token_endpoint: detailProvider.value.token_endpoint || '',
        scopes: (detailProvider.value.scopes || []).join(' '),
        enabled: detailProvider.value.enabled ?? true,
      }
    }
  } catch {
    // silently fail
  }
}

async function updateProvider(providerId) {
  editLoading.value = true
  try {
    const body = {
      display_name: editForm.value.display_name || null,
      client_id: editForm.value.client_id || null,
      client_secret: editForm.value.client_secret || null,
      authorization_endpoint: editForm.value.authorization_endpoint || null,
      token_endpoint: editForm.value.token_endpoint || null,
      scopes: editForm.value.scopes ? editForm.value.scopes.split(/[\s,]+/).filter(Boolean) : [],
      enabled: editForm.value.enabled,
    }
    const res = await api.put(`/providers/${encodeURIComponent(providerId)}`, body)
    if (res.ok) {
      showDetail.value = null
      await fetchProviders()
    }
  } catch {
    // silently fail
  } finally {
    editLoading.value = false
  }
}

async function deleteProvider(providerId) {
  if (!confirm(`Delete provider "${providerId}"? This will also delete all associated scopes and external tokens.`)) return
  try {
    await api.delete(`/providers/${encodeURIComponent(providerId)}`)
    showDetail.value = null
    await fetchProviders()
  } catch {
    // silently fail
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">External Providers</h1>
        <button
          @click="showCreate = !showCreate"
          class="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
        >
          {{ showCreate ? 'Cancel' : 'Add Provider' }}
        </button>
      </div>

      <!-- Create Form -->
      <div v-if="showCreate" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">New Provider</h2>
        <form @submit.prevent="createProvider" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Provider ID</label>
              <input v-model="form.provider_id" required placeholder="google"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input v-model="form.display_name" required placeholder="Google"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Discovery URL</label>
            <input v-model="form.discovery_url" placeholder="https://accounts.google.com/.well-known/openid-configuration"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Client ID</label>
              <input v-model="form.client_id" required placeholder="OAuth2 client ID"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Client Secret</label>
              <input v-model="form.client_secret" required type="password" placeholder="OAuth2 client secret"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Authorization Endpoint</label>
            <input v-model="form.authorization_endpoint" required placeholder="https://accounts.google.com/o/oauth2/v2/auth"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Token Endpoint</label>
            <input v-model="form.token_endpoint" required placeholder="https://oauth2.googleapis.com/token"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Scopes (space-separated)</label>
            <input v-model="form.scopes" placeholder="openid email profile"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="createLoading"
              class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm">
              {{ createLoading ? 'Creating...' : 'Create' }}
            </button>
          </div>
          <p v-if="createError" class="text-red-400 text-sm">{{ createError }}</p>
        </form>
      </div>

      <!-- Detail / Edit Panel -->
      <div v-if="showDetail && detailProvider" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Edit Provider</h2>
          <button @click="showDetail = null" class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer">Close</button>
        </div>
        <div class="mb-4 text-sm text-gray-400">
          <span class="text-gray-500">Provider ID:</span>
          <code class="text-gray-300 ml-2 font-mono">{{ detailProvider.provider_id }}</code>
        </div>
        <form @submit.prevent="updateProvider(detailProvider.provider_id)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input v-model="editForm.display_name"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Client ID</label>
              <input v-model="editForm.client_id"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Client Secret (leave blank to keep current)</label>
            <input v-model="editForm.client_secret" type="password" placeholder="••••••••"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Authorization Endpoint</label>
            <input v-model="editForm.authorization_endpoint"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Token Endpoint</label>
            <input v-model="editForm.token_endpoint"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Scopes (space-separated)</label>
            <input v-model="editForm.scopes"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div class="flex items-center gap-2">
            <input id="edit_enabled" v-model="editForm.enabled" type="checkbox" class="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500" />
            <label for="edit_enabled" class="text-sm text-gray-300">Enabled</label>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="editLoading"
              class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm">
              {{ editLoading ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" @click="deleteProvider(detailProvider.provider_id)"
              class="py-2 px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors cursor-pointer text-sm border border-red-600/30">
              Delete Provider
            </button>
          </div>
        </form>
      </div>

      <div v-if="error" class="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
        {{ error }}
      </div>

      <div v-if="loading" class="text-gray-400 text-center py-12">Loading...</div>

      <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Provider ID</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Display Name</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Client ID</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="provider in providers" :key="provider.provider_id" class="hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-sm text-white font-medium font-mono">{{ provider.provider_id }}</td>
              <td class="px-6 py-4 text-sm text-gray-300">{{ provider.display_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ provider.client_id }}</td>
              <td class="px-6 py-4">
                <span
                  :class="provider.enabled ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'"
                  class="text-xs font-medium px-2.5 py-1 rounded-full border"
                >
                  {{ provider.enabled ? 'Enabled' : 'Disabled' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="viewDetail(provider.provider_id)" class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  View / Edit
                </button>
              </td>
            </tr>
            <tr v-if="providers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">No providers registered.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
