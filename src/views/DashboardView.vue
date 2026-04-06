<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import AppLayout from '../components/AppLayout.vue'

const { user, fetchUser } = useAuth()

onMounted(() => {
  fetchUser()
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
            <dt class="text-gray-400 text-sm">Email</dt>
            <dd class="text-white font-medium">{{ user?.email || user?.sub || '—' }}</dd>
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
    </div>
  </AppLayout>
</template>
