<template>
  <div class="file-actions-container">
    <div class="button-group">
      <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv" style="display: none;">
      <ion-button class="import-button" @click="triggerFileInput">
        <ion-icon :icon="cloudUploadOutline" />
        Імпорт CSV
      </ion-button>
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
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';

interface StaffData {
  rank?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  birthday?: string;
  workPosition?: string;
  unit?: string;
  unit2?: string;
  unit3?: string;
  unit4?: string;
  unit5?: string;
  [key: string]: string | undefined;
}

export default {
  emits: ['show-toast'],
  setup(props, { emit }) {
    const selectedFileName = ref('');
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target || !target.files) return;
      
      const file = target.files[0];
      if (!file) return;
      
      selectedFileName.value = file.name;

      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) return;
        const text = e.target.result as string;
        const data = parseCSV(text);
        try {
          await saveDataToIndexedDB(data);
          emit('show-toast', 'Файл успішно завантажено!', false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          emit('show-toast', 'Помилка завантаження файлу: ' + errorMessage, true);
          console.error(error);
        }
      };

      reader.onerror = () => {
        emit('show-toast', 'Помилка читання файлу', true);
        console.error(reader.error);
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
        const fileName = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        if (isPlatform('mobile')) {
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: csvContent,
              directory: Directory.Documents,
              encoding: Encoding.UTF8
            });
            
            emit('show-toast', 'Файл збережено у Documents', false);
          } catch (err) {
            console.error('Filesystem error:', err);
            emit('show-toast', 'Помилка збереження файлу', true);
          }
        } else {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          emit('show-toast', 'Файл успішно експортовано', false);
        }
      } catch (error) {
        console.error('Export error:', error);
        emit('show-toast', 'Помилка при експорті файлу', true);
      }
    };

    const parseCSV = (text: string): StaffData[] => {
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      const fieldMap: Record<string, string> = {
        'звання': 'rank',
        'піб': 'name',
        'позивний': 'nickname',
        'телефон': 'phone',
        'дата народження': 'birthday',
        'посада': 'workPosition',
        'відділення': 'unit1',
        'взвод': 'unit2',
        'рота': 'unit3',
        'батальйон': 'unit4',
        'бригада': 'unit5'
      };

      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: StaffData = {};
        headers.forEach((header: string, index: number) => {
          const normalizedHeader = header.trim().toLowerCase();
          const key = fieldMap[normalizedHeader] || normalizedHeader;
          obj[key] = values[index]?.trim();
        });
        return obj;
      });
      return data;
    };

    const saveDataToIndexedDB = async (data: StaffData[]) => {
      for (const item of data) {
        await postToStaffTable(item);
      }
    };

    return {
      handleFileUpload,
      exportToCSV,
      selectedFileName,
      cloudUploadOutline,
      downloadOutline,
      fileInput,
      triggerFileInput
    };
  }
};
</script>

<style scoped lang="scss">
  @import "./FileUploader.scss";
</style>