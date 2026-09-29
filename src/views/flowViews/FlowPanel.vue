<template>
    <section class="flow-page">
        <el-tabs v-model="dataScope" type="card" class="scope-tabs">
            <el-tab-pane label="本人" name="personal" />
            <el-tab-pane label="本部门" name="department" />
        </el-tabs>

        <el-card class="dashboard-shell" shadow="never">
        <div class="summary-grid">
            <button class="summary-item" type="button" @click="goTo('/pending-flow')">
                <span class="summary-label">{{ dataScope === 'personal' ? '我的待处理' : '部门待处理' }}</span><strong>{{ pendingCount }}</strong>
                <span class="summary-foot">等待当前范围内处理的流程</span>
            </button>
            <button class="summary-item" type="button" @click="goTo('/initiated-flow')">
                <span class="summary-label">{{ dataScope === 'personal' ? '我发起的' : '部门发起的' }}</span><strong>{{ initiatedCount }}</strong>
                <span class="summary-foot">当前范围发起的流程</span>
            </button>
            <button class="summary-item" type="button" @click="goTo('/processed-flow')">
                <span class="summary-label">已处理意见</span><strong>{{ processedCount }}</strong>
                <span class="summary-foot">审批与流程转移记录</span>
            </button>
            <div class="summary-item">
                <span class="summary-label">已关注</span><strong>{{ followedCount }}</strong>
                <span class="summary-foot">关注中的流程</span>
            </div>
        </div>

        <section class="list-section">
            <div class="section-heading">
                <el-button text type="primary" @click="goTo('/pending-flow')">查看待处理</el-button>
            </div>
            <div class="table-wrap">
                <el-table :data="recentFlows" style="width: 100%" @row-click="openDetail">
                    <el-table-column prop="title" label="流程标题" min-width="240" />
                    <el-table-column label="创建人" min-width="130">
                        <template #default="{ row }">{{ getCreatorName(row.creatorId) }}</template>
                    </el-table-column>
                    <el-table-column prop="createdAt" label="创建时间" min-width="170" />
                    <el-table-column label="当前处理人" min-width="180">
                        <template #default="{ row }">
                            <div class="operator-list">
                                <el-tag v-for="operator in row.pendingOperators" :key="operator" effect="plain" size="small">{{ operator }}</el-tag>
                                <span v-if="!row.pendingOperators.length" class="muted">已到申请人</span>
                            </div>
                        </template>
                    </el-table-column>
                    <template #empty><el-empty description="暂无流程" /></template>
                </el-table>
                <footer class="table-footer">共 {{ scopedFlows.length }} 条流程 · {{ dataScope === 'personal' ? '本人' : '本部门' }}范围</footer>
            </div>
        </section>
        </el-card>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pendingFlowList, staffList, type FlowItem } from '@/stores/fack'

const router = useRouter()
const dataScope = ref<'personal' | 'department'>('personal')
const currentStaffId = computed(() => localStorage.getItem('currentUserId') === 'finance-admin' ? 2 : 1)
const currentStaff = computed(() => staffList.find((staff) => staff.id === currentStaffId.value))
const currentDepartment = computed(() => currentStaff.value?.department ?? null)
const departmentStaff = computed(() => staffList.filter((staff) => staff.department === currentDepartment.value))
const currentOperatorNames = computed(() => new Set([
    currentStaff.value?.name ?? '',
    currentDepartment.value === '信息部' ? '信息部管理员' : '财务部管理员',
]))
const departmentOperatorNames = computed(() => {
    const names = new Set(departmentStaff.value.map((staff) => staff.name))
    if (currentDepartment.value === '信息部') names.add('信息部管理员')
    if (currentDepartment.value === '财务部') names.add('财务部管理员')
    return names
})

const scopedFlows = computed(() => pendingFlowList.filter((flow) => {
    const creator = staffList.find((staff) => staff.id === flow.creatorId)
    const isPersonal = flow.creatorId === currentStaffId.value
        || flow.applicantIds.includes(currentStaffId.value)
        || flow.pendingOperators.some((operator) => currentOperatorNames.value.has(operator))
        || flow.approvalOpinions?.some((opinion) => opinion.leaderName === currentStaff.value?.name || opinion.recipient === currentStaff.value?.name)
        || flow.transferHistory?.some((record) => record.from === currentStaff.value?.name || record.to === currentStaff.value?.name)
    const isDepartment = creator?.department === currentDepartment.value
        || flow.applicantIds.some((id) => departmentStaff.value.some((staff) => staff.id === id))
        || flow.pendingOperators.some((operator) => departmentOperatorNames.value.has(operator))
        || flow.approvalOpinions?.some((opinion) => opinion.department === currentDepartment.value)
        || flow.transferHistory?.some((record) => departmentOperatorNames.value.has(record.from) || departmentOperatorNames.value.has(record.to))

    return dataScope.value === 'personal' ? isPersonal : isDepartment
}))

