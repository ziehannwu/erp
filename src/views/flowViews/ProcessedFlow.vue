<template>
    <section class="flow-page">
        <header class="page-heading">
            <div><p class="eyebrow">WORKFLOW / HISTORY</p><h1>已处理流程</h1></div>
            <span class="selection-count">共 {{ filteredOpinions.length }} 条处理记录</span>
        </header>

        <div class="filter-bar">
            <el-input v-model="searchText" clearable placeholder="搜索流程标题或处理意见" class="search-input" />
            <el-select v-model="actionFilter" clearable placeholder="处理类型" class="status-select">
                <el-option label="批准" value="批准" />
                <el-option label="退回" value="退回" />
                <el-option label="流程转移" value="流程转移" />
            </el-select>
        </div>

        <div class="table-wrap">
            <el-table :data="filteredOpinions" row-key="key" style="width: 100%" @row-click="openDetail">
                <el-table-column prop="title" label="流程标题" min-width="220" />
                <el-table-column label="处理人" min-width="130"><template #default="{ row }">{{ row.leaderName }}</template></el-table-column>
                <el-table-column label="部门 / 岗位" min-width="180"><template #default="{ row }">{{ row.department }} / {{ row.position }}</template></el-table-column>
                <el-table-column prop="remark" label="处理意见" min-width="240" show-overflow-tooltip />
                <el-table-column prop="recipient" label="接受人" min-width="130" />
                <el-table-column prop="time" label="处理时间" min-width="170" />
                <el-table-column label="类型" width="120">
                    <template #default="{ row }"><el-tag :type="tagType(row.action)" effect="plain">{{ row.action }}</el-tag></template>
                </el-table-column>
                <template #empty><el-empty description="暂无已处理流程" /></template>
            </el-table>
            <footer class="table-footer">展示已有流程的审批、退回和转移意见</footer>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pendingFlowList } from '@/stores/fack'

type OpinionRow = {
    key: string
    flowId: number
    title: string
    leaderName: string
    department: string
    position: string
    remark: string
    recipient: string
    time: string
    action: string
}

const router = useRouter()
const searchText = ref('')
const actionFilter = ref('')
const opinionRows = computed<OpinionRow[]>(() => pendingFlowList.flatMap((flow) =>
    (flow.approvalOpinions ?? []).map((opinion, index) => ({ ...opinion, key: `${flow.id}-${opinion.time}-${index}`, flowId: flow.id, title: flow.title })),
).sort((a, b) => b.time.localeCompare(a.time)))
const filteredOpinions = computed(() => opinionRows.value.filter((opinion) => {
    const matchesText = !searchText.value || opinion.title.includes(searchText.value) || opinion.remark.includes(searchText.value)
    const matchesAction = !actionFilter.value || opinion.action.includes(actionFilter.value)
    return matchesText && matchesAction
}))
const tagType = (action: string) => action.includes('批准') ? 'success' : action.includes('退回') ? 'warning' : 'info'
const openDetail = (row: OpinionRow) => window.open(router.resolve({ name: 'flowDetail', params: { id: row.flowId } }).href, '_blank', 'noopener,noreferrer')
</script>

<style scoped>
.flow-page { min-width: 0; color: #253238; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 2px 0 18px; margin-bottom: 18px; border-bottom: 1px solid #dfe8e4; }
.eyebrow { margin: 0 0 7px; color: #16836f; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
h1 { margin: 0; color: #173b3b; font-size: 24px; font-weight: 700; line-height: 1.25; }
.selection-count { color: #73817f; font-size: 13px; white-space: nowrap; }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { width: min(340px, 100%); }
.status-select { width: 160px; }
.table-wrap { overflow: hidden; border: 1px solid #dfe8e4; border-radius: 6px; background: #fff; box-shadow: 0 2px 7px rgb(30 65 54 / 3%); }
.table-footer { padding: 11px 16px; border-top: 1px solid #e8efec; color: #7b8986; font-size: 12px; }
:deep(.el-table th.el-table__cell) { height: 46px; background: #f2f7f4; color: #536761; font-size: 12px; font-weight: 650; }
:deep(.el-table td.el-table__cell) { height: 58px; border-bottom-color: #edf2ef; }
:deep(.el-table__row) { cursor: pointer; }
:deep(.el-table__row:hover > td.el-table__cell) { background: #f7faf8 !important; }
:deep(.el-table__inner-wrapper::before) { display: none; }
@media (max-width: 700px) { .page-heading { align-items: flex-start; flex-direction: column; } .filter-bar { flex-direction: column; } .search-input, .status-select { width: 100%; } }
</style>