<template>
  <div class="method-selection">
    <h3>Оберіть спосіб {{ isReceiveMode ? 'отримання' : 'передачі' }}</h3>
    
    <ion-list>
      <ion-item button @click="$emit('select-method', 'qr')" detail>
        <ion-icon :icon="qrCodeOutline" slot="start" color="primary"></ion-icon>
        <ion-label>
          <h2>QR-код</h2>
          <p>{{ isReceiveMode ? 'Зчитати QR-код камерою' : 'Згенерувати QR-код для зчитування' }}</p>
        </ion-label>
      </ion-item>
      
      <ion-item button @click="$emit('select-method', 'bluetooth')" detail>
        <ion-icon :icon="bluetoothOutline" slot="start" color="primary"></ion-icon>
        <ion-label>
          <h2>Bluetooth</h2>
          <p>{{ isReceiveMode ? 'Отримати через Bluetooth' : 'Відправити через Bluetooth' }}</p>
        </ion-label>
      </ion-item>
      
      <ion-item button detail disabled>
        <ion-icon :icon="wifiOutline" slot="start" color="primary"></ion-icon>
        <ion-label>
          <h2>Wi-Fi Direct</h2>
          <p>В розробці</p>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { qrCodeOutline, bluetoothOutline, wifiOutline } from 'ionicons/icons';

export default defineComponent({
  props: {
    isReceiveMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-method'],
  setup() {
    return {
      qrCodeOutline,
      bluetoothOutline,
      wifiOutline
    };
  }
});
</script>

<style lang="scss" scoped>
 @import './MethodSelector.scss';
</style>