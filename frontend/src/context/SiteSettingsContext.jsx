import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
    const [siteSettings, setSiteSettings] = useState({
        site_name: 'RB Trading',
        contact_email: 'support@rbtrading.com',
        contact_phone: '+880 1234-567890',
        address: 'Dhaka, Bangladesh',
        facebook_link: '',
        twitter_link: '',
        instagram_link: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('site-settings/');
                if (response.data) {
                    setSiteSettings(prev => ({ ...prev, ...response.data }));
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch site settings", error);
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ siteSettings, loading }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export default SiteSettingsContext;
