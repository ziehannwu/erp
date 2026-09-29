<template>
    <section class="flow-page">
        <header class="page-heading">
            <div><p class="eyebrow">WORKFLOW / CREATED BY ME</p><h1>已发起流程</h1></div>
        </header>

        <div class="filter-bar">
            <el-input v-model="searchText" clearable placeholder="搜索流程标题" class="search-input" />
            <el-select v-model="statusFilter" clearable placeholder="流程状态" class="status-select">
                <el-option label="流转中" value="pending" />
                <el-option label="已处理" value="processed" />
            </el-select>
        </div>

        <div class="table-wrap">
            <el-table :data="filteredFlows" row-key="id" style="width: 100%" @row-click="openDetail">
                <el-table-column prop="title" label="流程标题" min-width="240" />
                <el-table-column label="创建人" min-width="130">
                    <template #default="{ row }">{{ getCreatorName(row.creatorId) }}</template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" min-width="170" />
                <el-table-column prop="expectedCompletionAt" label="期望完成时间" min-width="150" />
                <el-table-column label="当前处理人" min-width="180">
                    <template #default="{ row }">
                        <div class="operator-list">
                            <el-tag v-for="operator in row.pendingOperators" :key="operator" effect="plain" size="small">{{ operator }}</el-tag>
                            <span v-if="!row.pendingOperators.length" class="muted">已到申请人</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="110">
                    <template #default="{ row }">
                        <el-tag :type="row.pendingOperators.length ? 'warning' : 'success'" effect="plain">{{ row.pendingOperators.length ? '流转中' : '已处理' }}</el-tag>
                    </template>
                </el-table-column>
                <template #empty><el-empty description="暂无已发起流程" /></template>
            </el-table>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pendingFlowList, staffList, type FlowItem } from '@/stores/fack'

const router = useRouter()
const searchText = ref('')
const statusFilter = ref('')
const currentStaffId = computed(() => localStorage.getItem('currentUserId') === 'finance-admin' ? 2 : 1)
const currentDepartment = computed(() => staffList.find((staff) => staff.id === currentStaffId.value)?.department)
const initiatedFlows = computed(() => pendingFlowList.filter((flow) => staffList.find((staff) => staff.id === flow.creatorId)?.department === currentDepartment.value))
const filteredFlows = computed(() => initiatedFlows.value.filter((flow) => {
    const matchesText = !searchText.value || flow.title.includes(searchText.value)
    const matchesStatus = !statusFilter.value || (statusFilter.value === 'pending' ? flow.pendingOperators.length > 0 : flow.pendingOperators.length === 0)
    return matchesText && matchesStatus
}))
const getCreatorName = (id: number) => staffList.find((staff) => staff.id === id)?.name ?? '未知成员'
const openDetail = (row: FlowItem) => window.open(router.resolve({ name: 'flowDetail', params: { id: row.id } }).href, '_blank', 'noopener,noreferrer')
</script>

<style scoped>
.flow-page { min-width: 0; color: #253238; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 2px 0 18px; margin-bottom: 18px; border-bottom: 1px solid #dfe8e4; }
.eyebrow { margin: 0 0 7px; color: #16836f; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
h1 { margin: 0; color: #173b3b; font-size: 24px; font-weight: 700; line-height: 1.25; }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { width: min(340px, 100%); }
.status-select { width: 160px; }
.table-wrap { overflow: hidden; border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; box-shadow: 0 2px 7px rgb(30 65 54 / 3%); }
.operator-list { display: flex; flex-wrap: wrap; gap: 5px; }
.muted { color: #87938f; font-size: 12px; }
.table-footer { display: flex; justify-content: space-between; padding: 11px 16px; border-top: 1px solid #e8efec; color: #7b8986; font-size: 12px; }
:deep(.el-table th.el-table__cell) { height: 46px; background: #f2f7f4; color: #536761; font-size: 12px; font-weight: 650; }
:deep(.el-table td.el-table__cell) { height: 58px; border-bottom-color: #edf2ef; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table__row:hover > td.el-table__cell) { background: #f7faf8 !important; }
:deep(.el-table__inner-wrapper::before) { display: none; }
@media (max-width: 700px) { .page-heading { align-items: flex-start; flex-direction: column; } .filter-bar { flex-direction: column; } .search-input, .status-select { width: 100%; } }
</style>