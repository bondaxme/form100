// filepath: e:\Vue projects\reportMobileApp\src\components\Report\components\LocationPicker\LocationPicker.vue
<template>
  <div class="input-wrapper">
    <ion-input
      :model-value="modelValue"
      :debounce="500"
      class="ion-margin-bottom"
      :label="label"
      label-placement="floating"
      fill="outline"
      mode="md"
      @ionFocus="onFocus"
      @ionBlur="onBlur"
      @ionInput="handleInput"
    />
    <div v-if="isFocused && searchedLocations.length" class="autocomplete-tooltip">
      <ion-list>
        <ion-item
          v-for="location in searchedLocations"
          :key="location.id"
          @click="selectLocation(location)"
          button
        >
          <ion-label class="ion-text-wrap">
            {{ location.name }}
          </ion-label>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { searchInLocations } from '@/compasables/useDatabase.js';

export default defineComponent({
  name: 'LocationPicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Місце події'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isFocused = ref(false);
    const searchedLocations = ref<any[]>([]);

    const onFocus = async () => {
      isFocused.value = true;
      if (props.modelValue.trim().length >= 3) {
        searchLocations(props.modelValue);
      }
    };

    const onBlur = () => {
      setTimeout(() => {
        isFocused.value = false;
      }, 150);
    };

    const handleInput = (event: CustomEvent) => {
      const inputEl = event.target as HTMLInputElement;
      const value = inputEl?.value || '';
      emit('update:modelValue', value);
      if (value.trim().length >= 3) {
        searchLocations(value);
      } else {
        searchedLocations.value = [];
      }
    };

    const searchLocations = async (value: string) => {
      searchedLocations.value = await searchInLocations(value);
    };

    const selectLocation = (location: any) => {
      emit('update:modelValue', location.name);
      searchedLocations.value = [];
    };

    watch(() => props.modelValue, (newValue) => {
      if (isFocused.value && newValue && newValue.trim().length >= 3) {
        searchLocations(newValue);
      }
    });

    return {
      isFocused,
      searchedLocations,
      onFocus,
      onBlur,
      handleInput,
      selectLocation
    };
  }
});
</script>

<style scoped>
 @import "./LocationPicker.scss";
</style>