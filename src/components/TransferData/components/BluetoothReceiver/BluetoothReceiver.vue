<template>
  <div class="bluetooth-receiver">
    <div class="receiver-header">
      <h2>Отримання звіту</h2>
      <p v-if="isReceiving && !transferSuccess">Очікування підключення...</p>
      <p v-else-if="!transferSuccess">Натисніть кнопку, щоб почати отримання</p>
    </div>

    <div v-if="transferSuccess" class="success-status">
      <ion-icon :icon="checkmarkCircleOutline" size="large" color="success"></ion-icon>
      <p class="success-message">{{ successMessage }}</p>
      <ion-button expand="block" @click="completeTransfer" color="success">
        Готово
      </ion-button>
    </div>
    
    <div v-else-if="errorOccurred" class="error-status">
      <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
      <p class="error-message">{{ errorMessage }}</p>
      <ion-button expand="block" @click="resetError" color="medium">
        Спробувати знову
      </ion-button>
    </div>
    
    <div v-else>
      <div class="advertising-controls">
        <ion-button expand="block" @click="toggleAdvertising" :disabled="transferSuccess">
          {{ isReceiving ? 'Зупинити прийом' : 'Почати прийом' }}
        </ion-button>
      </div>

      <div class="receiver-status" v-if="isReceiving && !transferSuccess">
        <div class="status-info">
          <ion-spinner name="circles"></ion-spinner>
          <p>Пристрій видимий для передачі</p>
          <p class="instruction">Відкрийте відправку на іншому пристрої та підключіться до цього</p>
        </div>
      </div>

      <div class="receiver-footer">
        <ion-button expand="block" @click="goBack" color="medium" :disabled="transferSuccess">
          Назад
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onUnmounted } from 'vue';
import { useBluetoothTransfer } from '../../composables/useBluetoothTransfer';
import { IonSpinner, IonIcon, useIonRouter } from '@ionic/vue';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'BluetoothReceiver',
  components: {
    IonSpinner,
    IonIcon
  },
  emits: ['back', 'error', 'data-received', 'complete'],

  setup(props, { emit }) {
    const router = useIonRouter();
    const errorOccurred = ref(false);
    
    const { 
      isReceiving,
      errorMessage,
      successMessage,
      transferSuccess,
      initialize,
      startAdvertising,
      stopAdvertising,
      setupDataReceiver,
      cleanup,
      resetError: resetBleError
    } = useBluetoothTransfer();
    
    watch(errorMessage, (newValue) => {
      if (newValue) {
        errorOccurred.value = true;
      }
    });
    
    watch(transferSuccess, async (newValue) => {
      if (newValue && isReceiving.value) {
        console.log('Звіт успішно отримано, зупиняємо прийом');
        await stopAdvertising();
      }
    });
    
    const startReceiving = async () => {
      try {
        errorOccurred.value = false;
        transferSuccess.value = false;
        
        const initialized = await initialize();
        if (!initialized) {
          return;
        }
        
        await setupDataReceiver((receivedData) => {
          transferSuccess.value = true;
          successMessage.value = 'Звіт успішно отримано!';
          
          emit('data-received', receivedData);
        });
        
        const startedAdvertising = await startAdvertising();
        if (!startedAdvertising) {
          return;
        }
      } catch (err: any) {
        errorMessage.value = `Помилка при підготовці до отримання даних: ${err.message || 'Невідома помилка'}`;
        errorOccurred.value = true;
        emit('error', errorMessage.value);
      }
    };

    const toggleAdvertising = async () => {
      if (isReceiving.value) {
        await stopAdvertising();
      } else {
        await startReceiving();
      }
    };
    
    const resetError = () => {
      errorOccurred.value = false;
      errorMessage.value = '';
      resetBleError();
    };
    
    const completeTransfer = async () => {
      await cleanup();
      emit('complete');
    };

    const goBack = async () => {
      await stopAdvertising();
      emit('back');
    };
    
    onUnmounted(async () => {
      await cleanup();
    });

    return {
      isReceiving,
      errorMessage,
      successMessage,
      transferSuccess,
      errorOccurred,
      toggleAdvertising,
      resetError,
      completeTransfer,
      goBack,
      checkmarkCircleOutline,
      alertCircleOutline
    };
  }
});
</script>

<style scoped>
 @import "./BluetoothReceiver.scss";
</style>