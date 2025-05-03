<template>
  <div class="scan-container">
    <div v-if="!isScanning">
      <h3>Зчитати QR-код</h3>
      <p class="instructions">Натисніть кнопку для запуску сканера QR-кодів.</p>
      <ion-button expand="block" @click="startScanning" color="primary">
        <ion-icon :icon="scanOutline" slot="start"></ion-icon>
        Почати сканування
      </ion-button>
      <ion-button expand="block" @click="$emit('back')" fill="outline" class="back-button">
        <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
        Назад
      </ion-button>
    </div>
    <div v-else class="scanning-status">
      <h3>Сканування...</h3>
      <p>Наведіть камеру на QR-код</p>
      <ion-button expand="block" @click="stopScanning" color="danger">
        <ion-icon :icon="closeCircleOutline" slot="start"></ion-icon>
        Скасувати
      </ion-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { scanOutline, arrowBackOutline, closeCircleOutline } from 'ionicons/icons';
import { useQrTransfer } from '../../composables/useQrTransfer';

export default defineComponent({
  emits: ['back', 'data-received', 'error'],
  setup(props, { emit }) {
    const { 
      isScanning,
      errorMessage,
      checkDeviceSupport,
      startScan,
      stopScan
    } = useQrTransfer();
    
    const startScanning = async (): Promise<void> => {
      const isDeviceSupported = await checkDeviceSupport();
      if (!isDeviceSupported) {
        return;
      }
      
      const data = await startScan();
      if (data) {
        emit('data-received', data);
      }
    };
    
    const stopScanning = async (): Promise<void> => {
      await stopScan();
    };
    
    watch(errorMessage, (newError: string) => {
      if (newError) {
        emit('error', newError);
      }
    });
    
    return {
      isScanning,
      startScanning,
      stopScanning,
      scanOutline,
      arrowBackOutline,
      closeCircleOutline
    };
  }
});
</script>

<style lang="scss" scoped>
@import './QrCodeScanner.scss';
</style>