<template>
  <div :class="isError ? 'error-container' : 'success-container'">
    <ion-icon 
      :icon="isError ? alertCircleOutline : checkmarkCircleOutline" 
      :color="isError ? 'danger' : 'success'" 
      size="large" 
      class="message-icon"
    ></ion-icon>
    <h3>{{ isError ? 'Помилка' : 'Успіх' }}</h3>
    <p>{{ message }}</p>
    <ion-button 
      expand="block" 
      @click="$emit(isError ? 'retry' : 'close')" 
      :color="isError ? 'medium' : 'success'"
    >
      {{ isError ? 'Спробувати знову' : 'Готово' }}
    </ion-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

export default defineComponent({
  props: {
    isError: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'retry'],
  setup() {
    return {
      checkmarkCircleOutline,
      alertCircleOutline
    };
  }
});
</script>

<style lang="scss" scoped>
 @import './StatusMessage.scss';
</style>