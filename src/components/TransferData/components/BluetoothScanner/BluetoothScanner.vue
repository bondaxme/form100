<template>
  <div class="bluetooth-scanner">
    <div class="scanner-header">
      <h2>Пошук пристроїв</h2>
      <p v-if="scanning">Шукаємо пристрої поблизу...</p>
      <p v-else-if="devicesList.length === 0">Натисніть кнопку для пошуку пристроїв</p>
      <p v-else>Виберіть пристрій зі списку</p>
    </div>

    <ion-button expand="block" @click="toggleScan" :disabled="isConnecting">
      {{ scanning ? 'Зупинити пошук' : 'Шукати пристрої' }}
    </ion-button>

    <div class="devices-list" v-if="devicesList.length > 0">
      <ion-list>
        <ion-item 
          v-for="device in devicesList" 
          :key="device.deviceId" 
          button 
          @click="connectToDevice(device.deviceId)"
          :disabled="isConnecting"
        >
          <ion-label>
            <h3>{{ device.name || 'Невідомий пристрій' }}</h3>
            <p>{{ device.deviceId }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </div>

    <div class="scanning-spinner" v-if="scanning">
      <ion-spinner name="circles"></ion-spinner>
    </div>

    <div class="connection-status" v-if="isConnecting">
      <ion-spinner name="dots"></ion-spinner>
      <p>Підключення до пристрою...</p>
    </div>

    <ion-button expand="block" @click="goBack" color="medium">
      Назад
    </ion-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from 'vue';
import { useBluetoothTransfer } from '../../composables/useBluetoothTransfer';

export default defineComponent({
  name: 'BluetoothScanner',
  emits: ['back', 'error', 'device-connected'],
  
  setup(_, { emit }) {
    const { 
      devicesList,
      errorMessage,
      initialize,
      startScan,
      stopScan,
      connectToDevice
    } = useBluetoothTransfer();
    
    const scanning: Ref<boolean> = ref(false);
    const isConnecting: Ref<boolean> = ref(false);
    
    onMounted(async () => {
      const initialized = await initialize();
      if (!initialized) {
        emit('error', errorMessage.value);
        return;
      }
    });
    
    // onUnmounted(async () => {
    //   await cleanup();
    // });
    
    const toggleScan = async () => {
      if (scanning.value) {
        await stopScan();
        scanning.value = false;
      } else {
        scanning.value = true;
        await startScan();
      }
    };
    
    const handleConnectToDevice = async (deviceId: string) => {
      isConnecting.value = true;
      const connected = await connectToDevice(deviceId);
      isConnecting.value = false;
      
      if (connected) {
        scanning.value = false;
        await stopScan();
        emit('device-connected');
      } else {
        emit('error', errorMessage.value);
      }
    };
    
    const goBack = async () => {
      await stopScan();
      scanning.value = false;
      emit('back');
    };
    
    return {
      devicesList,
      scanning,
      isConnecting,
      toggleScan,
      connectToDevice: handleConnectToDevice,
      goBack
    };
  }
});
</script>

<style scoped>
 @import "./BluetoothScanner.scss";
</style>