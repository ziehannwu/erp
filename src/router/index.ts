import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/flow-panel',
    },
    {
      name: 'personnelManagement',
      path: '/personnel-management',
      component: () => import('@/views/departmentViews/PersonnelManagement.vue'),
    },
    {
      name: 'permissionAllocation',
      path: '/permission-allocation',
      component: () => import('@/views/departmentViews/PermissionAllocation.vue'),
    },
    {
      name: 'flowSetting',
      path: '/flow-setting',
      component: () => import('@/views/departmentViews/FlowSetting.vue'),
    },
    {
      name: 'financialReport',
      path: '/financial-report',
      component: () => import('@/views/departmentViews/FinancialReport.vue'),
    },
    {
      name: 'financialAudit',
      path: '/financial-audit',
      component: () => import('@/views/departmentViews/FinancialAudit.vue'),
    },
    {
      name: 'flowPanel',
      path: '/flow-panel',
      component: () => import('@/views/flowViews/FlowPanel.vue'),
    },
    {
      name: 'flowInitiate',
      path: '/flow-initiate',
      component: () => import('@/views/flowViews/FlowInitiate.vue'),
    },
    {
      name: 'pendingFlow',
      path: '/pending-flow',
      component: () => import('@/views/flowViews/PendingFlow.vue'),
    },
    {
      name: 'flowDetail',
      path: '/flow-detail/:id',
      component: () => import('@/views/flowViews/FlowDetail.vue'),
    },
    {
      name: 'processedFlow',
      path: '/processed-flow',
      component: () => import('@/views/flowViews/ProcessedFlow.vue'),
    },
    {
      name: 'initiatedFlow',
      path: '/initiated-flow',
      component: () => import('@/views/flowViews/InitiatedFlow.vue'),
    },
    {
      name: 'dictionarySet',
      path: '/dictionary-set',
      component: () => import('@/views/settingViews/DictionarySet.vue'),
    },
    {
      name: 'systemController',
      path: '/system-controller',
      component: () => import('@/views/settingViews/SystemController.vue'),
    },
    {
      name: 'codeCreator',
      path: '/code-creator',
      component: () => import('@/views/settingViews/CodeCreator.vue'),
    },
    {
      name: 'MyCenter',
      path: '/MyCenter',
      component:() => import('@/views/myCenter/MyCenter.vue')
    }
  ],
})

export default router
