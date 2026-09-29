<template>
  <section class="flow-page">
    <header class="page-heading">
      <div><p class="eyebrow">WORKFLOW / NEW REQUEST</p><h1>流程发起</h1></div>
      <span v-if="selectedWorkflow" class="form-note">带 * 项目为必填</span>
    </header>

    <section v-if="!selectedWorkflow" class="department-section">
      <div class="department-grid">
        <el-card v-for="department in departments" :key="department.key" class="department-card" shadow="never">
          <template #header>
            <h3 class="department-title">{{ department.label }}</h3>
          </template>
          <el-menu class="workflow-menu" @select="selectWorkflow">
            <el-menu-item
              v-for="workflow in department.workflows"
              :key="workflow.key"
              :index="workflow.key"
            >
              <span>{{ workflow.label }}</span>
              <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            </el-menu-item>
          </el-menu>
        </el-card>
      </div>
    </section>

    <div v-else class="form-layout">
      <div class="form-main">
        <el-page-header class="form-page-header" @back="goBackToWorkflowList">
          <template #content>
            <span class="full-path-title">流程中心 / 流程发起 / {{ selectedDepartment?.label }} / {{ selectedWorkflow.label }}</span>
          </template>
        </el-page-header>
      <el-form label-position="top" class="initiate-form">
        <div class="form-grid">
          <el-form-item label="流程类型">
            <el-input :model-value="selectedWorkflow.label" readonly />
          </el-form-item>
          <el-form-item label="设备 / 系统 / 服务 *">
            <el-input v-model="device" placeholder="请输入设备或系统名称" />
          </el-form-item>
          <el-form-item label="申请成员 *" class="full-width">
            <el-select v-model="applicantIds" multiple filterable placeholder="请选择申请成员" style="width: 100%">
              <el-option v-for="staff in activeStaff" :key="staff.id" :label="staff.name" :value="staff.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请的缘由 *" class="full-width">
            <el-input v-model="reason" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="说明申请背景与原因" />
          </el-form-item>
          <el-form-item label="申请修改的内容 *" class="full-width">
            <el-input v-model="requestedChanges" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请描述需要办理或修改的内容" />
          </el-form-item>
          <el-form-item label="期望完成时间 *">
            <el-date-picker v-model="expectedCompletionAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" style="width: 100%" />
          </el-form-item>
        </div>
        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitFlow">提交申请</el-button>
        </div>
      </el-form>
      </div>

    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { pendingFlowList, staffList } from '@/stores/fack'

const router = useRouter()
type WorkflowOption = { key: string; label: string }
type DepartmentOption = { key: string; label: string; workflows: WorkflowOption[] }
const departments: DepartmentOption[] = [
  {
    key: 'it',
    label: 'IT 部门',
    workflows: [
      { key: 'it-service', label: 'IT 服务申请' },
      { key: 'system-access', label: '系统权限申请' },
      { key: 'device-support', label: '设备维护申请' },
    ],
  },
  {
    key: 'finance',
    label: '财务部',
    workflows: [
      { key: 'expense-reimbursement', label: '费用报销申请' },
      { key: 'finance-system-access', label: '财务系统权限申请' },
    ],
  },
  {
    key: 'hr',
    label: '人事部',
    workflows: [
      { key: 'leave-application', label: '请假申请' },
      { key: 'personnel-change', label: '员工信息变更' },
    ],
  },
  {
    key: 'procurement',
    label: '采购部',
    workflows: [
      { key: 'purchase-request', label: '采购申请' },
      { key: 'supplier-onboarding', label: '供应商新增申请' },
    ],
  },
]
const selectedWorkflow = ref<WorkflowOption | null>(null)
const selectedDepartment = computed(() => departments.find((department) =>
  department.workflows.some((workflow) => workflow.key === selectedWorkflow.value?.key),
))
const activeStaff = computed(() => staffList.filter((staff) => staff.accountStatus === '启用'))
const currentCreatorId = computed(() => localStorage.getItem('currentUserId') === 'finance-admin' ? 2 : 1)
const device = ref('')
const applicantIds = ref<number[]>([currentCreatorId.value])
const reason = ref('')
const requestedChanges = ref('')
const expectedCompletionAt = ref('')

