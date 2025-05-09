<template>
  <div class="bluetooth-sender">
    <div v-if="!selectedDevice">
      <bluetooth-scanner
        @back="goBack"
        @error="handleError"
        @device-connected="onDeviceConnected"
      />
    </div>
    
    <div v-else class="sender-container">
      <div class="sender-header">
        <h2>Відправлення звіту</h2>
        <p>Пристрій: {{ selectedDevice.name || 'Невідомий пристрій' }}</p>
      </div>
      
      <div class="transfer-status">
        <div v-if="isSending" class="sending-status">
          <ion-spinner name="circles"></ion-spinner>
          <p>Відправлення даних...</p>
          <ion-progress-bar :value="transferProgress / 100"></ion-progress-bar>
          <p>{{ transferProgress }}%</p>
        </div>
        
        <div v-else-if="transferSuccess" class="success-status">
          <ion-icon :icon="checkmarkCircleOutline" size="large" color="success"></ion-icon>
          <p class="success-message">{{ successMessage }}</p>
          <ion-button expand="block" @click="completeTransfer" color="success">
            Готово
          </ion-button>
        </div>
        
        <div v-else-if="errorOccurred" class="error-status">
          <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
          <p class="error-message">{{ errorMessage }}</p>
          <ion-button expand="block" @click="resetTransfer" color="medium">
            Спробувати знову
          </ion-button>
        </div>
        
        <div v-else class="ready-status">
          <p>Пристрій готовий до передачі даних</p>
          <ion-button expand="block" @click="sendReport" color="primary">
            Відправити звіт
          </ion-button>
        </div>
      </div>
      
      <div class="sender-footer">
        <ion-button expand="block" @click="disconnectDevice" color="medium" v-if="!transferSuccess">
          Відключитись
        </ion-button>
        <ion-button expand="block" @click="goBack" color="medium" v-if="!transferSuccess">
          Назад
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref, watch } from 'vue';
import { useBluetoothTransfer } from '../../composables/useBluetoothTransfer';
import BluetoothScanner from '../BluetoothScanner/BluetoothScanner.vue';
import { IonProgressBar, IonIcon, useIonRouter } from '@ionic/vue';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'BluetoothSender',
  components: {
    BluetoothScanner,
    IonProgressBar,
    IonIcon
  },
  props: {
    reportData: {
      type: Object,
      required: true
    }
  },
  emits: ['back', 'error', 'success', 'complete'],
  
  setup(props, { emit }) {
    const router = useIonRouter();
    const errorOccurred = ref(false);
    
    const { 
      selectedDevice,
      isSending,
      transferProgress,
      errorMessage,
      successMessage,
      transferSuccess,
      sendData,
      disconnectFromDevice,
      cleanup
    } = useBluetoothTransfer();
    
    // Watch for error messages
    watch(errorMessage, (newValue) => {
      if (newValue) {
        errorOccurred.value = true;
      }
    });
    
    const onDeviceConnected = () => {
    };
    
    const sendReport = async () => {
      errorOccurred.value = false;
      const result = await sendData(props.reportData);
      if (result) {
        emit('success', successMessage.value);
      } else {
        emit('error', errorMessage.value);
      }
    };
    
    const resetTransfer = () => {
      errorOccurred.value = false;
      errorMessage.value = '';
    };
    
    const completeTransfer = async () => {
      await cleanup();
      emit('complete');
    };
    
    const disconnectDevice = async () => {
      await disconnectFromDevice();
    };
    
    const handleError = (error: string) => {
      errorOccurred.value = true;
      emit('error', error);
    };
    
    const goBack = async () => {
      await disconnectFromDevice();
      emit('back');
    };
    
    onUnmounted(async () => {
      await cleanup();
    });
    
    return {
      selectedDevice,
      isSending,
      transferProgress,
      sendReport,
      disconnectDevice,
      handleError,
      onDeviceConnected,
      goBack,
      checkmarkCircleOutline,
      alertCircleOutline,
      successMessage,
      errorMessage,
      transferSuccess,
      errorOccurred,
      resetTransfer,
      completeTransfer
    };
  }
});
</script>

<style scoped>
 @import "./BluetoothSender.scss";
</style>