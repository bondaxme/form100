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
        
        <div v-else class="ready-status">
          <p>Пристрій готовий до передачі даних</p>
          <ion-button expand="block" @click="sendReport" color="primary">
            Відправити звіт
          </ion-button>
        </div>
      </div>
      
      <div class="sender-footer">
        <ion-button expand="block" @click="disconnectDevice" color="medium">
          Відключитись
        </ion-button>
        <ion-button expand="block" @click="goBack" color="medium">
          Назад
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { useBluetoothTransfer } from '../../composables/useBluetoothTransfer';
import BluetoothScanner from '../BluetoothScanner/BluetoothScanner.vue';

export default defineComponent({
  name: 'BluetoothSender',
  components: {
    BluetoothScanner
  },
  props: {
    reportData: {
      type: Object,
      required: true
    }
  },
  emits: ['back', 'error', 'success'],
  
  setup(props, { emit }) {
    const { 
      selectedDevice,
      isSending,
      transferProgress,
      errorMessage,
      successMessage,
      sendData,
      disconnectFromDevice,
      cleanup
    } = useBluetoothTransfer();
    
    const onDeviceConnected = () => {
      // Device was connected in the scanner component
    };
    
    const sendReport = async () => {
      const result = await sendData(props.reportData);
      if (result) {
        emit('success', successMessage.value);
      } else {
        emit('error', errorMessage.value);
      }
    };
    
    const disconnectDevice = async () => {
      await disconnectFromDevice();
    };
    
    const handleError = (error: string) => {
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
      goBack
    };
  }
});
</script>

<style scoped>
.bluetooth-sender {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sender-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.sender-header {
  text-align: center;
  margin-bottom: 20px;
}

.transfer-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.sending-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.sending-status ion-progress-bar {
  width: 100%;
  margin: 10px 0;
}

.ready-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.sender-footer {
  margin-top: auto;
}

.sender-footer ion-button {
  margin-bottom: 10px;
}
</style>