<template>
  <div class="qr-container">
    <h3>Зчитайте цей QR-код</h3>
    <div class="qr-code" ref="qrCodeContainer"></div>
    <p class="instructions">Покажіть цей QR-код іншому пристрою для зчитування.</p>
    <ion-button expand="block" @click="$emit('back')" fill="outline">
      <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
      Назад
    </ion-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, Ref } from 'vue';
import { arrowBackOutline } from 'ionicons/icons';
import { useQrTransfer } from '../../composables/useQrTransfer';

export default defineComponent({
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  emits: ['back', 'error'],
  setup(props, { emit }) {
    const qrCodeContainer: Ref<HTMLElement | null> = ref(null);
    const { generateQRCode, errorMessage } = useQrTransfer();
    
    // Генеруємо QR-код при монтуванні компоненту
    onMounted(async () => {
      if (qrCodeContainer.value) {
        await generateQRCode(qrCodeContainer.value, props.data);
      }
    });
    
    // Спостерігаємо за помилками
    watch(errorMessage, (newError: string) => {
      if (newError) {
        emit('error', newError);
      }
    });
    
    return {
      qrCodeContainer,
      arrowBackOutline
    };
  }
});
</script>

<style lang="scss" scoped>
 @import './QrCodeGenerator.scss';
</style>