<template>
  <div class="page-card">
    <div class="search-panel">
      <div class="search-item">
        <label>名字: </label>
        <el-input v-model="searchName" placeholder="请输入名字" clearable />
      </div>
      <div class="search-item">
        <label>工号: </label>
        <el-input v-model="searchEmployeeNo" placeholder="请输入工号" clearable />
      </div>
      <div class="search-item">
        <label>状态: </label>
        <el-select v-model="searchStatus" placeholder="请选择状态" clearable>
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
        </el-select>
      </div>
      <div class="search-panel-actions">
        <el-button type="primary">新增人员</el-button>
      </div>
    </div>

    <el-table :data="paginatedStaffList" stripe border fit style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column label="序号" width="110">
        <template #default="scope">
          <div class="selection-index-cell">
            <el-checkbox
              :model-value="selectedIds.includes(scope.row.id)"
              @update:model-value="(value: unknown) => toggleSelection(scope.row, Boolean(value))"
            />
            <span>{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字" min-width="120" />
      <el-table-column prop="gender" label="性别" width="100" />
      <el-table-column prop="employeeNo" label="工号" min-width="120" />
      <el-table-column prop="department" label="所属部门" min-width="140" />
      <el-table-column prop="accountStatus" label="账户状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.accountStatus === '启用' ? 'success' : 'warning'">
            {{ scope.row.accountStatus || 'null' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="scope">
          <div class="action-group">
            <el-button size="small" type="primary" link @click="handleDetail(scope.row)">详情</el-button>
            <el-button size="small" type="warning" link @click="handleEdit(scope.row)">修改</el-button>
            <el-button size="small" type="danger" link @click="handleDisable(scope.row)">禁用</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="detailDialogVisible" title="人员详情" width="900px" destroy-on-close>
      <div v-if="selectedStaff" class="detail-dialog-body">
        <div class="detail-header">
          <el-avatar :size="72" :src="selectedStaff.photo || undefined" :icon="selectedStaff.photo ? undefined : 'UserFilled'" />
          <div class="detail-header-text">
            <h3>{{ selectedStaff.name || 'null' }}</h3>
            <span>{{ selectedStaff.position || 'null' }}</span>
          </div>
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="名字">{{ selectedStaff.name ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="照片">{{ selectedStaff.photo ? '已上传' : 'null' }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ selectedStaff.employeeNo ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ selectedStaff.age ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedStaff.gender ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="入职时间">{{ selectedStaff.entryDate ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="身份证">{{ selectedStaff.idCard ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="离职时间">{{ selectedStaff.leaveDate ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="账户状态">{{ selectedStaff.accountStatus ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ selectedStaff.department ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="职务">{{ selectedStaff.position ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="上级">{{ selectedStaff.leader ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selectedStaff.phone ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedStaff.email ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ selectedStaff.job ?? 'null' }}</el-descriptions-item>
          <el-descriptions-item label="岗位状态">{{ selectedStaff.jobStatus ?? 'null' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <div class="pagination-bar">
      <div class="page-size-wrap">
        <span>每页</span>
        <el-select v-model="pageSize" size="small" style="width: 60px">
          <el-option v-for="option in pageSizeOptions" :key="option" :label="String(option)" :value="option" />
        </el-select>
        <span>条</span>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredStaffList.length"
        :page-sizes="pageSizeOptions"
        layout="prev, pager, next, jumper, ->, total"
        background
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { staffList as fakeStaffList, type StaffItem } from '@/stores/fack'

const selectedIds = ref<number[]>([])
const searchName = ref('')
const searchEmployeeNo = ref('')
const searchStatus = ref<'启用' | '停用' | ''>('启用')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 15, 20, 50, 100]
const detailDialogVisible = ref(false)
const selectedStaff = ref<StaffItem | null>(null)

const staffList = fakeStaffList

const filteredStaffList = computed(() => {
  return staffList.filter((item) => {
    const matchesName = !searchName.value || item.name.includes(searchName.value)
    const matchesEmployeeNo = !searchEmployeeNo.value || item.employeeNo?.includes(searchEmployeeNo.value)
    const matchesStatus = !searchStatus.value || item.accountStatus === searchStatus.value

    return matchesName && matchesEmployeeNo && matchesStatus
  })
})

const paginatedStaffList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStaffList.value.slice(start, start + pageSize.value)
})

watch(
  filteredStaffList,
  () => {
    currentPage.value = 1
  },
  { flush: 'sync' }
)

const toggleSelection = (row: StaffItem, checked: boolean) => {
  if (checked) {
    if (!selectedIds.value.includes(row.id)) {
      selectedIds.value = [...selectedIds.value, row.id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
  }

  ElMessage.info(`已选择 ${selectedIds.value.length} 名员工`)
}

const handleSelectionChange = (selection: StaffItem[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const handleDetail = (row: StaffItem) => {
  selectedStaff.value = row
  detailDialogVisible.value = true
}

const handleEdit = (row: StaffItem) => {
  ElMessage.info(`修改 ${row.name} 的资料`)
}

const handleDisable = (row: StaffItem) => {
  ElMessage.warning(`${row.name} 已被禁用`)
}
</script>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-panel {
  display: flex;
  align-items: end;
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.search-panel-actions {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
}

.search-item label {
  min-width: 42px;
  font-size: 14px;
  color: #606266;
  text-align: right;
}

.search-item .el-input,
.search-item .el-select {
  flex: 1;
}


.selection-index-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
}

.page-size-wrap {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
  font-size: 14px;
}

.pagination-bar .el-pagination {
  /* margin-left: auto; */
}

.detail-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.detail-header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-header-text h3 {
  margin: 0;
  font-size: 22px;
}

.detail-header-text span {
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.action-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
