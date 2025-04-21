<template>
  <ion-page>
    <ion-header id="header">
      <ion-toolbar style="height: 56px">
        <div
            v-if="title !== 'Список звітів'"
            class="back"
            @click="goBack"
        >
          Назад
        </div>
        <ion-title style="height: 56px; font-size: 18px">{{ title }}</ion-title>
        <ion-icon aria-hidden="true" :icon="medicalOutline" class="logo" @click="onGoTo('/tabs/tab3')"/>
      </ion-toolbar>
    </ion-header>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" @click="onGoTo('/tabs/tab1')" :class="{ active: isActive('tab1') }">
          <ion-icon aria-hidden="true" :icon="listOutline" />
          <ion-label>Репорти</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" @click="onGoTo('/tabs/tab2')" :class="{ active: isActive('tab2') }">
          <ion-icon aria-hidden="true" :icon="createOutline" />
          <ion-label>Новий</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" @click="onGoTo('/tabs/tab3')" :class="{ active: isActive('tab3') }">
          <ion-icon aria-hidden="true" :icon="settingsOutline" />
          <ion-label>Налаштування</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, useIonRouter } from '@ionic/vue';
import { createOutline, settingsOutline, listOutline, medicalOutline } from 'ionicons/icons';
export default defineComponent({
  components: { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet },
  setup() {
    const ionRouter = useIonRouter();
    const onGoTo = (link: string) => {
      ionRouter.push(link);
    }
    const goBack = () => {
      ionRouter.back();
    }

    const title = ref('Список звітів');
    const route = useRoute();
    
    const isActive = (tab: string) => {
      return route.path.includes(`/tabs/${tab}`);
    };

    watch(() => route.path, (newPath) => {
      if (newPath.includes('/tabs/tab1')) {
        title.value = 'Список звітів';
      } else if (newPath.includes('/tabs/tab2')) {
        title.value = 'Новий звіт';
      } else if (newPath.includes('/tabs/tab3')) {
        title.value = 'Налаштування';
      } else if (newPath.includes('/tabs/report')) {
        title.value = 'Деталі звіту';
      } else if (newPath.includes('/tabs/staff')) {
        title.value = 'Картка бійця';
      }
    });
    return {
      onGoTo,
      goBack,
      title,
      isActive,
      createOutline,
      settingsOutline,
      listOutline,
      medicalOutline
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./TabsPage.scss";
</style>