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
          <ion-text class="item-text">{{ report.date }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">3. Позивний (ПІБ)</ion-label>
          <ion-text class="item-text">{{ report.nickname }}</ion-text>
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
          <ion-text class="item-text">{{ report.tq }}</ion-text>
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
          <ion-text class="item-text">{{ report.timePass }}</ion-text>
        </ion-item>

        <ion-item>
          <ion-label position="stacked" class="item-label">18. Ким евакуйований</ion-label>
          <ion-text class="item-text">{{ report.evacuatedBy }}</ion-text>
        </ion-item>

      </ion-list>
      <div class="buttons-block" slot="fixed">
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button
                  color="light"
                  shape="round"
                  style="width: 100%"
                  @click="toReportEdit(report.id)"
              >
                Редагувати
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
                  color="primary"
                  shape="round"
                  style="width: 100%"
                  @click="copy(report)"
              >
                Копіювати
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
        position-anchor="header"
        message="Дані скопійовано"
        :duration="2000"
        @didDismiss="setOpenAlert(false)"
    ></ion-toast>
  </ion-page>
</template>

<script lang="ts">
import Report from '@/components/Report/Report.vue';
import {defineComponent, onMounted, ref} from 'vue';
import { useRoute } from 'vue-router';
import {getByIdFromReports} from '@/compasables/useDatabase.js';
import {useIonRouter, IonToast} from "@ionic/vue";

export default defineComponent({
  components: { Report, IonToast },
  setup() {
    const report = ref<any>(null);
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

    const isOpenAlert = ref(false);
    const setOpenAlert = (state: boolean) => {
      isOpenAlert.value = state;
    };

    const formatValue = (value: any): string => {
      return value || '';
    };

    const copy = async (reportData: any) => {
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
13. TQ - ${formatValue(reportData.tq)}
14. Стан в динаміці - ${formatValue(reportData.state)}
15. В засобах індивідуального захисту - ${formatValue(reportData.additional)}
16. Втрачене майно - ${formatValue(reportData.lost)}
17. Час передачі на - ${formatValue(reportData.timePass)}
18. Ким евакуйований - ${formatValue(reportData.evacuatedBy)}
      `.trim();

      try {
        await navigator.clipboard.writeText(formattedText);
        setOpenAlert(true);
      } catch (err) {
        console.error('Не вдалося скопіювати дані', err);
        alert('Помилка при копіюванні даних');
      }
    };

    return {
      report,
      isOpenAlert,
      copy,
      toReportEdit,
      setOpenAlert
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./ReportPage.scss";
</style>