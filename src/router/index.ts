import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage/TabsPage.vue';
import { getPassword, checkSession } from '@/compasables/useDatabase';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage/LoginPage.vue'),
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page/Tab3Page.vue')
      },
      {
        path: 'statistics',
        component: () => import('@/views/StatisticsPage/StatisticsPage.vue')
      },
      {
        path: 'report/:id',
        component: () => import('@/views/ReportPage/ReportPage.vue'),
      },
      {
        path: 'report/:id/edit',
        component: () => import('@/views/ReportEdit/ReportEdit.vue'),
      },
      {
        path: 'staff',
        component: () => import('@/views/StaffPage/StaffPage.vue'),
      },
      {
        path: 'staff/:id',
        component: () => import('@/views/StaffCardPage/StaffCardPage.vue'),
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    // Allow access to login page
    next();
    return;
  }

  // Check if password exists and session is valid
  const hashedPassword = await getPassword();
  const sessionValid = await checkSession();

  if (!hashedPassword || !sessionValid) {
    next('/login');
    return;
  }

  next();
});

export default router;
