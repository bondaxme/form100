import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage/TabsPage.vue'
import HelloPage from '../views/HelloPage/HelloPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
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
  },
  {
    path: '/hello',
    component: HelloPage,
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
