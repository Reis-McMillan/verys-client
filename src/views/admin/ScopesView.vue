<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/client.js'
import AppLayout from '../../components/AppLayout.vue'

const scopes = ref([])
const providers = ref([])
const loading = ref(true)
const error = ref('')

const showCreate = ref(false)
const createLoading = ref(false)
const createError = ref('')
const form = ref({
  name: '',
  description: '',
  provider_id: '',
})

const showDetail = ref(null)
const detailScope = ref(null)
const editForm = ref({})
const editLoading = ref(false)

const standardScopes = ['openid', 'profile', 'email']

onMounted(async () => {
  await Promise.all([fetchScopes(), fetchProviders()])
})

async function fetchScopes() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/scopes/')
    if (res.ok) {
      scopes.value = await res.json()
    } else {
      error.value = 'Failed to load scopes.'
    }
  } catch {
    error.value = 'Network error.'
  } finally {
    loading.value = false
  }
}

async function fetchProviders() {
  try {
    const res = await api.get('/providers/')
    if (res.ok) {
      providers.value = await res.json()
    }
  } catch {
    // silently fail
  }
}

function resetForm() {
  return { name: '', description: '', provider_id: '' }
}

async function createScope() {
  createError.value = ''
  createLoading.value = true
  try {
    const body = {
      name: form.value.name,
      description: form.value.description,
      provider_id: form.value.provider_id || null,
    }
    const res = await api.post('/scopes/', body)
    if (res.ok) {
      form.value = resetForm()
      showCreate.value = false
      await fetchScopes()
    } else {
      const data = await res.json().catch(() => ({}))
      createError.value = data.detail || 'Failed to create scope.'
    }
  } catch {
    createError.value = 'Network error.'
  } finally {
    createLoading.value = false
  }
}

async function viewDetail(name) {
  try {
    const res = await api.get(`/scopes/${encodeURIComponent(name)}`)
    if (res.ok) {
      detailScope.value = await res.json()
      showDetail.value = name
      editForm.value = {
        description: detailScope.value.description || '',
        provider_id: detailScope.value.provider_id || '',
      }
    }
  } catch {
    // silently fail
  }
}

async function updateScope(name) {
  editLoading.value = true
  try {
    const body = {
      description: editForm.value.description || null,
      provider_id: editForm.value.provider_id || null,
    }
    const res = await api.put(`/scopes/${encodeURIComponent(name)}`, body)
    if (res.ok) {
      showDetail.value = null
      await fetchScopes()
    }
  } catch {
    // silently fail
  } finally {
    editLoading.value = false
  }
}

async function deleteScope(name) {
  if (!confirm(`Delete scope "${name}"?`)) return
  try {
    const res = await api.delete(`/scopes/${encodeURIComponent(name)}`)
    if (res.ok) {
      showDetail.value = null
      await fetchScopes()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.detail || 'Failed to delete scope.')
    }
  } catch {
    // silently fail
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">Scopes</h1>
        <button
          @click="showCreate = !showCreate"
          class="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
        >
          {{ showCreate ? 'Cancel' : 'Add Scope' }}
        </button>
      </div>

      <!-- Create Form -->
      <div v-if="showCreate" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">New Scope</h2>
        <form @submit.prevent="createScope" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input v-model="form.name" required placeholder="calendar.read"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Provider (optional)</label>
              <select v-model="form.provider_id"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">None</option>
                <option v-for="p in providers" :key="p.provider_id" :value="p.provider_id">
                  {{ p.display_name }} ({{ p.provider_id }})
                </option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input v-model="form.description" required placeholder="Read access to calendar events"
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
      <div v-if="showDetail && detailScope" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Edit Scope</h2>
          <button @click="showDetail = null" class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer">Close</button>
        </div>
        <div class="mb-4 text-sm text-gray-400">
          <span class="text-gray-500">Scope:</span>
          <code class="text-gray-300 ml-2 font-mono">{{ detailScope.name }}</code>
          <span v-if="standardScopes.includes(detailScope.name)" class="ml-2 text-xs text-yellow-400">(standard — cannot delete)</span>
        </div>
        <form @submit.prevent="updateScope(detailScope.name)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input v-model="editForm.description"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Provider</label>
            <select v-model="editForm.provider_id"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">None</option>
              <option v-for="p in providers" :key="p.provider_id" :value="p.provider_id">
                {{ p.display_name }} ({{ p.provider_id }})
              </option>
            </select>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="editLoading"
              class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm">
              {{ editLoading ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              v-if="!standardScopes.includes(detailScope.name)"
              type="button"
              @click="deleteScope(detailScope.name)"
              class="py-2 px-6 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors cursor-pointer text-sm border border-red-600/30"
            >
              Delete Scope
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
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="scope in scopes" :key="scope.name" class="hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-sm text-white font-medium font-mono">
                {{ scope.name }}
                <span v-if="standardScopes.includes(scope.name)" class="ml-1.5 text-xs text-yellow-400/60">(standard)</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-300">{{ scope.description }}</td>
              <td class="px-6 py-4 text-sm text-gray-400 font-mono">{{ scope.provider_id || '—' }}</td>
              <td class="px-6 py-4 text-right">
                <button @click="viewDetail(scope.name)" class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  View / Edit
                </button>
              </td>
            </tr>
            <tr v-if="scopes.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">No scopes found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
