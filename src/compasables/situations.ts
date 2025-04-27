// filepath: e:\Vue projects\reportMobileApp\src\compasables\situations.ts
import { toRaw } from 'vue';
import db from './database';

export const addSituation = async (situationName: string) => {
    try {
        if (!situationName || situationName.trim() === '') return;
        
        const situationNameTrimmed = situationName.trim();
        
        const existingSituation = await db.situationsTable
            .where('name')
            .equals(situationNameTrimmed)
            .first();

        if (existingSituation) {
            await db.situationsTable.update(existingSituation.id as number, {
                usageCount: (existingSituation.usageCount || 0) + 1
            });
            return existingSituation.id;
        }

        const id = await db.situationsTable.add({
            name: situationNameTrimmed,
            usageCount: 1
        });
        
        console.log('Обставину додано з ID:', id);
        return id;
    } catch (error) {
        console.error('Помилка при додаванні обставини:', error);
    }
};

export const searchInSituations = async (value: string) => {
    try {
        const searchValue = value.trim().toLowerCase();
        
        if (searchValue.length < 3) {
            return [];
        }
        
        const allSituations = await db.situationsTable.toArray();
        const result = allSituations
            .filter(situation => situation.name.toLowerCase().includes(searchValue))
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

        return result;
    } catch (error) {
        console.error('Помилка при пошуку обставин:', error);
        return [];
    }
};