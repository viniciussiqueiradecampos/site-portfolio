import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('VITE_SUPABASE_URL:', supabaseUrl);
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Types
export interface Content {
    id: string;
    key: string;
    value: string;
    category: 'hero' | 'portfolio' | 'cv' | 'storytelling' | 'general';
    created_at: string;
    updated_at: string;
}

export interface CRMLead {
    id: string;
    company_name: string;
    website_url?: string;
    region?: string;
    status: 'novo' | 'contatado' | 'negociacao' | 'fechado' | 'perdido';
    detected_issues?: string[];
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    last_contact_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    rich_description?: string;
    year?: string;
    image_url: string;
    image_alt?: string;
    gallery_images?: string[];
    gallery_videos?: string[]; // New: support for videos
    tags: string[];
    live_url?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    button_text?: string;
    button_icon?: string;
    password_protection?: string;
    order_index: number;
    visible: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface AnalyticsLog {
    id: string;
    event_type: 'page_view' | 'project_click' | 'cv_download';
    page_path?: string;
    project_id?: string;
    referrer?: string;
    user_agent?: string;
    created_at: string;
}

export interface ProjectData {
    title: string;
    type?: string;
    year?: string;
    tags?: string[];
    image_url?: string;
    gallery_images?: string[];
    img?: string;
    gallery?: string[];
    description?: string;
    live_url?: string;
    button_text?: string;
    button_icon?: string;
}

export interface CVSection {
    id: string;
    section_type: 'experience' | 'education' | 'skills' | 'certification' | 'hobbies';
    title: string;
    subtitle?: string;
    description?: string;
    date_range?: string;
    order_index: number;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    image_url?: string;
    category: string;
    tags: string[]; // New field
    slug: string;
    cover_position?: string;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export const crmAPI = {
    async getAll(): Promise<CRMLead[]> {
        const { data, error } = await supabase
            .from('crm_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
            return [];
        }
        return data || [];
    },

    async create(lead: Omit<CRMLead, 'id' | 'created_at' | 'updated_at'>): Promise<CRMLead | null> {
        const { data, error } = await supabase
            .from('crm_leads')
            .insert([lead])
            .select()
            .single();

        if (error) {
            console.error('Error creating lead:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<CRMLead>): Promise<boolean> {
        const { error } = await supabase
            .from('crm_leads')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating lead:', error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('crm_leads')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting lead:', error);
            return false;
        }
        return true;
    }
};


// API Functions
export const contentAPI = {
    async getByKey(key: string): Promise<Content | null> {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('key', key)
            .single();

        if (error) {
            console.error('Error fetching content:', error);
            return null;
        }
        return data;
    },

    async getByCategory(category: string): Promise<Content[]> {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('category', category);

        if (error) {
            console.error('Error fetching content:', error);
            return [];
        }
        return data || [];
    },

    async update(key: string, value: string, category: string = 'general'): Promise<{ ok: boolean, msg?: string }> {
        const { error } = await supabase
            .from('content')
            .upsert({ key, value, category }, { onConflict: 'key' });

        if (error) {
            console.error(`Error updating content [${key}]:`, error);
            return { ok: false, msg: error.message };
        }
        return { ok: true };
    }
};

export const projectsAPI = {
    async getAll(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('visible', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
        return data || [];
    },

    async update(id: string, updates: Partial<Project>): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('❌ Supabase Update Error:', error.message, error.details, error.hint);
            return false;
        }
        return true;
    },

    async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .insert([project])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase Create Error:', error.message, error.details, error.hint);
            return null;
        }
        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            return false;
        }
        return true;
    }
};

export const cvAPI = {
    async getAll(): Promise<CVSection[]> {
        const { data, error } = await supabase
            .from('cv_sections')
            .select('*')
            .eq('visible', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching CV sections:', error);
            return [];
        }
        return data || [];
    },

    async create(section: Omit<CVSection, 'id' | 'created_at' | 'updated_at'>): Promise<CVSection | null> {
        const { data, error } = await supabase
            .from('cv_sections')
            .insert([section])
            .select()
            .single();

        if (error) {
            console.error('Error creating CV section:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<CVSection>): Promise<boolean> {
        const { error } = await supabase
            .from('cv_sections')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating CV section:', error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('cv_sections')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting CV section:', error);
            return false;
        }
        return true;
    }
};

