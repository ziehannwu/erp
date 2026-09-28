<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <AppHeader />
      </el-header>

      <el-container>
        <el-aside width="180px">
          <MenuView />
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import MenuView from './views/MenuView.vue'
import AppHeader from './components/AppHeader.vue'
</script>

<style scoped>
.common-layout {
  min-height: 100vh;
  background: #f4f7fb;
}

.el-header {
  padding: 0;
  height: auto;
}
</style>
