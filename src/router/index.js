import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

import LoginView from '../views/LoginView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import VerifyView from '../views/VerifyView.vue'
import CallbackView from '../views/CallbackView.vue'
import DashboardView from '../views/DashboardView.vue'
import LogoutView from '../views/LogoutView.vue'
import IdentitiesView from '../views/admin/IdentitiesView.vue'
import ClientsView from '../views/admin/ClientsView.vue'
import ProvidersView from '../views/admin/ProvidersView.vue'
import ScopesView from '../views/admin/ScopesView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: LoginView, meta: { guest: true } },
  { path: '/register', name: 'Register', component: RegistrationView, meta: { guest: true } },
  { path: '/verify', name: 'Verify', component: VerifyView, meta: { guest: true } },
  { path: '/callback', name: 'Callback', component: CallbackView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { auth: true } },
  { path: '/logout', name: 'Logout', component: LogoutView },
  { path: '/admin/identities', name: 'Identities', component: IdentitiesView, meta: { auth: true, admin: true } },
  { path: '/admin/clients', name: 'Clients', component: ClientsView, meta: { auth: true, admin: true } },
  { path: '/admin/providers', name: 'Providers', component: ProvidersView, meta: { auth: true, admin: true} },
  { path: '/admin/scopes', name: 'Scopes', component: ScopesView, meta: { auth: true, admin: true} }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.name === 'Callback') return

  const { isAuthenticated, loading, fetchUser } = useAuth()

  if (loading.value && !isAuthenticated.value) {
    await fetchUser()
  }

  if (to.meta.auth && !isAuthenticated.value) {
    return { name: 'Login' }
  }

  if (to.meta.guest && isAuthenticated.value) {
    return { name: 'Dashboard' }
  }
})

export default router
