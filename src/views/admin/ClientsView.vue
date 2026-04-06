<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/client.js'
import AppLayout from '../../components/AppLayout.vue'

const clients = ref([])
const loading = ref(true)
const error = ref('')

const showCreate = ref(false)
const createLoading = ref(false)
const createError = ref('')
const createdSecret = ref('')
const form = ref({
  client_name: '',
  redirect_uris: '',
  allowed_scopes: 'openid',
  is_public: false,
  token_endpoint_auth_method: 'client_secret_basic',
})

const showDetail = ref(null)
const detailClient = ref(null)
const editForm = ref({})
const editLoading = ref(false)

onMounted(() => fetchClients())

async function fetchClients() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/clients/')
    if (res.ok) {
      clients.value = await res.json()
    } else {
      error.value = 'Failed to load clients.'
    }
  } catch {
    error.value = 'Network error.'
  } finally {
    loading.value = false
  }
}

async function createClient() {
  createError.value = ''
  createLoading.value = true
  createdSecret.value = ''
  try {
    const body = {
      client_name: form.value.client_name,
      redirect_uris: form.value.redirect_uris.split('\n').map((u) => u.trim()).filter(Boolean),
      allowed_scopes: form.value.allowed_scopes.split(/[\s,]+/).filter(Boolean),
      is_public: form.value.is_public,
      token_endpoint_auth_method: form.value.token_endpoint_auth_method,
    }
    const res = await api.post('/clients/', body)
    if (res.ok) {
      const data = await res.json()
      createdSecret.value = data.client_secret || ''
      form.value = { client_name: '', redirect_uris: '', allowed_scopes: 'openid', is_public: false, token_endpoint_auth_method: 'client_secret_basic' }
      await fetchClients()
      if (!createdSecret.value) showCreate.value = false
    } else {
      const data = await res.json().catch(() => ({}))
      createError.value = data.detail || 'Failed to create client.'
    }
  } catch {
    createError.value = 'Network error.'
  } finally {
    createLoading.value = false
  }
}

async function viewDetail(clientId) {
  try {
    const res = await api.get(`/clients/${encodeURIComponent(clientId)}`)
    if (res.ok) {
      detailClient.value = await res.json()
      showDetail.value = clientId
      editForm.value = {
        client_name: detailClient.value.client_name || '',
        redirect_uris: (detailClient.value.redirect_uris || []).join('\n'),
        allowed_scopes: (detailClient.value.allowed_scopes || []).join(' '),
        is_public: detailClient.value.is_public || false,
      }
    }
  } catch {
    // silently fail
  }
}

async function updateClient(clientId) {
  editLoading.value = true
  try {
    const body = {
      client_name: editForm.value.client_name,
      redirect_uris: editForm.value.redirect_uris.split('\n').map((u) => u.trim()).filter(Boolean),
      allowed_scopes: editForm.value.allowed_scopes.split(/[\s,]+/).filter(Boolean),
      is_public: editForm.value.is_public,
    }
    const res = await api.put(`/clients/${encodeURIComponent(clientId)}`, body)
    if (res.ok) {
      showDetail.value = null
      await fetchClients()
    }
  } catch {
    // silently fail
  } finally {
    editLoading.value = false
  }
}

async function deleteClient(clientId) {
  if (!confirm(`Delete client ${clientId}?`)) return
  try {
    await api.delete(`/clients/${encodeURIComponent(clientId)}`)
    showDetail.value = null
    await fetchClients()
  } catch {
    // silently fail
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">OAuth2 Clients</h1>
        <button
          @click="showCreate = !showCreate; createdSecret = ''"
          class="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
        >
          {{ showCreate ? 'Cancel' : 'Register Client' }}
        </button>
      </div>

      <!-- Create Form -->
      <div v-if="showCreate" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">Register New Client</h2>

        <div v-if="createdSecret" class="bg-green-400/10 border border-green-400/20 rounded-lg p-4 mb-4">
          <p class="text-green-400 text-sm font-medium mb-2">Client created! Save this secret — it won't be shown again:</p>
          <code class="block bg-gray-800 text-green-300 px-4 py-2 rounded text-sm font-mono break-all">{{ createdSecret }}</code>
        </div>

        <form v-else @submit.prevent="createClient" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Client Name</label>
            <input v-model="form.client_name" required placeholder="My Application"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Redirect URIs (one per line)</label>
            <textarea v-model="form.redirect_uris" rows="3" placeholder="https://myapp.com/callback"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-y" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Allowed Scopes (space-separated)</label>
            <input v-model="form.allowed_scopes" placeholder="openid profile email"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Token Endpoint Auth Method</label>
            <select v-model="form.token_endpoint_auth_method"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="client_secret_basic">client_secret_basic</option>
              <option value="client_secret_post">client_secret_post</option>
              <option value="none">none</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input id="is_public" v-model="form.is_public" type="checkbox" class="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500" />
            <label for="is_public" class="text-sm text-gray-300">Public client (PKCE only, no secret)</label>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="createLoading"
              class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm">
              {{ createLoading ? 'Creating...' : 'Register' }}
            </button>
          </div>
          <p v-if="createError" class="text-red-400 text-sm">{{ createError }}</p>
        </form>
      </div>

      <!-- Detail / Edit Panel -->
      <div v-if="showDetail && detailClient" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Edit Client</h2>
          <button @click="showDetail = null" class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer">Close</button>
        </div>
        <div class="mb-4 text-sm text-gray-400">
          <span class="text-gray-500">Client ID:</span>
          <code class="text-gray-300 ml-2 font-mono">{{ detailClient.client_id }}</code>
        </div>
        <form @submit.prevent="updateClient(detailClient.client_id)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Client Name</label>
            <input v-model="editForm.client_name"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Redirect URIs (one per line)</label>
            <textarea v-model="editForm.redirect_uris" rows="3"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Allowed Scopes</label>
            <input v-model="editForm.allowed_scopes"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div class="flex items-center gap-2">
            <input id="edit_is_public" v-model="editForm.is_public" type="checkbox" class="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500" />
            <label for="edit_is_public" class="text-sm text-gray-300">Public client</label>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="editLoading"
              class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm">
              {{ editLoading ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" @click="deleteClient(detailClient.client_id)"
              class="py-2 px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors cursor-pointer text-sm border border-red-600/30">
              Delete Client
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
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Client ID</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Scopes</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="client in clients" :key="client.client_id" class="hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-sm text-white font-medium">{{ client.client_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ client.client_id }}</td>
              <td class="px-6 py-4">
                <span
                  :class="client.is_public ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'"
                  class="text-xs font-medium px-2.5 py-1 rounded-full border"
                >
                  {{ client.is_public ? 'Public' : 'Confidential' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-1.5 flex-wrap">
                  <span
                    v-for="scope in (client.allowed_scopes || [])"
                    :key="scope"
                    class="text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-800 text-gray-300 border-gray-700"
                  >
                    {{ scope }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="viewDetail(client.client_id)" class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  View / Edit
                </button>
              </td>
            </tr>
            <tr v-if="clients.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">No clients registered.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
