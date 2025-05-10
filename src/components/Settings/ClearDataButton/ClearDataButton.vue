<template>
  <ion-button 
    expand="block" 
    color="danger" 
    @click="showConfirm"
    class="clear-data-button"
  >
    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
    Очистити всі дані додатку
  </ion-button>
  
  <ion-alert
    :is-open="isAlertOpen"
    header="Підтвердження"
    message="Ви впевнені, що хочете очистити всі дані додатку? Ця дія незворотня!"
    :buttons="alertButtons"
    @didDismiss="isAlertOpen = false"
  ></ion-alert>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { IonButton, IonIcon, IonAlert } from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';
import db from '@/compasables/database';

export default defineComponent({
  components: {
    IonButton,
    IonIcon,
    IonAlert
  },
  emits: ['show-toast'],
  setup(props, { emit }) {
    const isAlertOpen = ref(false);
    
    const alertButtons = [
      {
        text: 'Скасувати',
        role: 'cancel',
      },
      {
        text: 'Очистити',
        role: 'confirm',
        handler: () => {
          clearAllData();
        },
      },
    ];

    const showConfirm = () => {
      isAlertOpen.value = true;
    };

    const clearAllData = async () => {
      try {
        await db.reportsTable.clear();
        await db.staffTable.clear();
        await db.locationsTable.clear();
        await db.situationsTable.clear();
        await db.settingsTable.clear();
        
        emit('show-toast', 'Всі дані додатку успішно очищено', false);
      } catch (error) {
        console.error('Помилка очищення даних:', error);
        emit('show-toast', 'Помилка очищення даних', true);
      }
    };

    return {
      isAlertOpen,
      alertButtons,
      showConfirm,
      trashOutline
    };
  }
});
</script>

<style lang="scss" scoped>
@import './ClearDataButton.scss';
</style>