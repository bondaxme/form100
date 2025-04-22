import db from './database';

export const countHealthStatus = async (status: string) => {
    try {
        const count = await db.reportsTable.where('healthStatus').equals(status).count();
        console.log(`Total count for healthStatus ${status}:`, count);
        return count;
    } catch (error) {
        console.error(`Failed to count healthStatus ${status}:`, error);
        return 0;
    }
};

export const countTodayReports = async (status: string) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = await db.reportsTable
            .where('healthStatus')
            .equals(status)
            .filter(report => {
                const reportDate = new Date(report.createdAt);
                reportDate.setHours(0, 0, 0, 0);
                return reportDate.getTime() === today.getTime();
            }).count();
        console.log(`Total count for reports created today with healthStatus ${status}:`, count);
        return count;
    } catch (error) {
        console.error(`Failed to count reports created today with healthStatus ${status}:`, error);
        return 0;
    }
};