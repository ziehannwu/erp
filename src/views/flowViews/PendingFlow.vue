<template>
    <section class="pending-page">
        <header class="page-heading">
            <div>
                <p class="eyebrow">WORKFLOW / INBOX</p>
                <h1>待办流程</h1>
            </div>
            <div class="toolbar">
                <span class="selection-count">已选 {{ selectedIds.length }} 项</span>
                <el-button plain @click="markAllRead">全部已读</el-button>
                <el-button type="primary" :disabled="selectedIds.length === 0" @click="followSelected">
                    关注流程
                </el-button>
            </div>
        </header>

        <div class="table-wrap">
            <el-table
                :data="pendingFlowList"
                row-key="id"
                style="width: 100%"
                highlight-current-row
                @selection-change="handleSelectionChange"
                @row-click="openDetail"
            >
                <el-table-column type="selection" width="52" @click.stop />
                <el-table-column prop="title" label="流程标题" min-width="240">
                    <template #default="{ row }">
                        <button class="title-button" type="button" @click.stop="openDetail(row)">
                            <span class="read-indicator" :class="{ unread: !row.isRead }" />
                            {{ row.title }}
                        </button>
                    </template>
                </el-table-column>
                <el-table-column label="创建人" min-width="130">
                    <template #default="{ row }">{{ getCreatorName(row.creatorId) }}</template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" min-width="170" />
                <el-table-column prop="expectedCompletionAt" label="期望完成时间" min-width="150" />
                <el-table-column label="未操作者" min-width="180">
                    <template #default="{ row }">
                        <div class="operator-list">
                            <el-tag v-for="operator in row.pendingOperators" :key="operator" effect="plain" size="small">
                                {{ operator }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <template #empty>
                    <el-empty description="暂无待办流程" />
                </template>
            </el-table>
            <footer class="table-footer">
                <span>共 {{ pendingFlowList.length }} 条流程</span>
                <span>未读 {{ unreadCount }} 条</span>
            </footer>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pendingFlowList, staffList, type FlowItem } from '@/stores/fack'

const router = useRouter()
const selectedIds = ref<number[]>([])
const unreadCount = computed(() => pendingFlowList.filter((flow) => !flow.isRead).length)

const getCreatorName = (creatorId: number) => staffList.find((staff) => staff.id === creatorId)?.name ?? '未知成员'

const handleSelectionChange = (selection: FlowItem[]) => {
    selectedIds.value = selection.map((flow) => flow.id)
}

const openDetail = (row: FlowItem, _column?: unknown, event?: Event) => {
    if (event?.target instanceof Element && event.target.closest('.el-checkbox')) return
    const detailUrl = router.resolve({ name: 'flowDetail', params: { id: row.id } }).href
    window.open(detailUrl, '_blank', 'noopener,noreferrer')
}

const markAllRead = () => {
    pendingFlowList.forEach((flow) => {
        flow.isRead = true
    })
    ElMessage.success('所有待办流程已标记为已读')
}

const followSelected = () => {
    pendingFlowList.forEach((flow) => {
        if (selectedIds.value.includes(flow.id)) flow.isFollowed = true
    })
    ElMessage.success(`已关注 ${selectedIds.value.length} 条流程`)
}
</script>

<style scoped>
.pending-page {
    min-width: 0;
    color: #253238;
}

.page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 2px 0 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid #dfe8e4;
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
    font-weight: 700;
    line-height: 1.25;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toolbar :deep(.el-button) {
    min-height: 36px;
    padding: 0 15px;
    border-radius: 5px;
}

.selection-count {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    margin-right: 4px;
    border: 1px solid #dce8e3;
    border-radius: 5px;
    background: #f4f8f6;
    color: #657873;
    font-size: 13px;
    white-space: nowrap;
}

.table-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #dfe8e4;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 7px rgb(30 65 54 / 3%);
}

.title-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #263a3b;
    font: inherit;
    font-weight: 550;
    text-align: left;
    cursor: pointer;
    transition: color 140ms ease;
}

.title-button:hover {
    color: #14836f;
}

.read-indicator {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 50%;
    background: transparent;
}

.read-indicator.unread {
    background: #e07848;
    box-shadow: 0 0 0 3px rgb(224 120 72 / 12%);
}

.operator-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.table-footer {
    display: flex;
    justify-content: space-between;
    padding: 11px 16px;
    border-top: 1px solid #e8efec;
    color: #7b8986;
    font-size: 12px;
}

:deep(.el-table th.el-table__cell) {
    height: 46px;
    background: #f2f7f4;
    color: #536761;
    font-size: 12px;
    font-weight: 650;
}

:deep(.el-table td.el-table__cell) {
    height: 60px;
    border-bottom-color: #edf2ef;
}

:deep(.el-table__row) {
    cursor: pointer;
}

:deep(.el-table__row:hover > td.el-table__cell) {
    background: #f7faf8 !important;
}

:deep(.el-table__inner-wrapper::before) {
    display: none;
}

@media (max-width: 760px) {
    .page-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 16px;
        padding-bottom: 15px;
    }

    .toolbar {
        width: 100%;
        flex-wrap: wrap;
    }

    .selection-count {
        min-height: 30px;
        margin-right: auto;
    }
}
</style>