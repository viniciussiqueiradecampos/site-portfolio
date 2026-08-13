import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "nav": {
                "home": "home",
                "about_me": "about me",
                "about": "about",
                "cv": "cv",
                "portfolio": "portfolio",
                "blog": "blog",
                "get_in_touch": "get in touch"
            },
            "hero": {
                "view_portfolio": "VIEW PORTFOLIO →",
                "view_cv": "VIEW CV"
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
                "rights": "© 2026, Vinicius Campos ⏤ All rights reserved"
            },
            "common": {
                "read_all": "READ ALL",
                "read_less": "READ LESS"
            }
        }
    },
    pt: {
        translation: {
            "nav": {
                "home": "home",
                "about_me": "sobre mim",
                "about": "sobre",
                "cv": "cv",
                "portfolio": "portfólio",
                "blog": "blog",
                "get_in_touch": "get in touch"
            },
            "hero": {
                "view_portfolio": "ACESSAR PORTFÓLIO →",
                "view_cv": "VER CV"
            },
            "portfolio": {
                "title": "TRABALHOS SELECIONADOS",
                "filter_by": "FILTRAR POR:",
                "learn_more": "SAIBA MAIS →",
                "view_all": "VER TODOS",
                "view_project": "VER PROJETO"
            },
            "about": {
                "hero_subtitle": "Conheça um pouco mais sobre mim!",
                "personal_label": "Pessoal",
                "hobbies_title": "Hobbies &<br />Interesses",
                "collaboration_label": "Colaboração",
                "colleagues_title": "Colegas que<br />trabalharam comigo"
            },
            "footer": {
                "rights": "© 2026, Vinicius Campos ⏤ Todos os direitos reservados"
            },
            "common": {
                "read_all": "LER TUDO",
                "read_less": "LER MENOS"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
