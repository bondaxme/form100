<template>
  <div class="bluetooth-receiver">
    <div class="receiver-header">
      <h2>Отримання звіту</h2>
      <p v-if="isReceiving">Очікування підключення...</p>
      <p v-else>Натисніть кнопку, щоб почати отримання</p>
    </div>

    <div class="advertising-controls">
      <ion-button expand="block" @click="toggleAdvertising">
        {{ isReceiving ? 'Зупинити прийом' : 'Почати прийом' }}
      </ion-button>
    </div>

    <div class="receiver-status" v-if="isReceiving">
      <div class="status-info">
        <ion-spinner name="circles"></ion-spinner>
        <p>Пристрій видимий для передачі</p>
        <p class="instruction">Відкрийте відправку на іншому пристрої та підключіться до цього</p>
      </div>
    </div>

    <div class="receiver-footer">
      <ion-button expand="block" @click="goBack" color="medium">
        Назад
      </ion-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { BluetoothLowEnergy } from '@capawesome-team/capacitor-bluetooth-low-energy';
import { useBluetoothTransfer } from '../../composables/useBluetoothTransfer';

// Same constants as in useBluetoothTransfer.ts
const REPORT_SERVICE_UUID = '00001800-0000-1000-8000-00805f9b34fb';
const REPORT_CHARACTERISTIC_UUID = '00002a00-0000-1000-8000-00805f9b34fb';

export default defineComponent({
  name: 'BluetoothReceiver',
  emits: ['back', 'error', 'data-received'],

  setup(_, { emit }) {
    const { 
      isReceiving,
      errorMessage,
      initialize,
      startAdvertising,
      stopAdvertising,
      setupDataReceiver,
      cleanup
    } = useBluetoothTransfer();

    // Set up listeners for data reception when the component mounts
    onMounted(async () => {
      const initialized = await initialize();
      if (!initialized) {
        emit('error', errorMessage.value);
        return;
      }

      // Setup data receiver
      await setupDataReceiver();
      
      // Add event listener to handle the received data
      BluetoothLowEnergy.addListener('characteristicWriteRequest', async (event) => {
        if (event.characteristicId === REPORT_CHARACTERISTIC_UUID) {
          try {
            const decoder = new TextDecoder();
            const dataString = decoder.decode(new Uint8Array(event.value));
            const data = JSON.parse(dataString);
            emit('data-received', data);
          } catch (err) {
            console.error('Error processing received data:', err);
            emit('error', 'Помилка при обробці отриманих даних');
          }
        }
      });
    });

    onUnmounted(async () => {
      await cleanup();
    });

    const toggleAdvertising = async () => {
      if (isReceiving.value) {
        await stopAdvertising();
      } else {
        const result = await startAdvertising();
        if (!result) {
          emit('error', errorMessage.value);
        }
      }
    };

    const goBack = async () => {
      await stopAdvertising();
      emit('back');
    };

    return {
      isReceiving,
      toggleAdvertising,
      goBack
    };
  }
});
</script>

<style scoped>
.bluetooth-receiver {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.receiver-header {
  text-align: center;
  margin-bottom: 20px;
}

.advertising-controls {
  margin: 20px 0;
}

.receiver-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f8f8f8;
}

.instruction {
  margin-top: 16px;
  font-size: 14px;
  font-style: italic;
  text-align: center;
}

.receiver-footer {
  margin-top: auto;
}
</style>