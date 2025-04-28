<template>
  <ion-page style="margin-top: 56px">
    <ion-content :fullscreen="true">
      <ion-searchbar class="search-bar" v-model="searchQuery" placeholder="Пошук за ПІБ або позивним" :animated="true" :debounce="500"></ion-searchbar>
      <ion-list>
        <staff-card v-for="staff in filteredStaff" :staff="staff" :key="staff.id" />
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { getAllFromStaffTable } from '@/compasables/useDatabase.js';
import StaffCard from "@/components/StaffCard/StaffCard.vue";
import { IonSearchbar, useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    StaffCard,
    IonSearchbar
  },
  setup() {
    const staffList = ref<any>([]);
    const searchQuery = ref<any>('');
    const route = useRoute();

    const getData = async () => {
      staffList.value = await getAllFromStaffTable();
    };

    const ionRouter = useIonRouter();
    const toStaffCard = (id: number) => {
      ionRouter.push(`/tabs/staff/${id}`);
    };

    const filteredStaff = computed(() => {
      if (!searchQuery.value) {
        return staffList.value;
      }
      const searchLower = searchQuery.value.toLowerCase().trim();
      return staffList.value.filter((staff: any) => {
        const fullName = staff.name.toLowerCase().trim();
        const callSign = staff.nickname.toLowerCase().trim();
        return fullName.startsWith(searchLower) || callSign.startsWith(searchLower);
      });
    });

    watch(() => route.fullPath, async (newValue) => {
      if (newValue === '/tabs/staff') {
        await getData();
      }
    }, { immediate: true });

    return {
      staffList,
      searchQuery,
      filteredStaff,
      toStaffCard
    };
  },
});
</script>

<style lang="scss" scoped>
@import "./StaffPage.scss";
</style>