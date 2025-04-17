<template>
  <div class="buttons-block" slot="fixed">
    <ion-button
      expand="block"
      color="primary"
      shape="round"
      style="width: 100%"
      @click="toStaffPage"
    >
      Переглянути дані
    </ion-button>
  </div>
</template>

<script lang="ts">
import { useIonRouter } from '@ionic/vue';

export default {
  setup() {
    const ionRouter = useIonRouter();
    const toStaffPage = () => {
      ionRouter.push(`/tabs/staff`);
    };

    return {
      toStaffPage
    };
  }
};
</script>

<style scoped lang="scss">
  @import "@/components/ViewDataButton/ViewDataButton.scss";
</style>
