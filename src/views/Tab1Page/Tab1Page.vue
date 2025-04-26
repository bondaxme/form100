<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <ion-content>
        <ion-list class="widgets">
          <dashboard-widget title="300" :total="count300" :currentDay="countToday300" :isActive="activeFilter === '300'"
            @toggleFilter="toggleFilter" :style="{ borderColor: 'var(--accent-color)' }" />
          <dashboard-widget title="200" :total="count200" :currentDay="countToday200" :isActive="activeFilter === '200'"
            @toggleFilter="toggleFilter" :style="{ borderColor: 'var(--danger-color)' }" />
          <dashboard-widget title="Хвороба" :total="countIllness" :currentDay="countTodayIllness" :isActive="activeFilter === 'Хвороба'"
            @toggleFilter="toggleFilter" :style="{ borderColor: 'var(--disease-color)' }" />
        </ion-list>

        <div class="search-container">
          <ion-searchbar class="search-bar" v-model="searchQuery" :animated="true" :debounce="500"
            placeholder="Пошук за ПІБ або позивним" />
        </div>

        <ion-list>
          <report-card v-for="report in filteredReports" :report="report" :key="report.id" />
        </ion-list>
      </ion-content>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { getAllFromReports, countHealthStatus, countTodayReports } from '@/compasables/useDatabase.js';
import ReportCard from "@/components/ReportCard/ReportCard.vue";
import DashboardWidget from "@/components/DashboardWidget/DashboardWidget.vue";
import { IonSearchbar } from '@ionic/vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    ReportCard,
    DashboardWidget,
    IonSearchbar
  },

  setup() {
    const reportList = ref<any>(null);
    const count300 = ref<number>(0);
    const count200 = ref<number>(0);
    const countIllness = ref<number>(0);
    const countToday300 = ref<number>(0);
    const countToday200 = ref<number>(0);
    const countTodayIllness = ref<number>(0);
    const activeFilter = ref<string | null>(null);
    const searchQuery = ref<any>('');
    const route = useRoute();

    const getData = async () => {
      reportList.value = await getAllFromReports();
      count300.value = await countHealthStatus('300');
      count200.value = await countHealthStatus('200');
      countIllness.value = await countHealthStatus('Хвороба');
      countToday300.value = await countTodayReports('300');
      countToday200.value = await countTodayReports('200');
      countTodayIllness.value = await countTodayReports('Хвороба');
    };

    const toggleFilter = (status: string) => {
      if (activeFilter.value === status) {
        activeFilter.value = null;
      } else {
        activeFilter.value = status;
      }
    };

    const filteredReports = computed(() => {
      let reports = reportList.value;

      if (activeFilter.value) {
        reports = reports.filter((report: any) => report.healthStatus === activeFilter.value);
      }

      if (searchQuery.value) {
        const searchLower = searchQuery.value.toLowerCase().trim();
        reports = reports.filter((report: any) => {
          const fullName = report.name?.toLowerCase().trim() || '';
          const callSign = report.nickname?.toLowerCase().trim() || '';
          return fullName.startsWith(searchLower) || callSign.startsWith(searchLower);
        });
      }

      return reports;
    });

    watch(() => route.fullPath, (newValue) => {
      if (newValue === '/tabs/tab1') {
        getData();
      }
    }, { immediate: true });

    return {
      reportList,
      count300,
      count200,
      countIllness,
      countToday300,
      countToday200,
      countTodayIllness,
      toggleFilter,
      activeFilter,
      filteredReports,
      searchQuery
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./Tab1Page.scss";
</style>