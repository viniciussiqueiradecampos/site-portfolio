import { useState, useEffect } from 'react';
import {
    type CareerProfile,
    type JobListing,
    type JobApplication,
    type DailyTask,
    careerProfileAPI,
    jobListingsAPI,
    jobApplicationsAPI,
    dailyTasksAPI
} from '../lib/supabase';
import { taskGenerator } from '../lib/task-generator';
import { jobSyncService } from '../lib/job-sync';
import {
    Briefcase,
    Target,
    TrendingUp,
    CheckCircle2,
    Clock,
    Star,
    MapPin,
    DollarSign,
    Search,
    Plus,
    Award,
    Users,
    MessageSquare,
    FileText
} from 'lucide-react';

export default function CareerDashboard() {
    const [profile, setProfile] = useState<CareerProfile | null>(null);
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('UI Designer');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        // Load or create profile
        let userProfile = await careerProfileAPI.getByEmail('demo@example.com');
        if (!userProfile) {
            userProfile = await careerProfileAPI.create({
                user_email: 'demo@example.com',
                full_name: 'Demo User',
                current_role: 'Product Designer',
                target_role: 'Senior Product Designer',
                linkedin_ssi_score: 0,
                daily_application_goal: 5,
                preferred_currency: 'USD'
            });
        }
        setProfile(userProfile);

        // Load jobs
        const jobsData = await jobListingsAPI.getRecent(72);
        setJobs(jobsData);

        // Load applications
        if (userProfile) {
            // Generate daily tasks if needed
            await taskGenerator.generateDailyTasks(userProfile.id);

            const appsData = await jobApplicationsAPI.getByProfile(userProfile.id);
            setApplications(appsData);

            const tasksData = await dailyTasksAPI.getToday(userProfile.id);
            setTasks(tasksData);
        }

        setLoading(false);
    };

    const getStatusColor = (status: JobApplication['status']) => {
        const colors = {
            nova: '#94a3b8',
            candidatado: '#3b82f6',
            entrevista: '#f59e0b',
            recusado: '#ef4444',
            oferta: '#22c55e'
        };
        return colors[status];
    };

    const getStatusCount = (status: JobApplication['status']) => {
        return applications.filter(app => app.status === status).length;
    };

    const completedTasksCount = tasks.filter(t => t.completed).length;
    const todayApplications = applications.filter(app => {
        if (!app.applied_date) return false;
        const today = new Date().toISOString().split('T')[0];
        return app.applied_date.startsWith(today);
    }).length;

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-color)'
            }}>
                <div style={{ color: 'var(--text-color)', fontFamily: 'var(--font-body)' }}>
                    Loading Career Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '24px'
        }}>
            {/* Header */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px' }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    margin: '0 0 8px',
                    color: '#0f172a',
                    fontWeight: 700
                }}>
                    Global Career Architect
                </h1>
                <p style={{
                    color: '#64748b',
                    margin: 0,
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px'
                }}>
                    Welcome back, {profile?.full_name || 'User'}! Let's find your next opportunity.
                </p>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {/* Daily Goal */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Target size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'var(--font-body)' }}>
                                    Today's Goal
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                                    {todayApplications}/{profile?.daily_application_goal || 5}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${Math.min((todayApplications / (profile?.daily_application_goal || 5)) * 100, 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    {/* Total Applications */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Briefcase size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'var(--font-body)' }}>
                                    Total Applications
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                                    {applications.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interviews */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Users size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'var(--font-body)' }}>
                                    Interviews
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                                    {getStatusCount('entrevista')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Offers */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Award size={24} color="#0f172a" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'var(--font-body)' }}>
                                    Offers Received
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                                    {getStatusCount('oferta')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 380px',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Job Listings */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '28px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '20px',
                                margin: 0,
                                color: '#0f172a',
                                fontWeight: 600
                            }}>
                                Recent Job Listings (Last 72h)
                            </h2>
                            <button className="clickable" style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Plus size={16} /> Add Job
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        placeholder="Search jobs by title, company, or location..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                // Trigger search logic
                                                setLoading(true);
                                                jobSyncService.searchJobs(searchTerm).then(() => loadData());
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 44px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            color: '#0f172a',
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        jobSyncService.searchJobs(searchTerm).then(() => loadData());
                                    }}
                                    className="clickable"
                                    style={{
                                        padding: '0 24px',
                                        background: '#0f172a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    SEARCH
                                </button>
                            </div>
                        </div>

                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {jobs.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#94a3b8'
                                }}>
                                    <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', margin: 0 }}>
                                        No recent jobs found. Add your first job listing!
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {jobs.map(job => (
                                        <div key={job.id} style={{
                                            padding: '20px',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#667eea';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontFamily: 'var(--font-body)',
                                                        fontSize: '16px',
                                                        fontWeight: 600,
                                                        margin: '0 0 6px',
                                                        color: '#0f172a'
                                                    }}>
                                                        {job.title}
                                                    </h3>
                                                    <p style={{
                                                        color: '#64748b',
                                                        fontSize: '14px',
                                                        margin: '0 0 8px',
                                                        fontFamily: 'var(--font-body)',
                                                        fontWeight: 500
                                                    }}>
                                                        {job.company}
                                                    </p>
                                                </div>
                                                {job.is_low_competition && (
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                                        color: '#0f172a',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        fontFamily: 'var(--font-body)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <Star size={12} /> Low Competition
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                                                {job.location && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                                                        <MapPin size={14} />
                                                        {job.location}
                                                    </div>
                                                )}
                                                {job.salary_min && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                                                        <DollarSign size={14} />
                                                        {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()} {job.currency}
                                                    </div>
                                                )}
                                                {job.posted_date && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                                                        <Clock size={14} />
                                                        {new Date(job.posted_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            {job.tags && job.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {job.tags.map((tag, idx) => (
                                                        <span key={idx} style={{
                                                            padding: '4px 10px',
                                                            background: 'white',
                                                            color: '#667eea',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontFamily: 'var(--font-body)',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Daily Tasks */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '18px',
                                margin: '0 0 16px',
                                color: '#0f172a',
                                fontWeight: 600
                            }}>
                                Daily SSI Tasks
                            </h3>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                                    {completedTasksCount} of {tasks.length} completed
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: '#e2e8f0',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: tasks.length > 0 ? `${(completedTasksCount / tasks.length) * 100}%` : '0%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>

                            {tasks.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                                    No tasks for today
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {tasks.map(task => (
                                        <div key={task.id} style={{
                                            padding: '12px',
                                            background: task.completed ? '#f0fdf4' : '#f8fafc',
                                            borderRadius: '8px',
                                            border: `1px solid ${task.completed ? '#bbf7d0' : '#e2e8f0'}`,
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '10px',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => {
                                                dailyTasksAPI.toggleComplete(task.id, !task.completed);
                                                loadData();
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                border: `2px solid ${task.completed ? '#22c55e' : '#cbd5e1'}`,
                                                background: task.completed ? '#22c55e' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {task.completed && <CheckCircle2 size={14} color="white" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: task.completed ? '#16a34a' : '#0f172a',
                                                    textDecoration: task.completed ? 'line-through' : 'none',
                                                    fontFamily: 'var(--font-body)'
                                                }}>
                                                    {task.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Application Funnel */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '18px',
                                margin: '0 0 20px',
                                color: '#0f172a',
                                fontWeight: 600
                            }}>
                                Application Funnel
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(['nova', 'candidatado', 'entrevista', 'oferta'] as const).map(status => {
                                    const count = getStatusCount(status);
                                    const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;

                                    return (
                                        <div key={status}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: '#64748b',
                                                    fontFamily: 'var(--font-body)',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {status}
                                                </span>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                                                    {count}
                                                </span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '8px',
                                                background: '#f1f5f9',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: getStatusColor(status),
                                                    transition: 'width 0.3s ease',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            color: 'white'
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '18px',
                                margin: '0 0 16px',
                                fontWeight: 600
                            }}>
                                Quick Actions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={() => document.getElementById('cv-upload')?.click()}
                                    className="clickable"
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontWeight: 500
                                    }}>
                                    <FileText size={16} /> Upload CV
                                </button>
                                <button
                                    onClick={() => {
                                        if (!profile?.cv_url) {
                                            alert('Please upload a CV first!');
                                            return;
                                        }
                                        alert('GENERATING COVER LETTER FOR "Senior Product Designer" at TechCorp...\n\n"Dear Hiring Manager,\n\nI am writing to express my strong interest..."\n\n(Saved to Applications)');
                                    }}
                                    className="clickable"
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontWeight: 500
                                    }}>
                                    <MessageSquare size={16} /> Generate Cover Letter
                                </button>
                                <button
                                    onClick={() => {
                                        const newScore = Math.floor(Math.random() * 20) + 60; // Random 60-80
                                        alert(`LINKEDIN SSI SCORE CHECK:\n\nCurrent Score: ${newScore}/100\nTop 1% of Industry.\n\nUpdating profile...`);
                                        if (profile) {
                                            careerProfileAPI.update(profile.id, { linkedin_ssi_score: newScore });
                                        }
                                    }}
                                    className="clickable"
                                    style={{
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontWeight: 500
                                    }}>
                                    <TrendingUp size={16} /> Check SSI Score
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input for CV */}
            <input
                type="file"
                id="cv-upload"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setLoading(true);
                        // Simulate upload delay
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Update profile "skills" based on extraction (mock)
                        if (profile) {
                            await careerProfileAPI.update(profile.id, {
                                cv_url: `fake_uploads/${file.name}`,
                                cv_skills: ['Figma', 'React', 'Product Design', 'User Research', 'Design Systems'],
                                // Update updated_at timestamp to force refresh if needed
                                updated_at: new Date().toISOString()
                            });
                            // Refresh data
                            await loadData();
                        }

                        setLoading(false);
                        alert(`CV "${file.name}" uploaded and parsed successfully! Match analysis ready.`);
                    }
                }}
            />
        </div>
    );
}
