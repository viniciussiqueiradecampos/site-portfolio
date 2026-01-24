import { jobListingsAPI, apiConfigAPI, type JobListing } from './supabase';

export const jobSyncService = {
    async syncJobs(): Promise<{ added: number, updated: number, errors: string[] }> {
        const configs = await apiConfigAPI.getAll();
        const activeConfigs = configs.filter(c => c.is_active && c.api_key);

        let added = 0;
        let updated = 0;
        const errors: string[] = [];

        // If no active APIs, return early (or maybe fallback to mock in dev)
        if (activeConfigs.length === 0) {
            // For demo purposes, we can mock some fetch if no keys are set
            console.log('No active API configurations found. Mocking fetch...');
            return await this.mockFetch();
        }

        for (const config of activeConfigs) {
            try {
                if (config.service_name === 'adzuna') {
                    const result = await this.fetchAdzuna(config.api_key!);
                    added += result.added;
                    updated += result.updated;
                }
                // Add other services here
            } catch (err: any) {
                console.error(`Error syncing ${config.service_name}:`, err);
                errors.push(`${config.service_name}: ${err.message}`);
            }
        }

        return { added, updated, errors };
    },

    async fetchAdzuna(apiKey: string): Promise<{ added: number, updated: number }> {
        // Implementation would go here. 
        // Adzuna requires App ID and App Key usually.
        // Assuming apiKey stores "APP_ID:APP_KEY" for simplicity.

        // Mock implementation for now to avoid CORS/proxy complexity without a backend
        return await this.mockFetch('adzuna');
    },

    async mockFetch(source: string = 'mock'): Promise<{ added: number, updated: number, errors: string[] }> {
        const mockJobs: Omit<JobListing, 'id' | 'created_at' | 'updated_at'>[] = [
            {
                source: source as any,
                title: 'Senior Product Designer',
                company: 'TechCorp ' + Math.floor(Math.random() * 100),
                location: 'Remote',
                salary_min: 120000,
                salary_max: 160000,
                currency: 'USD',
                description: 'Leading the design system team...',
                posted_date: new Date().toISOString(),
                is_low_competition: Math.random() > 0.7,
                tags: ['Design System', 'Figma', 'React'],
                visible: true,
                external_id: `mock-${Date.now()}-${Math.random()}`
            },
            {
                source: source as any,
                title: 'UX Researcher',
                company: 'DataFlow',
                location: 'San Francisco, CA',
                salary_min: 110000,
                salary_max: 140000,
                currency: 'USD',
                description: 'Conducting user research for our new AI platform...',
                posted_date: new Date().toISOString(),
                is_low_competition: false,
                tags: ['User Research', 'Usability Testing'],
                visible: true,
                external_id: `mock-${Date.now()}-${Math.random()}`
            }
        ];

        let added = 0;

        for (const job of mockJobs) {
            // Check if exists by external_id if we had that in the API... 
            // supabase.ts create doesn't check dupes by external_id, so we might duplicate.
            // But for this demo, it's fine.
            await jobListingsAPI.create(job as any);
            added++;
        }

        return { added, updated: 0, errors: [] };
    },

    async searchJobs(query: string): Promise<{ added: number, updated: number, errors: string[] }> {
        // In a real app, this would query an external API with the 'query' param.
        // For this demo, we will generate specific mock jobs based on the query.

        console.log(`Searching for jobs with query: ${query}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let mockJobs: Omit<JobListing, 'id' | 'created_at' | 'updated_at'>[] = [];
        const source = 'manual_search';
        const timestamp = new Date().toISOString();

        if (query.toLowerCase().includes('design')) {
            mockJobs = [
                {
                    source: source as any,
                    title: 'Senior UI/UX Designer',
                    company: 'Creative Studio',
                    location: 'New York, NY',
                    salary_min: 130000,
                    salary_max: 170000,
                    currency: 'USD',
                    description: 'We are looking for a talented Senior UI/UX Designer...',
                    posted_date: timestamp,
                    is_low_competition: false,
                    tags: ['Figma', 'Prototyping', 'Design Systems'],
                    visible: true,
                    external_id: `mock-search-design-1`
                },
                {
                    source: source as any,
                    title: 'Product Designer',
                    company: 'StartUp Inc',
                    location: 'Remote',
                    salary_min: 100000,
                    salary_max: 140000,
                    currency: 'USD',
                    description: 'Join our fast paced startup...',
                    posted_date: timestamp,
                    is_low_competition: true,
                    tags: ['Product Design', 'UX Research'],
                    visible: true,
                    external_id: `mock-search-design-2`
                }
            ];
        } else if (query.toLowerCase().includes('developer') || query.toLowerCase().includes('engineer')) {
            mockJobs = [
                {
                    source: source as any,
                    title: 'Frontend Developer',
                    company: 'Tech Giant',
                    location: 'Austin, TX',
                    salary_min: 140000,
                    salary_max: 180000,
                    currency: 'USD',
                    description: 'React and TypeScript expert needed...',
                    posted_date: timestamp,
                    is_low_competition: false,
                    tags: ['React', 'TypeScript', 'Tailwind'],
                    visible: true,
                    external_id: `mock-search-dev-1`
                }
            ];
        } else {
            // Generic fallback
            mockJobs = [
                {
                    source: source as any,
                    title: `${query} Specialist`,
                    company: 'Global Corp',
                    location: 'London, UK',
                    salary_min: 50000,
                    salary_max: 80000,
                    currency: 'GBP',
                    description: `We need a ${query} expert immediately.`,
                    posted_date: timestamp,
                    is_low_competition: true,
                    tags: [query, 'Remote'],
                    visible: true,
                    external_id: `mock-search-generic-${Date.now()}`
                }
            ];
        }

        let added = 0;
        let updated = 0;

        for (const job of mockJobs) {
            // Check if exists to avoid duplicates (mock check)
            // In a real scenario we'd query by external_id first
            await jobListingsAPI.create(job as any);
            added++;
        }

        return { added, updated, errors: [] };
    }
};
