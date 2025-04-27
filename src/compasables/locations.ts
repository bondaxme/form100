// filepath: e:\Vue projects\reportMobileApp\src\compasables\locations.ts
import { toRaw } from 'vue';
import db from './database';

export const addLocation = async (locationName: string) => {
    try {
        if (!locationName || locationName.trim() === '') return;
        
        const locationNameTrimmed = locationName.trim();
        
        const existingLocation = await db.locationsTable
            .where('name')
            .equals(locationNameTrimmed)
            .first();

        if (existingLocation) {
            await db.locationsTable.update(existingLocation.id as number, {
                usageCount: (existingLocation.usageCount || 0) + 1
            });
            return existingLocation.id;
        }

        const id = await db.locationsTable.add({
            name: locationNameTrimmed,
            usageCount: 1
        });
        
        console.log('Локацію додано з ID:', id);
        return id;
    } catch (error) {
        console.error('Помилка при додаванні локації:', error);
    }
};

export const searchInLocations = async (value: string) => {
    try {
        const searchValue = value.trim().toLowerCase();
        
        if (searchValue.length < 3) {
            return [];
        }
        
        const allLocations = await db.locationsTable.toArray();
        const result = allLocations
            .filter(location => location.name.toLowerCase().includes(searchValue))
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

        return result;
    } catch (error) {
        console.error('Помилка при пошуку локацій:', error);
        return [];
    }
};