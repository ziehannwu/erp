<template>
  <el-header class="top-header">
    <div class="logo-area">
      <el-link type="success" class="logo-text">Hann-ERP</el-link>
    </div>

    <div class="header-actions">
      <div class="message-box">
        <el-dropdown trigger="click">
          <span class="header-icon-btn" aria-label="消息中心">
            <el-icon><Bell /></el-icon>
            <span class="notice-dot" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>消息处理</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="user-box">
        <el-dropdown trigger="click">
          <div class="user-trigger">
            <div class="avatar">{{ currentUser.name.charAt(0) }}</div>
            <div class="user-meta">
              <div class="user-name">{{ currentUser.name }}</div>
              <div class="user-dept">{{ currentUser.departmentLabel }}</div>
            </div>
            <el-icon class="caret"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>{{ currentUser.name }}</el-dropdown-item>
              <el-dropdown-item divided>个人资料</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="switchAccount">切换账号</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, ArrowDown } from '@element-plus/icons-vue'

type Department = 'information' | 'finance'

type UserItem = {
  id: string
  name: string
  department: Department
  departmentLabel: string
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

const currentUserId = ref<string>('info-admin')

const currentUser = computed<UserItem>(() => {
  const selectedUser = userList.find((user) => user.id === currentUserId.value)
  if (selectedUser) {
    return selectedUser
  }
  return userList[0]!
})

const switchAccount = () => {
  const nextUserId = currentUserId.value === 'info-admin' ? 'finance-admin' : 'info-admin'
  currentUserId.value = nextUserId
  localStorage.setItem('currentUserId', nextUserId)

  const nextUser = userList.find((user) => user.id === nextUserId) ?? userList[0]!
  ElMessage.success(`已切换到 ${nextUser.name}`)
}

const logout = () => {
  ElMessage.info('已退出登录')
}
</script>

<style scoped>
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  /* padding: 0 20px; */
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f9d65 !important;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
}

.message-box,
.user-box {
  display: flex;
  align-items: center;
}

.header-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
}

.notice-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #fff;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: left;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.user-dept {
  font-size: 11px;
  color: #64748b;
}
</style>
