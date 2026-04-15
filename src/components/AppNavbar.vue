<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { isAuthenticated, isAdmin, user, logout } = useAuth()
const isCollapsed = ref(false)

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <aside
    :class="[
      'h-screen bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col shrink-0 sticky left-0 top-0 z-10',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800">
      <span v-if="!isCollapsed" class="font-bold text-xl text-white tracking-wider">Verys</span>
      <button
        @click="isCollapsed = !isCollapsed"
        class="p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        :class="{ 'mx-auto': isCollapsed }"
      >
        <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <nav v-if="isAuthenticated" class="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
        <span v-if="!isCollapsed">Dashboard</span>
      </router-link>

      <template v-if="isAdmin">
        <span v-if="!isCollapsed" class="text-slate-500 uppercase text-xs font-semibold tracking-wider px-3 pt-4 pb-1">Admin</span>
        <div v-else class="border-t border-slate-800 my-2"></div>

        <router-link
          to="/admin/identities"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          <span v-if="!isCollapsed">Identities</span>
        </router-link>

        <router-link
          to="/admin/clients"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span v-if="!isCollapsed">Clients</span>
        </router-link>

        <router-link
          to="/admin/providers"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
          </svg>
          <span v-if="!isCollapsed">Providers</span>
        </router-link>

        <router-link
          to="/admin/scopes"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span v-if="!isCollapsed">Scopes</span>
        </router-link>
      </template>
    </nav>

    <div class="mt-auto border-t border-slate-800 p-4">
      <template v-if="isAuthenticated">
        <div v-if="!isCollapsed" class="text-slate-400 text-sm truncate mb-3">{{ user?.email }}</div>
        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!isCollapsed">Logout</span>
        </button>
      </template>
      <template v-else>
        <router-link
          to="/login"
          class="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!isCollapsed">Sign In</span>
        </router-link>
        <router-link
          to="/register"
          class="flex items-center justify-center gap-3 mt-2 border border-slate-700 hover:border-slate-600 hover:text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm11-4v6m3-3h-6" />
          </svg>
          <span v-if="!isCollapsed">Sign Up</span>
        </router-link>
      </template>
    </div>
  </aside>
</template>