// ========================================
// GLOBAL CAREER ARCHITECT TYPES & APIs
// ========================================

export interface CareerProfile {
    id: string;
    user_email: string;
    full_name?: string;
    current_job_title?: string;
    target_role?: string;
    cv_url?: string;
    cv_skills?: string[];
    linkedin_url?: string;
    linkedin_ssi_score: number;
    daily_application_goal: number;
    preferred_locations?: string[];
    preferred_salary_min?: number;
    preferred_salary_max?: number;
    preferred_currency: string;
    created_at: string;
    updated_at: string;
}

export interface JobListing {
    id: string;
    external_id?: string;
    source: 'adzuna' | 'theirstack' | 'manual';
    title: string;
    company: string;
    location?: string;
    job_type?: 'full-time' | 'part-time' | 'contract' | 'freelance'; // New field
    remote_type?: 'remote' | 'hybrid' | 'on-site'; // New field
    salary_min?: number;
    salary_max?: number;
    currency: string;
    description?: string;
    requirements?: string;
    url?: string;
    posted_date?: string;
    is_low_competition: boolean;
    competition_score?: number;
    tags?: string[];
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface JobApplication {
    id: string;
    profile_id: string;
    job_id: string;
    status: 'nova' | 'candidatado' | 'entrevista' | 'recusado' | 'oferta';
    match_score?: number;
    applied_date?: string;
    interview_date?: string;
    notes?: string;
    recruiter_contact?: string;
    cover_letter?: string;
    created_at: string;
    updated_at: string;
}

export interface LinkedInSSI {
    id: string;
    profile_id: string;
    date: string;
    establish_brand: number;
    find_right_people: number;
    engage_insights: number;
    build_relationships: number;
    total_score: number;
    created_at: string;
}

export interface DailyTask {
    id: string;
    profile_id: string;
    task_type: 'profile_update' | 'comment' | 'connection' | 'post';
    description: string;
    completed: boolean;
    completed_at?: string;
    date: string;
    created_at: string;
}

export interface APIConfiguration {
    id: string;
    service_name: string;
    api_key?: string;
    is_active: boolean;
    last_sync?: string;
    created_at: string;
    updated_at: string;
}

// Career Profile API
export const careerProfileAPI = {
    async getByEmail(email: string): Promise<CareerProfile | null> {
        const { data, error } = await supabase
            .from('career_profiles')
            .select('*')
            .eq('user_email', email)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    },

    async create(profile: Omit<CareerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<CareerProfile | null> {
        const { data, error } = await supabase
            .from('career_profiles')
            .insert([profile])
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<CareerProfile>): Promise<boolean> {
        const { error } = await supabase
            .from('career_profiles')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating profile:', error);
            return false;
        }
        return true;
    }
};

// Job Listings API
export const jobListingsAPI = {
    async getAll(): Promise<JobListing[]> {
        const { data, error } = await supabase
            .from('job_listings')
            .select('*')
            .eq('visible', true)
            .order('posted_date', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
        return data || [];
    },

    async getRecent(hours: number = 72): Promise<JobListing[]> {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - hours);

        const { data, error } = await supabase
            .from('job_listings')
            .select('*')
            .eq('visible', true)
            .gte('posted_date', cutoffDate.toISOString())
            .order('posted_date', { ascending: false });

        if (error) {
            console.error('Error fetching recent jobs:', error);
            return [];
        }
        return data || [];
    },

    async create(job: Omit<JobListing, 'id' | 'created_at' | 'updated_at'>): Promise<JobListing | null> {
        const { data, error } = await supabase
            .from('job_listings')
            .insert([job])
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<JobListing>): Promise<boolean> {
        const { error } = await supabase
            .from('job_listings')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating job:', error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('job_listings')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting job:', error);
            return false;
        }
        return true;
    }
};

