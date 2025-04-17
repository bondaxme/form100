<template>
    <ion-card class="ion-card" :class="[isActive ? 'active' : '']" @click="toggleFilter">
      <ion-card-header class="ion-card-header">
        <ion-card-title class="ion-card-title">{{ title }}</ion-card-title>
      </ion-card-header>
      <ion-card-content class="ion-card-content">
        <ion-label v-if="total != null" class="total-records">Всього: {{ total }}</ion-label>
        <ion-label v-if="currentDay > 0" class="per-day">(+{{ currentDay }} за день)</ion-label>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      title: {
        type: String,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
      currentDay: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: false
      }
    },
    emits: ['toggleFilter'],
    setup(props, { emit }) {
      const toggleFilter = () => {
        emit('toggleFilter', props.title);
      };
  
      return {
        toggleFilter
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  @import "@/components/DashboardWidget/DashboardWidget.scss";
  </style>
  