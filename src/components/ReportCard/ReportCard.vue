<template>
  <ion-card
      class="card"
      @click="toReportView(report.id)"
      :style="borderColor"
  >
    <ion-card-header>
      <div class="card-header">
        <ion-card-title>{{ report.nickname }}</ion-card-title>
        <ion-card-subtitle>{{ report.name }}</ion-card-subtitle>
      </div>
      <ion-card-subtitle>{{ createdAtDisplay }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      {{ report.description }}
    </ion-card-content>

                 <!-- <ion-button fill="clear" @click="toReportView(report.id)">Переглянути</ion-button>-->
    <!--      <ion-button color="primary" style="margin-left: 20px">Редагувати</ion-button> -->
  </ion-card>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useIonRouter } from '@ionic/vue';
export default defineComponent({
  props: {
    report: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const ionRouter = useIonRouter();
    const toReportView = (id) => {
      ionRouter.push(`/tabs/report/${id}`);
    };

    const borderColor = computed(() => {
      let color;
      if (props.report.healthStatus === '200') {
        color = 'var(--danger-color)';
      } else if (props.report.healthStatus === '300') {
        color = 'var(--accent-color)';
      } else if (props.report.healthStatus === 'Хвороба') {
        color = 'var(--disease-color)';
      }
      return { borderLeft: `3px solid ${color}` };
    });

    const createdAtDisplay = computed(() => {
      if (!props.report.createdAt) return '';
      const date = new Date(props.report.createdAt);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleString('uk-UA', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    return {
      toReportView,
      borderColor,
      createdAtDisplay
    };
  },
});
</script>

<style scoped lang="scss">
  @import "@/components/ReportCard/ReportCard.scss";
</style>
