<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <ion-item lines="none">
        <NicknameSettings @show-toast="showToastMessage" />
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
import { ref } from 'vue';
import FileUploader from '@/components/Settings/FileUploader/FileUploader.vue';
import ViewDataButton from '@/components/ViewDataButton/ViewDataButton.vue';
import ClearDataButton from '@/components/Settings/ClearDataButton/ClearDataButton.vue';
import NicknameSettings from '@/components/Settings/NicknameSettings/NicknameSettings.vue';

export default {
  components: {
    FileUploader,
    ViewDataButton,
    ClearDataButton,
    NicknameSettings
  },
  setup() {
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('primary');

    const showToastMessage = async (message: string, isError = false) => {
      toastMessage.value = message;
      toastColor.value = isError ? 'danger' : 'primary';
      showToast.value = true;
    };

    return {
      showToast,
      toastMessage,
      toastColor,
      showToastMessage
    };
  }
};
</script>

<style scoped lang="scss">
@import "./Tab3Page.scss";
</style>