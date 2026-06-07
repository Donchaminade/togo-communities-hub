import { Community, NeighborhoodData } from '../types';

export const NEIGHBORHOODS: NeighborhoodData[] = [
  {
    id: 'agoe',
    name: 'Agoè-Nyivé',
    displayName: 'Agoè-Nyivé',
    x: 230,
    y: 70,
    description: 'Zone nord en pleine expansion, abritant de nombreux développeurs et pôles de formation.'
  },
  {
    id: 'adidogome',
    name: 'Adidogomé',
    displayName: 'Adidogomé',
    x: 80,
    y: 150,
    description: 'Quartier ouest résidentiel et dynamique, très proche de plusieurs instituts technologiques.'
  },
  {
    id: 'totsi',
    name: 'Totsi & Cacaveli',
    displayName: 'Totsi & Cacaveli',
    x: 200,
    y: 160,
    description: 'Zone résidentielle centrale avec une forte concentration de startups et de meetups.'
  },
  {
    id: 'tokoin',
    name: 'Tokoin & Cocotiers',
    displayName: 'Tokoin & Cocotiers',
    x: 300,
    y: 190,
    description: 'Le cœur administratif et universitaire de Lomé, hébergeant des hubs de coworking.'
  },
  {
    id: 'deckon',
    name: 'Déckon (Centre-Ville)',
    displayName: 'Déckon & Centre-Ville',
    x: 310,
    y: 280,
    description: 'Le quartier des affaires de Lomé, centre névralgique de la connectivité et du commerce digital.'
  },
  {
    id: 'nyekonakpoe',
    name: 'Nyékonakpoé',
    displayName: 'Nyékonakpoé',
    x: 160,
    y: 290,
    description: 'Zone culturelle et créative près de la frontière, prisée par les designers et artistes numériques.'
  },
  {
    id: 'be',
    name: 'Bè & Akodésséwa',
    displayName: 'Bè & Akodésséwa',
    x: 410,
    y: 290,
    description: 'Quartier historique bordant la lagune et l\'océan, accueillant des initiatives tech communautaires.'
  },
  {
    id: 'baguida',
    name: 'Baguida & Port',
    displayName: 'Baguida & Port',
    x: 470,
    y: 210,
    description: 'Secteur côtier est et zone portuaire, propice au travail à distance et aux retraites de code.'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    name: 'GDG Lomé',
    description: 'Le Google Developer Group de Lomé est une communauté de passionnés des technologies Google (Android, Web, Firebase, Google Cloud, AI). Nous organisons des conférences, ateliers de code et le célèbre DevFest Lomé annuel pour connecter et former les talents locaux.',
    logoUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // High quality abstract placeholder
    tags: ['Google Tech', 'Web', 'Mobile', 'Cloud', 'AI'],
    whatsappUrl: 'https://chat.whatsapp.com/GdgLomeCommunityExample',
    telegramUrl: 'https://t.me/gdglome',
    linkedinUrl: 'https://linkedin.com/company/gdg-lome',
    twitterUrl: 'https://twitter.com/gdglome',
    websiteUrl: 'https://gdg.community.dev/gdg-lome/',
    neighborhood: 'Tokoin & Cocotiers',
    lat: 6.1650,
    lng: 1.2210,
    leaderName: 'Koffi Mensah',
    leaderEmail: 'koffi.mensah@example.com',
    leaderPhone: '+228 90 12 34 56',
    status: 'approved',
    createdAt: new Date('2026-01-10T10:00:00Z')
  },
  {
    name: 'Women Techmakers Lomé',
    description: 'Une communauté dédiée à la promotion et à l\'autonomisation des femmes dans le secteur technologique au Togo. Nous offrons de la visibilité, de la formation professionnelle, du mentorat et créons un espace sécurisé pour inspirer plus de filles à embrasser les carrières STEM.',
    logoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['Inclusion', 'Web', 'Mentorat', 'UX/UI'],
    whatsappUrl: 'https://chat.whatsapp.com/WtmLomeExample',
    telegramUrl: '',
    linkedinUrl: 'https://linkedin.com/company/wtm-lome',
    twitterUrl: 'https://twitter.com/wtmlome',
    websiteUrl: '',
    neighborhood: 'Tokoin & Cocotiers',
    lat: 6.1670,
    lng: 1.2220,
    leaderName: 'Afiwa Sika',
    leaderEmail: 'afiwa.sika@example.com',
    leaderPhone: '+228 91 23 45 67',
    status: 'approved',
    createdAt: new Date('2026-01-15T14:30:00Z')
  },
  {
    name: 'Togo Cybersecurity Community',
    description: 'Regroupement de professionnels et d\'étudiants passionnés de sécurité de l\'information au Togo. Ateliers pratiques sur le Pentesting, la défense des réseaux, l\'analyse de malwares et la sensibilisation au hacking éthique. Nous défendons un cyberespace togolais plus sûr !',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['Sécurité', 'Ethical Hacking', 'Réseaux', 'Linux'],
    whatsappUrl: 'https://chat.whatsapp.com/TogoCybersec',
    telegramUrl: 'https://t.me/togocybersec',
    linkedinUrl: 'https://linkedin.com/company/togo-cybersecurity',
    twitterUrl: '',
    websiteUrl: 'https://cybersec.tg',
    neighborhood: 'Adidogomé',
    lat: 6.1810,
    lng: 1.1620,
    leaderName: 'Folly Koffi',
    leaderEmail: 'folly.cyber@example.com',
    leaderPhone: '+228 92 34 56 78',
    status: 'approved',
    createdAt: new Date('2026-02-01T09:00:00Z')
  },
  {
    name: 'Lomé Data Science',
    description: 'La communauté de référence pour le Machine Learning, le Deep Learning et le Big Data au Togo. Nous démystifions la science des données à travers des Bootcamps pratiques (Python, R, SQL) et des compétitions de prédiction de données.',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['Data Science', 'Python', 'AI / ML', 'Big Data'],
    whatsappUrl: '',
    telegramUrl: 'https://t.me/lomedatascience',
    linkedinUrl: 'https://linkedin.com/company/lome-data-science',
    twitterUrl: 'https://twitter.com/lomedata',
    websiteUrl: '',
    neighborhood: 'Totsi & Cacaveli',
    lat: 6.1950,
    lng: 1.1980,
    leaderName: 'Kokou Mawulikplim',
    leaderEmail: 'kokou.data@example.com',
    leaderPhone: '+228 93 45 67 89',
    status: 'approved',
    createdAt: new Date('2026-02-18T16:15:00Z')
  },
  {
    name: 'Designers du Togo (UX/UI)',
    description: 'Une communauté vibrante réunissant les UX/UI designers, graphistes, et concepteurs de produits numériques togolais. Nous organisons des sessions de revue de portfolios, des ateliers Figma et promouvons la centralité de l\'utilisateur dans le développement web et mobile.',
    logoUrl: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['UX / UI', 'Design', 'Figma', 'Product Design'],
    whatsappUrl: 'https://chat.whatsapp.com/TogoDesigners',
    telegramUrl: '',
    linkedinUrl: '',
    twitterUrl: 'https://twitter.com/designerstg',
    websiteUrl: 'https://designers.tg',
    neighborhood: 'Nyékonakpoé',
    lat: 6.1360,
    lng: 1.2020,
    leaderName: 'Yawo Mawunyo',
    leaderEmail: 'yawo.design@example.com',
    leaderPhone: '+228 97 65 43 21',
    status: 'approved',
    createdAt: new Date('2026-03-05T11:00:00Z')
  },
  {
    name: 'Lomé Dev Club',
    description: 'Un club d\'échange de compétences sur les technos de programmation modernes (React, Next.js, Flutter, Node.js, Rust). Nous organisons des séances hebdomadaires de revue de code et aidons les développeurs juniors à décrocher leurs premiers emplois à l\'international.',
    logoUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['React', 'NodeJS', 'Flutter', 'Open Source'],
    whatsappUrl: 'https://chat.whatsapp.com/LomeDevClub',
    telegramUrl: 'https://t.me/lomedevclub',
    linkedinUrl: 'https://linkedin.com/company/lomedevclub',
    twitterUrl: '',
    websiteUrl: '',
    neighborhood: 'Agoè-Nyivé',
    lat: 6.2250,
    lng: 1.2140,
    leaderName: 'Komi Agbessi',
    leaderEmail: 'komi.dev@example.com',
    leaderPhone: '+228 98 76 54 32',
    status: 'approved',
    createdAt: new Date('2026-03-12T08:20:00Z')
  }
];

export const AVAILABLE_TAGS = [
  'Google Tech',
  'Web',
  'Mobile',
  'Cloud',
  'AI / ML',
  'Inclusion',
  'Mentorat',
  'UX / UI',
  'Design',
  'Figma',
  'Sécurité',
  'Ethical Hacking',
  'Réseaux',
  'Data Science',
  'Python',
  'React',
  'NodeJS',
  'Flutter',
  'Open Source'
];
