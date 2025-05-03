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
        
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="openTransferModal" color="primary">
            <ion-icon :icon="downloadOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    </ion-content>
    
    <transfer-modal 
      :is-open="isTransferModalOpen" 
      mode="receive" 
      @close="closeTransferModal" 
      @report-received="handleReportReceived" 
    />
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { getAllFromReports, countHealthStatus, countTodayReports, postToReports } from '@/compasables/useDatabase.js';
import ReportCard from "@/components/ReportCard/ReportCard.vue";
import DashboardWidget from "@/components/DashboardWidget/DashboardWidget.vue";
import TransferModal from "@/components/TransferData/TransferModal/TransferModal.vue";
import { IonSearchbar, IonFab, IonFabButton, toastController } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { downloadOutline } from 'ionicons/icons';

export default defineComponent({
  components: {
    ReportCard,
    DashboardWidget,
    IonSearchbar,
    TransferModal,
    IonFab,
    IonFabButton
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
    const isTransferModalOpen = ref(false);

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

    const openTransferModal = () => {
      isTransferModalOpen.value = true;
    };

    const closeTransferModal = () => {
      isTransferModalOpen.value = false;
    };

    const handleReportReceived = async (receivedReport: any) => {
      try {
        await postToReports(receivedReport);
        getData();
      } catch (error) {
        console.error('Error adding received report:', error);
        const toast = await toastController.create({
          message: 'Помилка при додаванні звіту',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    };

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
      searchQuery,
      isTransferModalOpen,
      openTransferModal,
      closeTransferModal,
      handleReportReceived,
      downloadOutline
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./Tab1Page.scss";

ion-fab {
  margin-bottom: 16px;
  margin-right: 16px;
}
</style>