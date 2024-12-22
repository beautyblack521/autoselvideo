<template>
  <div class="admin-layout">
    <AppNavigation />
    <v-main>
      <router-view></router-view>
    </v-main>
  </div>
</template>

<script setup>
import AppNavigation from '@/components/AppNavigation.vue'
</script> 