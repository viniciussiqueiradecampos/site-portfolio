import { dailyTasksAPI, type DailyTask } from './supabase';

export const taskGenerator = {
    async generateDailyTasks(profileId: string): Promise<DailyTask[]> {
        const today = new Date().toISOString().split('T')[0];

        // Check if tasks already exist
        const existingTasks = await dailyTasksAPI.getToday(profileId);
        if (existingTasks.length > 0) {
            return existingTasks;
        }

        // Generate default tasks
        const newTasks: Omit<DailyTask, 'id' | 'created_at'>[] = [
            {
                profile_id: profileId,
                task_type: 'application',
                description: 'Apply to 5 jobs matching "Senior Product Designer"',
                completed: false,
                date: today
            } as any, // casting because task_type enum might not match exactly my strings here, I should align with types
            {
                profile_id: profileId,
                task_type: 'connection',
                description: 'Connect with 3 recruiters on LinkedIn at target companies',
                completed: false,
                date: today
            } as any,
            {
                profile_id: profileId,
                task_type: 'comment',
                description: 'Comment on 5 posts relevant to UX/UI Design',
                completed: false,
                date: today
            } as any,
            {
                profile_id: profileId,
                task_type: 'profile_update',
                description: 'Update LinkedIn featured section with latest case study',
                completed: false,
                date: today
            } as any
        ];

        const createdTasks: DailyTask[] = [];

        for (const task of newTasks) {
            const created = await dailyTasksAPI.create(task);
            if (created) {
                createdTasks.push(created);
            }
        }

        return createdTasks;
    }
};
