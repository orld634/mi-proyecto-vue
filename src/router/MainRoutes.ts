const MainRoutes = {
  path: '/',
  meta: {
    requiresAuth: false,
  },
  redirect: '/auth/login',
  component: () => import('@/views/pages/home.vue'),
  children: [
    {
      name: 'catalogo',
      path: '/catalogo',
      component: () => import('@/views/pages/catalogo.vue')
    },
    {
      name: 'admin',
      path: '/admin',
      component: () => import('@/views/pages/admin.vue'),
      meta: {
        requiresAuth: false,
        hideNavigation: true,
        layout: 'auth'
      }
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        requiresAuth: true,
      }
    },
    {
      name: 'Typography',
      path: '/ui/typography',
      component: () => import('@/views/components/Typography.vue'),
      meta: {
        requiresAuth: true,
      }
    },
    {
      name: 'Shadow',
      path: '/ui/shadow',
      component: () => import('@/views/components/Shadow.vue'),
      meta: {
        requiresAuth: true,
      }
    },
    {
      name: 'Icons',
      path: '/icons',
      component: () => import('@/views/pages/Icons.vue'),
      meta: {
        requiresAuth: true,
      }
    },
    {
      name: 'Starter',
      path: '/sample-page',
      component: () => import('@/views/pages/SamplePage.vue'),
      meta: {
        requiresAuth: true,
      }
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        requiresAuth: false,
        hideNavigation: true,
        layout: 'auth'
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: 'Users'
    },
  ],
};

export const PromoRoutes = {
  path: '/promociones',
  name: 'promociones',
  component: () => import('@/views/pages/promociones.vue'),
  meta: {
    requiresAuth: false
  }
};

export default MainRoutes;