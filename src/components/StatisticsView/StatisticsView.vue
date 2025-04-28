<template>
  <div class="statistics-view">
    <div class="statistics-header">
      <ion-select 
        v-model="daysCount" 
        class="days-select" 
        label="Період" 
        label-placement="stacked" 
        interface="popover"
        :interfaceOptions="{ mode: 'ios', side: 'bottom' }"
        fill="outline"
        mode="md">
        <ion-select-option :value="7">7 днів</ion-select-option>
        <ion-select-option :value="14">14 днів</ion-select-option>
        <ion-select-option :value="30">30 днів</ion-select-option>
      </ion-select>
    </div>

    <!-- Table view of statistics -->
    <div class="statistics-table">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th class="type-300">300</th>
              <th class="type-200">200</th>
              <th class="type-disease">Хвороба</th>
              <th>Всього</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, index) in statistics" :key="index">
              <td>{{ day.date }}</td>
              <td class="type-300">{{ day['300'] }}</td>
              <td class="type-200">{{ day['200'] }}</td>
              <td class="type-disease">{{ day['Хвороба'] }}</td>
              <td>{{ day.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Chart view of statistics -->
    <div class="statistics-chart">
          <BarChart
            v-if="chartData"
            :chart-options="chartOptions"
            :chart-data="chartData"
            :height="250"
          />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { getStatisticsByDate } from '@/compasables/useDatabase.js';
import { BarChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';

// Register the chart components
Chart.register(...registerables);

export default defineComponent({
  components: { BarChart },
  setup() {
    const statistics = ref<any[]>([]);
    const daysCount = ref(7);
    const isLoading = ref(false);

    const fetchStatistics = async () => {
      isLoading.value = true;
      try {
        statistics.value = await getStatisticsByDate(daysCount.value);
      } catch (error) {
        console.error('Error fetching statistics', error);
      } finally {
        isLoading.value = false;
      }
    };

    const chartData = computed(() => {
      if (!statistics.value.length) return null;

      const dates = statistics.value.map(day => day.date);
      
      const datasets = [
        {
          label: '300',
          data: statistics.value.map(day => day['300']),
          backgroundColor: 'rgba(255, 215, 0, 0.6)',
          borderColor: 'rgba(255, 215, 0, 1)',
          borderWidth: 1
        },
        {
          label: '200',
          data: statistics.value.map(day => day['200']),
          backgroundColor: 'rgba(255, 105, 105, 0.6)',
          borderColor: 'rgba(255, 105, 105, 1)',
          borderWidth: 1
        },
        {
          label: 'Хвороба',
          data: statistics.value.map(day => day['Хвороба']),
          backgroundColor: 'rgba(92, 136, 196, 0.6)',
          borderColor: 'rgba(92, 136, 196, 1)',
          borderWidth: 1
        }
      ];
      
      return {
        labels: dates,
        datasets: datasets
      };
    });

    const chartOptions = computed(() => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            ticks: {
              beginAtZero: true,
              precision: 0,
              stepSize: 1
            }
          }
        }
      };
    });

    onMounted(() => {
      fetchStatistics();
    });

    watch(daysCount, () => {
      fetchStatistics();
    });

    return {
      statistics,
      daysCount,
      isLoading,
      chartData,
      chartOptions,
      fetchStatistics
    };
  }
});
</script>

<style scoped lang="scss">
@import './StatisticsView.scss';
</style>