const pendingCount = computed(() => scopedFlows.value.filter((flow) => {
    const handlerNames = dataScope.value === 'personal'
        ? currentOperatorNames.value
        : departmentOperatorNames.value
    return flow.pendingOperators.some((operator) => handlerNames.has(operator))
}).length)
const initiatedCount = computed(() => scopedFlows.value.filter((flow) => {
    if (dataScope.value === 'personal') return flow.creatorId === currentStaffId.value
    return staffList.find((staff) => staff.id === flow.creatorId)?.department === currentDepartment.value
}).length)
const processedCount = computed(() => scopedFlows.value.reduce((count, flow) => {
    const opinions = flow.approvalOpinions ?? []
    return count + opinions.filter((opinion) => dataScope.value === 'personal'
        ? opinion.leaderName === currentStaff.value?.name
        : opinion.department === currentDepartment.value).length
}, 0))
const followedCount = computed(() => scopedFlows.value.filter((flow) => flow.isFollowed).length)
const recentFlows = computed(() => [...scopedFlows.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5))

const getCreatorName = (id: number) => staffList.find((staff) => staff.id === id)?.name ?? '未知成员'
const goTo = (path: string) => void router.push(path)
const openDetail = (row: FlowItem) => {
    window.open(router.resolve({ name: 'flowDetail', params: { id: row.id } }).href, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.flow-page { min-width: 0; color: #253238; }
.dashboard-shell { border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; }
.dashboard-shell :deep(.el-card__body) { padding: 22px; }
.page-heading, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-heading { padding: 2px 0 18px; margin-bottom: 20px; border-bottom: 1px solid #dfe8e4; }
.scope-tabs { position: relative; z-index: 1; margin-bottom: 0; }
.scope-tabs :deep(.el-tabs__content) { display: none; }
.scope-tabs :deep(.el-tabs__header) { margin: 0; border-bottom: 0; }
.scope-tabs :deep(.el-tabs__nav) { border: 0 !important; }
.scope-tabs :deep(.el-tabs__item) { height: 40px; margin-right: 8px; padding: 0 16px; border: 0 !important; border-radius: 6px 6px 0 0; background: #eef4f1; color: #647873; }
.scope-tabs :deep(.el-tabs__item.is-active) { background: #fff; color: #167562; box-shadow: inset 0 -2px #16836f; }
.eyebrow { margin: 0 0 7px; color: #16836f; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
h1 { margin: 0; color: #173b3b; font-size: 24px; font-weight: 700; line-height: 1.25; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; }
.summary-item { display: flex; min-height: 142px; flex-direction: column; align-items: flex-start; padding: 18px 20px; border: 0; border-right: 1px solid #e8efec; background: transparent; color: inherit; text-align: left; }
.summary-item:last-child { border-right: 0; }
button.summary-item { cursor: pointer; }
button.summary-item:hover { background: #f7faf8; }
.summary-label { color: #647873; font-size: 13px; }
.summary-item strong { margin: 10px 0 8px; color: #173b3b; font-size: 30px; font-weight: 650; line-height: 1; }
.summary-foot, .muted { color: #87938f; font-size: 12px; }
.list-section { margin-top: 32px; }
.section-heading { margin-bottom: 14px; }
h2 { margin: 0; color: #304644; font-size: 17px; font-weight: 650; }
.table-wrap { overflow: hidden; border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; box-shadow: 0 2px 7px rgb(30 65 54 / 3%); }
.operator-list { display: flex; flex-wrap: wrap; gap: 5px; }
.table-footer { padding: 11px 16px; border-top: 1px solid #e8efec; color: #7b8986; font-size: 12px; }
:deep(.el-table th.el-table__cell) { height: 46px; background: #f2f7f4; color: #536761; font-size: 12px; font-weight: 650; }
:deep(.el-table td.el-table__cell) { height: 58px; border-bottom-color: #edf2ef; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table__row:hover > td.el-table__cell) { background: #f7faf8 !important; }
:deep(.el-table__inner-wrapper::before) { display: none; }
@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .summary-item:nth-child(2) { border-right: 0; } .summary-item:nth-child(-n + 2) { border-bottom: 1px solid #e8efec; } }
@media (max-width: 600px) { .page-heading, .section-heading { align-items: flex-start; flex-direction: column; } .summary-item { min-height: 120px; padding: 15px; } }
@media (max-width: 600px) { .dashboard-shell :deep(.el-card__body) { padding: 14px; } }
</style>