<template>
  <el-menu
    :default-active="activeMenu"
    class="erp-menu"
    router
    unique-opened
    @open="handleOpen"
    @close="handleClose"
  >
    <template v-for="(menu, index) in visibleMenuList" :key="index">
      <el-sub-menu :index="String(index)">
        <template #title>
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.title }}</span>
        </template>

        <el-menu-item
          v-for="child in menu.children"
          :key="`${menu.title}-${child.title}`"
          :index="child.linkPath"
          @click="goTo(child.linkPath)"
        >
          {{ child.title }}
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Setting, Tickets, User, WindPower 
  ,House
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

type Department = 'information' | 'finance'

type UserItem = {
  id: string
  name: string
  department: Department
  departmentLabel: string
}

type MenuChild = {
  title: string
  linkPath: string
  allowedDepartments?: Department[]
}

type MenuItem = {
  title: string
  icon: unknown
  children: MenuChild[]
}

const userList: UserItem[] = [
  {
    id: 'info-admin',
    name: '信息部管理员',
    department: 'information',
    departmentLabel: '信息部',
  },
  {
    id: 'finance-admin',
    name: '财务部管理员',
    department: 'finance',
    departmentLabel: '财务部',
  },
]

const currentUser = computed<UserItem>(() => {
  const currentUserId = localStorage.getItem('currentUserId') ?? 'info-admin'
  const foundUser = userList.find((user) => user.id === currentUserId)
  if (foundUser) {
    return foundUser
  }
  return userList[0]!
})

const activeMenu = computed(() => route.path)

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const goTo = (path: string) => {
  router.push(path)
}

const canAccess = (allowedDepartments?: Department[]) => {
  if (!allowedDepartments || allowedDepartments.length === 0) {
    return true
  }

  return allowedDepartments.includes(currentUser.value.department)
}

const menuList: MenuItem[] = [
  {
    title: '首页',
    icon: House,
    children: [
      {
        title: '仪表盘',
        linkPath: '/dashboard',
      },
    ],
  },
  
  {
    title: '部门中心',
    icon: User,
    children: [
      {
        title: '人员管理',
        linkPath: '/personnel-management',
        allowedDepartments: ['information'],
      },
      {
        title: '权限分配',
        linkPath: '/permission-allocation',
        allowedDepartments: ['information'],
      },
      {
        title: '流程设置',
        linkPath: '/flow-setting',
        allowedDepartments: ['information'],
      },
      {
        title: '财务报表',
        linkPath: '/financial-report',
        allowedDepartments: ['finance'],
      },
      {
        title: '财务审计',
        linkPath: '/financial-audit',
        allowedDepartments: ['finance'],
      },
    ],
  },
  {
    title: '流程中心',
    icon: Tickets,
    children: [
      {
        title: '流程面板',
        linkPath: '/flow-panel',
      },
      {
        title: '待处理流程',
        linkPath: '/pending-flow',
      },
      {
        title: '已处理流程',
        linkPath: '/processed-flow',
      },
      {
        title: '已发起流程',
        linkPath: '/initiated-flow',
      },
    ],
  },
  {
    title: '设置中心',
    icon: Setting,
    children: [
      {
        title: '字段设置',
        linkPath: '/dictionary-set',
      },
      {
        title: '系统中控',
        linkPath: '/system-controller',
      },
      {
        title: '代码生成',
        linkPath: '/code-creator',
      },
    ],
  },
  {
    title: '指南&帮助',
    icon: WindPower,
    children: [
      {
        title: '使用指南',
        linkPath: '/user-guide',
      },
      {
        title: '常见问题',
        linkPath: '/faq',
      },
    ]
  }
]

const visibleMenuList = computed<MenuItem[]>(() =>
  menuList
    .map((menu) => ({
      ...menu,
      children: menu.children.filter((child) => canAccess(child.allowedDepartments)),
    }))
    .filter((menu) => menu.children.length > 0),
)
</script>

<style scoped>
.erp-menu {
  width: 180px;
  min-height: calc(100vh - 60px);
  border-right: 1px solid var(--el-border-color-light);
  margin: 0;
  border-radius: 0;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  padding-left: 0;
  padding-right: 14px;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-left: 6px;
}

:deep(.el-menu-item:last-child) {
  margin-bottom: 0;
}
</style>