// Job Applications API
export const jobApplicationsAPI = {
    async getByProfile(profileId: string): Promise<JobApplication[]> {
        const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
        return data || [];
    },

    async create(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication | null> {
        const { data, error } = await supabase
            .from('job_applications')
            .insert([application])
            .select()
            .single();

        if (error) {
            console.error('Error creating application:', error);
            return null;
        }
        return data;
    },

    async updateStatus(id: string, status: JobApplication['status']): Promise<boolean> {
        const { error } = await supabase
            .from('job_applications')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Error updating application status:', error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting application:', error);
            return false;
        }
        return true;
    }
};

// Daily Tasks API
export const dailyTasksAPI = {
    async getToday(profileId: string): Promise<DailyTask[]> {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('profile_id', profileId)
            .eq('date', today)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
        return data || [];
    },

    async create(task: Omit<DailyTask, 'id' | 'created_at'>): Promise<DailyTask | null> {
        const { data, error } = await supabase
            .from('daily_tasks')
            .insert([task])
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            return null;
        }
        return data;
    },

    async toggleComplete(id: string, completed: boolean): Promise<boolean> {
        const { error } = await supabase
            .from('daily_tasks')
            .update({
                completed,
                completed_at: completed ? new Date().toISOString() : null
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating task:', error);
            return false;
        }
        return true;
    }
};

export const analyticsAPI = {
    async logEvent(event: Omit<AnalyticsLog, 'id' | 'created_at'>): Promise<boolean> {
        const { error } = await supabase.from('analytics_logs').insert([event]);
        if (error) {
            console.error('Error logging event:', error);
            return false;
        }
        return true;
    },

    async getStats(): Promise<any> {
        const { data: logs } = await supabase.from('analytics_logs').select('*');
        if (!logs) return { pageViews: 0, cvDownloads: 0, projectClicks: 0, sources: [], pages: [] };

        const views = logs.filter(l => l.event_type === 'page_view');
        const downloads = logs.filter(l => l.event_type === 'cv_download');
        const clicks = logs.filter(l => l.event_type === 'project_click');

        // Page breakdown
        const pageCounts: Record<string, number> = {};
        views.forEach(v => {
            const p = v.page_path || '/';
            pageCounts[p] = (pageCounts[p] || 0) + 1;
        });

        // Source breakdown
        const sourceCounts: Record<string, number> = {};
        logs.forEach(l => {
            const s = l.referrer ? new URL(l.referrer).hostname : 'Direct / Unknown';
            sourceCounts[s] = (sourceCounts[s] || 0) + 1;
        });

        // History by day
        const dayCounts: Record<string, number> = {};
        views.forEach(v => {
            const date = new Date(v.created_at).toISOString().split('T')[0];
            dayCounts[date] = (dayCounts[date] || 0) + 1;
        });

        return {
            pageViews: views.length,
            cvDownloads: downloads.length,
            projectClicks: clicks.length,
            pages: Object.entries(pageCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
            sources: Object.entries(sourceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
            history: Object.entries(dayCounts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
        };
    }
};

// API Configuration API
export const apiConfigAPI = {
    async getAll(): Promise<APIConfiguration[]> {
        const { data, error } = await supabase
            .from('api_configurations')
            .select('*')
            .order('service_name', { ascending: true });

        if (error) {
            console.error('Error fetching API configs:', error);
            return [];
        }
        return data || [];
    },

    async update(id: string, updates: Partial<APIConfiguration>): Promise<boolean> {
        const { error } = await supabase
            .from('api_configurations')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating API config:', error);
            return false;
        }
        return true;
    }
};

export const blogAPI = {
    async getAll(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
        return data || [];
    },

    async getBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Error fetching blog post:', error);
            return null;
        }
        return data;
    },

    async create(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'slug'>): Promise<BlogPost | null> {
        const slug = post.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([{ ...post, slug }])
            .select()
            .single();

        if (error) {
            console.error('Error creating blog post:', error);
            return null;
        }
        return data;
    },

    async update(id: string, updates: Partial<BlogPost>): Promise<boolean> {
        // If title changes, we might want to update slug too, but let's keep it simple for now
        const { error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating blog post:', error);
            return false;
        }
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting blog post:', error);
            return false;
        }
        return true;
    }
};
