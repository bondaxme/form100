<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <StatisticsView />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StatisticsView from '@/components/StatisticsView/StatisticsView.vue';

export default defineComponent({
  components: {
    StatisticsView
  }
});
</script>

<style scoped lang="scss">
.statistics-page {
  padding: 16px;
}
</style>