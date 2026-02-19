import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "nav": {
                "home": "HOME",
                "about": "WHO I AM",
                "cv": "CV",
                "portfolio": "PORTFOLIO",
                "blog": "BLOG",
                "contact": "GET IN TOUCH"
            },
            "hero": {
                "description": "Lorem ipsum dolor sit amet consectetur. Lorem morbi adipiscing netus nibh ut vel ipsum fringilla cursus. Neque blandit vestibulum sem eu viverra. Massa lorem nisl ultrices ultricies diam vitae nunc. Tristique in blandit imperdiet ante viverra tempus. Sem porttitor urna faucibus lacus. Velit lorem eu morbi vel diam etiam tincidunt dictum nunc. Accumsan varius purus auctor ullamcorper in neque orci ultrices. Purus rhoncus viverra massa sed justo."
            },
            "storytelling": {
                "main": "Storytelling has always been essential in shaping our understanding of the world around us.",
                "secondary": "With the rapid evolution of technology, the way we tell stories has been completely transformed. It not only amplifies their impact but also makes them more accessible to everyone, opening up new possibilities for immersion and interaction. At Soleil Noir, we take storytelling to the next level by blending creativity and technology. Immersive storytelling is our specialty—crafting experiences where audiences don’t just follow a narrative, they become part of it."
            },
            "portfolio": {
                "title": "SELECTED WORKS",
                "filter_by": "FILTER BY:",
                "learn_more": "LEARN MORE →",
                "view_all": "VIEW ALL",
                "view_project": "VIEW PROJECT"
            },
            "about": {
                "hero_subtitle": "Learn a bit more about me!",
                "personal_label": "Personal",
                "hobbies_title": "Hobbies &<br />Interests",
                "collaboration_label": "Collaboration",
                "colleagues_title": "Colleagues who<br />worked with me"
            },
            "footer": {
                "touch": "GET IN TOUCH",
                "rights": "© 2026, Vinicius Campos ⏤ All rights reserved"
            },
            "common": {
                "read_all": "READ ALL",
                "read_less": "READ LESS"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
