<template>
  <div class="file-actions-container">
    <div class="button-group">
      <label class="custom-file-upload">
        <input type="file" @change="handleFileUpload" accept=".csv">
        <ion-icon :icon="cloudUploadOutline" />
        Імпорт CSV
      </label>
      <ion-button class="export-button" @click="exportToCSV">
        <ion-icon :icon="downloadOutline" />
        Експорт CSV
      </ion-button>
    </div>
    <div v-if="selectedFileName" class="file-name">
      <ion-text color="primary">{{ selectedFileName }}</ion-text>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { cloudUploadOutline, downloadOutline } from 'ionicons/icons';
import { postToStaffTable, getAllFromStaffTable } from '@/compasables/useDatabase.js';

export default {
  emits: ['show-toast'],
  setup(props, { emit }) {
    const selectedFileName = ref('');

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      selectedFileName.value = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const data = parseCSV(text);
        try {
          await saveDataToIndexedDB(data);
          emit('show-toast', 'Файл успішно завантажено!', false);
        } catch (error) {
          emit('show-toast', 'Помилка завантаження файлу: ' + error.message, true);
          console.error(error);
        }
      };

      reader.onerror = async (error) => {
        emit('show-toast', 'Помилка читання файлу: ' + error.message, true);
        console.error(error);
      };

      reader.readAsText(file);
    };

    const exportToCSV = async () => {
      try {
        const staffList = await getAllFromStaffTable();
        const headers = ['Звання', 'ПІБ', 'Позивний', 'Телефон', 'Дата народження', 'Посада', 
                      'Відділення', 'Взвод', 'Рота', 'Батальйон', 'Бригада'];
        
        const csvData = staffList.map((staff: any) => {
          return [
            staff.rank || '',
            staff.name || '',
            staff.nickname || '',
            staff.phone || '',
            staff.birthday || '',
            staff.workPosition || '',
            staff.unit || '',
            staff.unit2 || '',
            staff.unit3 || '',
            staff.unit4 || '',
            staff.unit5 || ''
          ].join(',');
        });

        const csvContent = [headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        emit('show-toast', 'Файл успішно експортовано', false);
      } catch (error) {
        console.error('Export error:', error);
        emit('show-toast', 'Помилка при експорті файлу', true);
      }
    };

    const parseCSV = (text) => {
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      const fieldMap = {
        'Звання': 'rank',
        'ПІБ': 'name',
        'Позивний': 'nickname',
        'Телефон': 'phone',
        'Дата народження': 'birthday',
        'Посада': 'workPosition',
        'Відділення': 'unit1',
        'Взвод': 'unit2',
        'Рота': 'unit3',
        'Батальйон': 'unit4',
        'Бригада': 'unit5'
      };

      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, index) => {
          const key = fieldMap[header.trim()] || header.trim();
          obj[key] = values[index].trim();
        });
        return obj;
      });
      return data;
    };

    const saveDataToIndexedDB = async (data) => {
      for (let item of data) {
        await postToStaffTable(item);
      }
    };

    return {
      handleFileUpload,
      exportToCSV,
      selectedFileName,
      cloudUploadOutline,
      downloadOutline
    };
  }
};
</script>

<style scoped lang="scss">
  @import "@/components/FileUploader/FileUploader.scss";
</style>