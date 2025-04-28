<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <ion-item lines="none">
        <NicknameSettings @show-toast="showToastMessage" />
      </ion-item>
      <ion-item lines="none">
        <ion-button 
          expand="block" 
          color="primary" 
          @click="goToStatistics" 
          class="statistics-button"
        >
          <ion-icon :icon="barChartOutline" slot="start"></ion-icon>
          Переглянути статистику
        </ion-button>
      </ion-item>
      
      <ion-item lines="none">
        <FileUploader @show-toast="showToastMessage" />
      </ion-item>
      <ion-item lines="none">
        <ClearDataButton @show-toast="showToastMessage" />
      </ion-item>
      <ViewDataButton />
    </ion-content>
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      position="top"
      :color="toastColor"
      @didDismiss="showToast = false"
    ></ion-toast>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useIonRouter } from '@ionic/vue';
import { barChartOutline } from 'ionicons/icons';
import FileUploader from '@/components/Settings/FileUploader/FileUploader.vue';
import ViewDataButton from '@/components/ViewDataButton/ViewDataButton.vue';
import ClearDataButton from '@/components/Settings/ClearDataButton/ClearDataButton.vue';
import NicknameSettings from '@/components/Settings/NicknameSettings/NicknameSettings.vue';

export default defineComponent({
  components: {
    FileUploader,
    ViewDataButton,
    ClearDataButton,
    NicknameSettings
  },
  setup() {
    const ionRouter = useIonRouter();
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('primary');

    const showToastMessage = async (message: string, isError = false) => {
      toastMessage.value = message;
      toastColor.value = isError ? 'danger' : 'primary';
      showToast.value = true;
    };
    
    const goToStatistics = () => {
      ionRouter.push('/tabs/statistics');
    };

    return {
      showToast,
      toastMessage,
      toastColor,
      showToastMessage,
      goToStatistics,
      barChartOutline
    };
  }
});
</script>

<style scoped lang="scss">
@import "./Tab3Page.scss";
</style>