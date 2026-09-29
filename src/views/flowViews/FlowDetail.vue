<template>
  <section v-if="flow" class="detail-page">
    <div class="detail-topbar">
      <div class="flow-meta">
        <span> 流程编号: {{ flow.id }}</span>
      </div>
      <div class="decision-actions">
        <el-button type="primary" @click="approveFlow">批准</el-button>
        <el-button type="primary" @click="returnFlow">退回</el-button>
      </div>
    </div>

    <header class="detail-heading">
        <br>
      <div>
        <h1>{{ flow.title }}</h1>
      </div>
      <el-tooltip content="催促当前流程处理人" placement="top">
        <span class="reminder-button-wrap">
          <el-button
            class="reminder-button"
            type="primary"
            plain
            circle
            aria-label="催促当前流程处理人"
            :disabled="!flow.pendingOperators.length"
            @click="remindHandler"
          >
            <el-icon><Bell /></el-icon>
          </el-button>
        </span>
      </el-tooltip>
    </header>

    <section class="detail-section">
      <h2>基础信息</h2>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="创建人">{{ creator?.name ?? '未知成员' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ creator?.employeeNo ?? '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ creator?.department ?? '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="职务">{{ creator?.position ?? '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ creator?.phone ?? '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ flow.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </section>

    <section class="detail-section application-section">
      <h2>申请信息</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请类型">{{ flow.requestType }}</el-descriptions-item>
        <el-descriptions-item label="设备选择">{{ flow.device }}</el-descriptions-item>
        <el-descriptions-item label="申请成员" :span="2">
          <div class="applicant-list">
            <el-tag v-for="applicant in applicants" :key="applicant.id" effect="plain">
              {{ applicant.name }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="申请的缘由" :span="2">
          <p class="description-text">{{ flow.reason }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="申请修改的内容" :span="2">
          <p class="description-text">{{ flow.requestedChanges }}</p>
        </el-descriptions-item>
        <el-descriptions-item label="期望完成时间" :span="2">{{ flow.expectedCompletionAt }}</el-descriptions-item>
      </el-descriptions>
    </section>

    <section class="detail-section">
      <div class="progress-heading">
        <h2>流程到谁了</h2>
        <el-button
          plain
          size="small"
          :disabled="hasTransferred"
          @click="openTransferDialog"
        >
          流程转移
        </el-button>
      </div>
      <div class="progress-track">
        <el-steps direction="horizontal" align-center :active="activeStep" finish-status="success" process-status="process">
          <el-step
            v-for="step in workflowSteps"
            :key="step.title"
            :title="step.title"
          >
            <template v-if="step.description" #description>{{ step.description }}</template>
          </el-step>
        </el-steps>
      </div>
    </section>

    <section class="detail-section opinion-section">
      <el-collapse v-model="activeOpinionPanels">
        <el-collapse-item name="flow-opinions">
          <template #title>
            <span class="opinion-collapse-title">流程意见</span>
            <el-tag v-if="approvalOpinions.length" size="small" effect="plain">
              {{ approvalOpinions.length }}
            </el-tag>
          </template>
          <el-empty v-if="!approvalOpinions.length" description="暂无流程意见" :image-size="64" />
          <article v-for="(opinion, index) in approvalOpinions" :key="`${opinion.time}-${index}`" class="opinion-entry">
            <header class="opinion-entry-header">
              <div class="opinion-approver">
                <strong>{{ opinion.leaderName }}</strong>
                <span>{{ opinion.department }} · {{ opinion.position }}</span>
              </div>
              <time>{{ opinion.time }}</time>
            </header>
            <p class="opinion-remark">{{ opinion.remark }}</p>
            <footer class="opinion-entry-footer">
              <span>接受人：{{ opinion.recipient }}</span>
              <el-tag :type="opinion.action.includes('批准') ? 'success' : 'info'" effect="plain" size="small">
                {{ opinion.action }}
              </el-tag>
            </footer>
          </article>
        </el-collapse-item>
      </el-collapse>
    </section>

    <el-dialog v-model="transferDialogVisible" title="流程转移" width="520px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="转移缘由" required>
          <el-input
            v-model="transferReason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请填写本次流程转移的原因"
          />
        </el-form-item>
        <el-form-item label="转移到" required>
          <el-cascader
            v-model="transferPath"
            :options="transferCascaderOptions"
            :props="transferCascaderProps"
            placeholder="请选择部门和同事"
            filterable
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approvalDialogVisible" title="批准流程" width="520px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="批准备注" required>
          <el-input
            v-model="approvalRemark"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="请填写审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApproval">确认批准</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="returnDialogVisible" title="退回流程" width="520px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="退回原因" required>
          <el-input
            v-model="returnReason"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="请填写退回原因，申请人将收到该意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReturn">确认退回</el-button>
      </template>
    </el-dialog>
  </section>

  <section v-else class="not-found">
    <el-empty description="未找到该流程">
    </el-empty>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { pendingFlowList, staffList } from '@/stores/fack'

const route = useRoute()
type WorkflowStep = { title: string; description?: string }
const flow = computed(() => pendingFlowList.find((item) => item.id === Number(route.params.id)))
const transferDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const approvalRemark = ref('')
const returnReason = ref('')
const activeOpinionPanels = ref<string[]>([])
const transferReason = ref('')
const transferPath = ref<Array<string | number>>([])
const creator = computed(() => flow.value && staffList.find((staff) => staff.id === flow.value?.creatorId))
const applicants = computed(() =>
  staffList.filter((staff) => flow.value?.applicantIds.includes(staff.id)),
)
const transferCascaderProps = { emitPath: true }
const transferCascaderOptions = computed(() => {
  const coworkers = staffList.filter((staff) => staff.accountStatus === '启用')
  const departments = new Map<string, typeof coworkers>()

  coworkers.forEach((coworker) => {
    const department = coworker.department ?? '未分配部门'
    const members = departments.get(department) ?? []
    members.push(coworker)
    departments.set(department, members)
  })

  return Array.from(departments, ([department, members]) => ({
    value: `department:${department}`,
    label: department,
    children: members.map((coworker) => ({ value: coworker.id, label: coworker.name })),
  }))
})
const approvalOpinions = computed(() => flow.value?.approvalOpinions ?? [])
const hasTransferred = computed(() => Boolean(flow.value?.transferHistory?.length))
const workflowSteps = computed<WorkflowStep[]>(() => {
  if (!flow.value) return []

  return [
    { title: creator.value?.name ?? '未知成员', description: flow.value.createdAt },
    ...flow.value.pendingOperators.map((operator) => ({
      title: operator,
    })),
    { title: '申请人' },
  ]
})
const activeStep = 1

watchEffect(() => {
  if (flow.value) flow.value.isRead = true
})

const remindHandler = () => {
  const handler = flow.value?.pendingOperators[0]
  if (!handler) return
  ElNotification({
    title: '催促成功',
    message: `已提醒 ${handler} 尽快处理`,
    type: 'success',
    position: 'top-right',
  })
}

const approveFlow = () => {
  approvalRemark.value = ''
  approvalDialogVisible.value = true
}

const confirmApproval = () => {
  const remark = approvalRemark.value.trim()
  if (!remark) {
    ElMessage.warning('请填写批准备注')
    return
  }
  if (!flow.value) return

  const currentHandler = flow.value.pendingOperators[0] ?? '流程处理人'
  const approver = staffList.find((staff) => staff.name === currentHandler)
    ?? staffList.find((staff) => currentHandler.includes(staff.department ?? '\u0000') && /主管|经理/.test(staff.position ?? ''))
  const recipient = flow.value.pendingOperators[1]
    ?? applicants.value.map((applicant) => applicant.name).join('、')
    ?? '申请人'

  flow.value.approvalOpinions ??= []
  flow.value.approvalOpinions.push({
    leaderName: approver?.name ?? currentHandler,
    department: approver?.department ?? '未知部门',
    position: approver?.position ?? '流程处理人',
    remark,
    recipient: recipient || '申请人',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    action: '抄送 IT / 批准',
  })
  flow.value.pendingOperators.shift()
  approvalDialogVisible.value = false
  ElMessage.success('已批准该流程，审批意见已记录')
}

const returnFlow = () => {
  returnReason.value = ''
  returnDialogVisible.value = true
}

const confirmReturn = async () => {
  const remark = returnReason.value.trim()
  if (!remark) {
    ElMessage.warning('请填写退回原因')
    return
  }
  if (!flow.value) return

  try {
    await ElMessageBox.confirm(
      '确认退回该流程吗？退回后流程将回到申请人。',
      '确认退回',
      {
        confirmButtonText: '确认退回',
        cancelButtonText: '继续编辑',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  const currentHandler = flow.value.pendingOperators[0] ?? '流程处理人'
  const approver = staffList.find((staff) => staff.name === currentHandler)
    ?? staffList.find((staff) => currentHandler.includes(staff.department ?? '\u0000') && /主管|经理/.test(staff.position ?? ''))

  flow.value.approvalOpinions ??= []
  flow.value.approvalOpinions.push({
    leaderName: approver?.name ?? currentHandler,
    department: approver?.department ?? '未知部门',
    position: approver?.position ?? '流程处理人',
    remark,
    recipient: applicants.value.map((applicant) => applicant.name).join('、') || '申请人',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    action: '退回',
  })
  flow.value.pendingOperators.splice(0)
  activeOpinionPanels.value = ['flow-opinions']
  returnDialogVisible.value = false
  ElMessage.success('流程已退回申请人')
}

const openTransferDialog = () => {
  if (hasTransferred.value) return
  transferReason.value = ''
  transferPath.value = []
  transferDialogVisible.value = true
}

const confirmTransfer = async () => {
  if (hasTransferred.value) {
    ElMessage.warning('流程转移只有一次机会')
    return
  }

  const reason = transferReason.value.trim()
  const selectedValue = transferPath.value[transferPath.value.length - 1]
  const target = typeof selectedValue === 'number'
    ? staffList.find((staff) => staff.id === selectedValue)
    : undefined
  if (!reason) {
    ElMessage.warning('请填写转移缘由')
    return
  }
  if (!target) {
    ElMessage.warning('请选择转移到的同事')
    return
  }
  if (!flow.value) return

  try {
    await ElMessageBox.confirm(
      '流程转移只有一次机会，提交后不可再次转移。确认继续吗？',
      '确认流程转移',
      {
        confirmButtonText: '确认转移',
        cancelButtonText: '再检查一下',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  if (hasTransferred.value) return

  const currentHandler = flow.value.pendingOperators[0] ?? '当前处理人'
  const transferActor = staffList.find((staff) => staff.name === currentHandler)
    ?? staffList.find((staff) => currentHandler.includes(staff.department ?? '\u0000') && /主管|经理/.test(staff.position ?? ''))
  if (flow.value.pendingOperators.length) {
    flow.value.pendingOperators[0] = target.name
  } else {
    flow.value.pendingOperators.unshift(target.name)
  }

  flow.value.transferHistory ??= []
  flow.value.transferHistory.push({
    from: currentHandler,
    to: target.name,
    reason,
    transferredAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  flow.value.approvalOpinions ??= []
  flow.value.approvalOpinions.push({
    leaderName: transferActor?.name ?? currentHandler,
    department: transferActor?.department ?? '未知部门',
    position: transferActor?.position ?? '流程处理人',
    remark: reason,
    recipient: target.name,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    action: '流程转移',
  })
  activeOpinionPanels.value = ['flow-opinions']
  transferDialogVisible.value = false
  ElMessage.success(`流程已转移给 ${target.name}`)
}
</script>

<style scoped>
.detail-page {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  borrader-radius: 26px;
  margin: 0 auto;
  color: #253238;
  background-color: #fff;
}

.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.flow-meta {
  color: #70817c;
  font-size: 24px;
}

.flow-meta strong {
  color: #304644;
  font-weight: 650;
}

.decision-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #16836f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

h1 {
  margin: 0;
  color: #173b3b;
  font-size: 24px;
  font-weight: 650;
}

.reminder-button-wrap {
  display: inline-flex;
}

.reminder-button {
  width: 34px;
  height: 34px;
}

.reminder-alert {
  margin: -10px 0 20px;
}

.detail-section {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin-bottom: 24px;
}

.detail-section :deep(.el-descriptions),
.detail-section :deep(.el-descriptions__body),
.detail-section :deep(.el-descriptions__table) {
  width: 100%;
}

h2 {
  margin: 0 0 12px;
  color: #304644;
  font-size: 16px;
  font-weight: 650;
}

.progress-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.progress-heading h2 {
  margin: 0;
}

.transfer-note {
  box-sizing: border-box;
  width: 100%;
  margin-top: 12px;
  padding: 12px 14px;
  border-left: 3px solid #16836f;
  background: #f5f9f7;
  color: #536761;
  font-size: 13px;
}

.transfer-note-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #304644;
}

.transfer-note-heading span,
.transfer-note > span {
  color: #85918f;
  font-size: 12px;
}

.transfer-note p {
  margin: 8px 0;
}

.opinion-section :deep(.el-collapse) {
  border-top: 1px solid #e5ece8;
  border-bottom: 1px solid #e5ece8;
}

.opinion-section :deep(.el-collapse-item__header) {
  gap: 10px;
  color: #304644;
  font-size: 15px;
  font-weight: 600;
}

.opinion-section :deep(.el-collapse-item__wrap) {
  border-bottom: 0;
}

.opinion-section :deep(.el-collapse-item__content) {
  padding-bottom: 12px;
}

.opinion-collapse-title {
  margin-right: 2px;
}

.opinion-entry {
  padding: 16px 18px;
  border: 1px solid #e5ece8;
  border-radius: 6px;
  background: #fbfcfb;
}

.opinion-entry + .opinion-entry {
  margin-top: 10px;
}

.opinion-entry-header,
.opinion-entry-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.opinion-approver {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 9px;
}

.opinion-approver strong {
  color: #304644;
  font-size: 14px;
}

.opinion-approver span,
.opinion-entry-header time,
.opinion-entry-footer > span {
  color: #7b8986;
  font-size: 12px;
}

.opinion-remark {
  margin: 14px 0;
  color: #465955;
  line-height: 1.7;
  white-space: pre-wrap;
}

.description-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
}

.applicant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.progress-track {
  box-sizing: border-box;
  width: 100%;
  padding: 18px 22px 10px;
  border: 1px solid #e5ece8;
  border-radius: 6px;
  background: #fff;
}

.not-found {
  padding: 80px 0;
}

@media (max-width: 760px) {
  .detail-topbar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .decision-actions {
    margin-left: auto;
  }

  :deep(.el-descriptions__body .el-descriptions__table) {
    table-layout: auto;
  }

  :deep(.el-descriptions__label) {
    min-width: 90px;
  }

  .opinion-entry-header,
  .opinion-entry-footer {
    align-items: flex-start;
    flex-direction: column;
  }

}
</style>