import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "nav": {
                "home": "HOME",
                "cv": "CV",
                "portfolio": "PORTFOLIO",
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
                "learn_more": "Learn More"
            },
            "footer": {
                "rights": "© 2026, Vinicius Campos ⏤ All rights reserved"
            }
        }
    },
    pt: {
        translation: {
            "nav": {
                "home": "INÍCIO",
                "cv": "CV",
                "portfolio": "PORTFÓLIO",
                "contact": "CONTATO"
            },
            "hero": {
                "description": "Lorem ipsum dolor sit amet consectetur. O design e a tecnologia se unem para criar experiências memoráveis que transcendem o comum."
            },
            "storytelling": {
                "main": "Storytelling sempre foi essencial para moldar nossa compreensão do mundo ao nosso redor.",
                "secondary": "Com a rápida evolução da tecnologia, a maneira como contamos histórias foi completamente transformada. Não apenas amplifica o impacto, mas também as torna mais acessíveis a todos, abrindo novas possibilidades de imersão e interação. Na Soleil Noir, levamos o storytelling para o próximo nível."
            },
            "portfolio": {
                "learn_more": "Saiba Mais"
            },
            "footer": {
                "rights": "© 2026, Vinicius Campos ⏤ Todos os direitos reservados"
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
