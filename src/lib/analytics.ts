import { analyticsAPI } from './supabase';

// Extend the Window interface to include dataLayer
declare global {
    interface Window {
        dataLayer: any[];
    }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
}

export interface AnalyticsEvent {
    event_type: 'page_view' | 'project_click' | 'cv_download' | 'button_click' | 'link_click';
    page_path?: string;
    project_id?: string;
    project_title?: string;
    referrer?: string;
    user_agent?: string;
    button_text?: string;
    link_url?: string;
}

/**
 * Unified analytics function that sends events to both GTM and Supabase
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
    try {
        // 1. Send to Google Tag Manager
        if (typeof window !== 'undefined' && window.dataLayer) {
            const gtmEvent: any = {
                event: event.event_type,
                page_path: event.page_path || window.location.pathname,
                page_title: document.title,
                page_location: window.location.href,
                referrer: event.referrer || document.referrer,
            };

            // Add event-specific data
            if (event.project_id) {
                gtmEvent.project_id = event.project_id;
                gtmEvent.project_title = event.project_title;
            }

            if (event.button_text) {
                gtmEvent.button_text = event.button_text;
            }

            if (event.link_url) {
                gtmEvent.link_url = event.link_url;
            }

            window.dataLayer.push(gtmEvent);
            console.log('📊 GTM Event:', gtmEvent);
        }

        // 2. Send to Supabase
        const supabaseEvent: any = {
            event_type: event.event_type,
            page_path: event.page_path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
            referrer: event.referrer || (typeof window !== 'undefined' ? document.referrer : ''),
            user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        };

        if (event.project_id) {
            supabaseEvent.project_id = event.project_id;
        }

        await analyticsAPI.logEvent(supabaseEvent);
        console.log('💾 Supabase Event:', supabaseEvent);

    } catch (error) {
        console.error('Analytics Error:', error);
    }
};

/**
 * Track page view
 */
export const trackPageView = (pagePath?: string): void => {
    trackEvent({
        event_type: 'page_view',
        page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        referrer: typeof window !== 'undefined' ? document.referrer : '',
    });
};

/**
 * Track project click
 */
export const trackProjectClick = (projectId: string, projectTitle: string): void => {
    trackEvent({
        event_type: 'project_click',
        project_id: projectId,
        project_title: projectTitle,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
};

/**
 * Track CV download
 */
export const trackCVDownload = (): void => {
    trackEvent({
        event_type: 'cv_download',
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonText: string): void => {
    trackEvent({
        event_type: 'button_click',
        button_text: buttonText,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
};

/**
 * Track link click
 */
export const trackLinkClick = (linkUrl: string): void => {
    trackEvent({
        event_type: 'link_click',
        link_url: linkUrl,
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
};
