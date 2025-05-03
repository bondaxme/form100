// filepath: e:\Vue projects\reportMobileApp\src\components\Report\components\AutocompletePicker\AutocompletePicker.vue
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
    <div v-if="isFocused && searchedItems.length" class="autocomplete-tooltip">
      <ion-list>
        <ion-item
          v-for="item in searchedItems"
          :key="item.id"
          @click="selectItem(item)"
          button
        >
          <ion-label class="ion-text-wrap">
            {{ item.name }}
          </ion-label>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { searchInLocations, searchInSituations } from '@/compasables/useDatabase.js';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Пошук'
    },
    searchType: {
      type: String,
      default: 'locations',
      validator: (value: string) => ['locations', 'situations'].includes(value)
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isFocused = ref(false);
    const searchedItems = ref<any[]>([]);

    const onFocus = async () => {
      isFocused.value = true;
      if (props.modelValue.trim().length >= 3) {
        searchItems(props.modelValue);
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
        searchItems(value);
      } else {
        searchedItems.value = [];
      }
    };

    const searchItems = async (value: string) => {
      if (props.searchType === 'locations') {
        searchedItems.value = await searchInLocations(value);
      } else if (props.searchType === 'situations') {
        searchedItems.value = await searchInSituations(value);
      }
    };

    const selectItem = (item: any) => {
      emit('update:modelValue', item.name);
      searchedItems.value = [];
    };

    watch(() => props.modelValue, (newValue) => {
      if (isFocused.value && newValue && newValue.trim().length >= 3) {
        searchItems(newValue);
      }
    });

    return {
      isFocused,
      searchedItems,
      onFocus,
      onBlur,
      handleInput,
      selectItem
    };
  }
});
</script>

<style scoped lang="scss">
 @import './AutocompletePicker.scss';
</style>