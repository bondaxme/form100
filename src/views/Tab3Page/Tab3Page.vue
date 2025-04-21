<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <ion-item style="margin-top: 50px" lines="none">
        <FileUploader @show-toast="showToastMessage" />
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
import FileUploader from '@/components/FileUploader/FileUploader.vue';
import ViewDataButton from '@/components/ViewDataButton/ViewDataButton.vue';

export default {
  components: {
    FileUploader,
    ViewDataButton
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