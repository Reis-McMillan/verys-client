<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../api/client.js'
import AppLayout from '../../components/AppLayout.vue'

const identities = ref([])
const loading = ref(true)
const error = ref('')

const showCreate = ref(false)
const newEmail = ref('')
const createError = ref('')
const createLoading = ref(false)

const editingIdentity = ref(null)
const editRoles = ref([])
const editLoading = ref(false)

const availableRoles = ['admin', 'service-account', 'coin-manager', 'default']

onMounted(() => fetchIdentities())

async function fetchIdentities() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/identity/')
    if (res.ok) {
      identities.value = await res.json()
    } else {
      error.value = 'Failed to load identities.'
    }
  } catch {
    error.value = 'Network error.'
  } finally {
    loading.value = false
  }
}

async function createIdentity() {
  createError.value = ''
  createLoading.value = true
  try {
    const res = await api.post(`/identity/?email=${encodeURIComponent(newEmail.value)}`)
    if (res.ok) {
      newEmail.value = ''
      showCreate.value = false
      await fetchIdentities()
    } else {
      const data = await res.json().catch(() => ({}))
      createError.value = data.detail || 'Failed to create identity.'
    }
  } catch {
    createError.value = 'Network error.'
  } finally {
    createLoading.value = false
  }
}

function startEdit(identity) {
  editingIdentity.value = identity.email
  editRoles.value = [...(identity.roles || [])]
}

function cancelEdit() {
  editingIdentity.value = null
  editRoles.value = []
}

function toggleRole(role) {
  const idx = editRoles.value.indexOf(role)
  if (idx >= 0) {
    editRoles.value.splice(idx, 1)
  } else {
    editRoles.value.push(role)
  }
}

async function saveRoles(email) {
  editLoading.value = true
  try {
    const res = await api.put(`/identity/${encodeURIComponent(email)}`, { roles: editRoles.value })
    if (res.ok) {
      editingIdentity.value = null
      await fetchIdentities()
    }
  } catch {
    // silently fail
  } finally {
    editLoading.value = false
  }
}

async function deleteIdentity(email) {
  if (!confirm(`Close identity for ${email}?`)) return
  try {
    await api.delete(`/identity/${encodeURIComponent(email)}`)
    await fetchIdentities()
  } catch {
    // silently fail
  }
}

async function logoutIdentity(email) {
  try {
    await api.post(`/identity/${encodeURIComponent(email)}/logout`)
    await fetchIdentities()
  } catch {
    // silently fail
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">Identities</h1>
        <button
          @click="showCreate = !showCreate"
          class="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
        >
          {{ showCreate ? 'Cancel' : 'Create Identity' }}
        </button>
      </div>

      <div v-if="showCreate" class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 class="text-lg font-semibold text-white mb-4">New Identity</h2>
        <form @submit.prevent="createIdentity" class="flex gap-3">
          <input
            v-model="newEmail"
            type="email"
            required
            placeholder="user@example.com"
            class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            :disabled="createLoading"
            class="py-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
          >
            {{ createLoading ? 'Creating...' : 'Create' }}
          </button>
        </form>
        <p v-if="createError" class="text-red-400 text-sm mt-3">{{ createError }}</p>
      </div>

      <div v-if="error" class="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
        {{ error }}
      </div>

      <div v-if="loading" class="text-gray-400 text-center py-12">Loading...</div>

      <div v-else class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Roles</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="identity in identities" :key="identity.email" class="hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 text-sm text-white font-medium">{{ identity.email }}</td>
              <td class="px-6 py-4">
                <template v-if="editingIdentity === identity.email">
                  <div class="flex gap-2 flex-wrap">
                    <button
                      v-for="role in availableRoles"
                      :key="role"
                      @click="toggleRole(role)"
                      :class="editRoles.includes(role) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-800 text-gray-400 border-gray-700'"
                      class="text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer"
                    >
                      {{ role }}
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex gap-1.5 flex-wrap">
                    <span
                      v-for="role in (identity.roles || [])"
                      :key="role"
                      class="text-xs font-medium px-2.5 py-1 rounded-full border bg-indigo-400/10 text-indigo-400 border-indigo-400/20"
                    >
                      {{ role }}
                    </span>
                  </div>
                </template>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="identity.closed ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-green-400/10 text-green-400 border-green-400/20'"
                  class="text-xs font-medium px-2.5 py-1 rounded-full border"
                >
                  {{ identity.closed ? 'Closed' : 'Active' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex gap-2 justify-end">
                  <template v-if="editingIdentity === identity.email">
                    <button @click="saveRoles(identity.email)" :disabled="editLoading" class="text-xs text-green-400 hover:text-green-300 cursor-pointer">Save</button>
                    <button @click="cancelEdit" class="text-xs text-gray-400 hover:text-gray-300 cursor-pointer">Cancel</button>
                  </template>
                  <template v-else>
                    <button @click="startEdit(identity)" class="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">Edit Roles</button>
                    <button @click="logoutIdentity(identity.email)" class="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer">Logout</button>
                    <button @click="deleteIdentity(identity.email)" class="text-xs text-red-400 hover:text-red-300 cursor-pointer">Close</button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="identities.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">No identities found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