const selectWorkflow = (key: string) => {
  selectedWorkflow.value = departments.flatMap((department) => department.workflows).find((workflow) => workflow.key === key) ?? null
}

const goBackToWorkflowList = () => {
  selectedWorkflow.value = null
}

const resetForm = () => {
  device.value = ''
  applicantIds.value = [currentCreatorId.value]
  reason.value = ''
  requestedChanges.value = ''
  expectedCompletionAt.value = ''
}

const submitFlow = () => {
  if (!selectedWorkflow.value || !device.value.trim() || !applicantIds.value.length
    || !reason.value.trim() || !requestedChanges.value.trim() || !expectedCompletionAt.value) {
    ElMessage.warning('请完整填写所有必填信息')
    return
  }

  const now = new Date()
  const createdAt = `${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}`
  const nextId = Math.max(...pendingFlowList.map((flow) => flow.id), 1000) + 1
  pendingFlowList.push({
    id: nextId,
    title: `${selectedWorkflow.value.label} - ${device.value.trim()}`,
    creatorId: currentCreatorId.value,
    createdAt,
    expectedCompletionAt: expectedCompletionAt.value,
    pendingOperators: ['信息部管理员'],
    requestType: selectedWorkflow.value.label,
    device: device.value.trim(),
    applicantIds: [...applicantIds.value],
    reason: reason.value.trim(),
    requestedChanges: requestedChanges.value.trim(),
    isRead: false,
    isFollowed: false,
  })

  ElMessage.success('流程申请已提交')
  void router.push('/pending-flow')
}
</script>

<style scoped>
.flow-page { min-width: 0; color: #253238; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 2px 0 18px; margin-bottom: 20px; border-bottom: 1px solid #dfe8e4; }
.eyebrow { margin: 0 0 7px; color: #16836f; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
h1 { margin: 0; color: #173b3b; font-size: 24px; font-weight: 700; line-height: 1.25; }
.form-note { color: #7b8986; font-size: 12px; }
.department-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.department-card { box-sizing: border-box; flex: 0 0 300px; width: 300px; max-width: 100%; min-width: 0; border-color: #dfe8e4; border-radius: 6px; }
.department-card :deep(.el-card__header) { padding: 16px 18px; border-bottom-color: #edf2ef; }
.department-card :deep(.el-card__body) { overflow: hidden; padding: 0; }
.department-title { margin: 0; color: #304644; font-size: 18px; font-weight: 650; line-height: 1.4; }
.workflow-menu { border-right: 0; }
.workflow-menu :deep(.el-menu-item) { display: flex; height: 46px; padding-right: 14px; border-bottom: 1px solid #f0f3f1; color: #455853; }
.workflow-menu :deep(.el-menu-item > span) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.workflow-menu :deep(.el-menu-item:last-child) { border-bottom: 0; }
.workflow-menu :deep(.el-menu-item:hover) { background: #f5f9f7; color: #167562; }
.menu-arrow { flex: 0 0 auto; margin-left: 10px; color: #9aa6a2; }
.form-main { min-width: 0; }
.form-page-header { margin-bottom: 16px; }
.full-path-title { color: #536761; font-size: 14px; }
.form-layout { display: block; width: 100%; }
.initiate-form { min-width: 0; padding: 22px; border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 18px; }
.full-width { grid-column: 1 / -1; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 14px; border-top: 1px solid #edf2ef; }
@media (max-width: 700px) { .department-card { flex-basis: 100%; width: 100%; } }
@media (max-width: 600px) { .page-heading { align-items: flex-start; flex-direction: column; } .initiate-form { padding: 16px; } .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: auto; } }
</style>