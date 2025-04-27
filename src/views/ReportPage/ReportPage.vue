<template>
  <ion-page style="margin-top: 56px">
    <ion-content v-if="report" class="ion-padding-end">
      <ion-list class="items-list">
        <ion-item>
          <ion-label position="stacked" class="item-label">1. Стан</ion-label>
          <ion-text class="item-text">{{ report.healthStatus }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">2. Дата та час події</ion-label>
          <ion-text class="item-text">{{ formatDate(report.date) }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">3. Позивний (ПІБ)</ion-label>
          <ion-text class="item-text">{{ report.nickname }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">4. Дата народження</ion-label>
          <ion-text class="item-text">{{ report.birthday }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">4. ПІБ</ion-label>
          <ion-text class="item-text">{{ report.name }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">5. Підрозділ</ion-label>
          <ion-text class="item-text">{{ report.unit }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">6. Звання, посада</ion-label>
          <ion-text class="item-text">{{ report.rank }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">7. Телефон</ion-label>
          <ion-text class="item-text">{{ report.phone }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">8. Місце події</ion-label>
          <ion-text class="item-text">{{ report.location }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">9. Обставини</ion-label>
          <ion-text class="item-text">{{ report.situation }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">10. Свідки</ion-label>
          <ion-text class="item-text">{{ report.witnesses }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">11. Попередній діагноз</ion-label>
          <ion-text class="item-text">{{ report.diagnosis }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">12. Надана допомога</ion-label>
          <ion-text class="item-text">{{ report.help }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">13. TQ</ion-label>
          <ion-text class="item-text">{{ formatTQ(report.tq) }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">14. Стан в динаміці</ion-label>
          <ion-text class="item-text">{{ report.state }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">15. В засобах індивідуального захисту</ion-label>
          <ion-text class="item-text">{{ report.additional }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">16. Втрачене майно</ion-label>
          <ion-text class="item-text">{{ report.lost }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">17. Час передачі на</ion-label>
          <ion-text class="item-text">{{ formatTimePass(report.timePass) }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">18. Ким евакуйований</ion-label>
          <ion-text class="item-text">{{ report.evacuatedBy }}</ion-text>
        </ion-item>

      </ion-list>
      <div class="buttons-block" slot="fixed">
        <ion-grid>
          <ion-row>
            <ion-col size="3">
              <ion-button
                  color="light"
                  shape="round"
                  style="width: 100%"
                  @click="toReportEdit(report.id)"
              >
                <ion-icon :icon="pencil"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col size="3">
              <ion-button
                  color="primary"
                  shape="round"
                  style="width: 100%"
                  @click="copyReport(report)"
              >
                <ion-icon :icon="copy"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col size="3">
              <ion-button
                  color="danger"
                  shape="round"
                  style="width: 100%"
                  @click="deleteReport(report.id)"
              >
                <ion-icon :icon="trash"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col size="3">
              <ion-button
                  color="success"
                  shape="round"
                  style="width: 100%"
                  @click="sendReport"
              >
                <ion-icon :icon="send"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
    <ion-toast
        :is-open="isOpenAlert"
        position="top"
        color="primary"
        :message="toastMessage"
        :duration="2000"
        @didDismiss="setOpenAlert(false)"
    ></ion-toast>
    <ion-alert
        :is-open="isAlertOpen"
        header="Підтвердження видалення"
        message="Ви впевнені, що хочете видалити цей звіт?"
        :buttons="[
          {
            text: 'Скасувати',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Видалити',
            role: 'confirm',
            cssClass: 'danger',
          },
        ]"
        @didDismiss="handleAlertDismiss"
    ></ion-alert>
  </ion-page>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import { useRoute } from 'vue-router';
import {getByIdFromReports, deleteFromReports} from '@/compasables/useDatabase.js';
import {useIonRouter, IonAlert} from "@ionic/vue";
import { pencil, copy, trash, send } from 'ionicons/icons';

export default defineComponent({
  components: {
    IonAlert 
  },
  setup() {
    const report = ref<any>(null);
    const isOpenAlert = ref(false);
    const isAlertOpen = ref(false);
    const toastMessage = ref('');
    const reportToDelete = ref<number | null>(null);
    
    const fetchData = async (id: number) => {
      report.value = await getByIdFromReports(id);
    };

    onMounted(() => {
      const route = useRoute();
      const reportId = +route.params.id;
      fetchData(reportId);
    });

    const ionRouter = useIonRouter();
    const toReportEdit = (id: number | string) => {
      ionRouter.push(`/tabs/report/${id}/edit`);
    };

    const setOpenAlert = (state: boolean) => {
      isOpenAlert.value = state;
    };

    const formatDate = (date: string): string => {
      const dateObj = new Date(date);
      return dateObj.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatValue = (value: any): string => {
      return value || '';
    };

    const formatTQ = (tq: any): string => {
      if (!tq) return '';
      
      const parts = [];
      if (tq.leftArm) parts.push(`ЛР: ${tq.leftArm}`);
      if (tq.rightArm) parts.push(`ПР: ${tq.rightArm}`);
      if (tq.leftLeg) parts.push(`ЛН: ${tq.leftLeg}`);
      if (tq.rightLeg) parts.push(`ПН: ${tq.rightLeg}`);
      
      return parts.join(', ');
    };
    const formatTimePass = (timePass: any): string => {
      if (!timePass) return '';
      
      const parts = [];
      if (timePass.place) parts.push(`${timePass.place}`);
      if (timePass.time) parts.push(`${formatDate(timePass.time)}`);
      
      return parts.join(' ');
    };

    const copyReport = async (reportData: any) => {
      const formattedText = `
1. Стан - ${formatValue(reportData.healthStatus)}
2. Дата та час події - ${formatValue(reportData.date)}
3. Позивний (ПІБ) - ${formatValue(reportData.nickname)}
4. ПІБ - ${formatValue(reportData.name)}
5. Підрозділ - ${formatValue(reportData.unit)}
6. Звання, посада - ${formatValue(reportData.rank)}
7. Телефон - ${formatValue(reportData.phone)}
8. Місце події - ${formatValue(reportData.location)}
9. Обставини - ${formatValue(reportData.situation)}
10. Свідки - ${formatValue(reportData.witnesses)}
11. Попередній діагноз - ${formatValue(reportData.diagnosis)}
12. Надана допомога - ${formatValue(reportData.help)}
13. TQ - ${formatTQ(reportData.tq)}
14. Стан в динаміці - ${formatValue(reportData.state)}
15. В засобах індивідуального захисту - ${formatValue(reportData.additional)}
16. Втрачене майно - ${formatValue(reportData.lost)}
17. Час передачі на - ${formatTimePass(reportData.timePass)}
18. Ким евакуйований - ${formatValue(reportData.evacuatedBy)}
      `.trim();

      try {
        await navigator.clipboard.writeText(formattedText);
        toastMessage.value = 'Дані скопійовано';
        setOpenAlert(true);
      } catch (err) {
        toastMessage.value = 'Помилка при копіюванні даних';
        setOpenAlert(true);
      }
    };

    const deleteReport = async (id: number) => {
      reportToDelete.value = id;
      isAlertOpen.value = true;
    };

    const handleAlertDismiss = async (ev: CustomEvent) => {
      if (ev.detail.role === 'confirm' && reportToDelete.value) {
        try {
          await deleteFromReports(reportToDelete.value);
          window.location.href = '/tabs/tab1';
        } catch (err) {
          toastMessage.value = 'Помилка при видаленні звіту';
          setOpenAlert(true);
        }
      } 
      reportToDelete.value = null;
      isAlertOpen.value = false;
    };

    const sendReport = () => {
      toastMessage.value = 'Функція відправки буде доступна незабаром';
      setOpenAlert(true);
    };

    return {
      report,
      isOpenAlert,
      isAlertOpen,
      toastMessage,
      copyReport,
      toReportEdit,
      deleteReport,
      sendReport,
      setOpenAlert,
      handleAlertDismiss,
      formatTQ,
      formatTimePass,
      formatDate,
      pencil,
      copy,
      trash,
      send
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./ReportPage.scss";
</style>