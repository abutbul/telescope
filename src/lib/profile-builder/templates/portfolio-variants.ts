import { PortfolioTemplate } from '../types';

/**
 * Minimal Portfolio Template
 * Clean and simple portfolio with focus on content
 */
export const minimalPortfolioTemplate: PortfolioTemplate = {
  id: 'portfolio-minimal',
  name: 'Minimal Portfolio',
  description: 'A clean, minimalist portfolio website that puts your work front and center',
  category: 'minimalist',
  preview: '/templates/previews/portfolio-minimal.png',
  author: 'Telescope',
  stars: 1450,
  difficulty: 'beginner',
  lastUpdated: '2025-11-22',
  tags: ['portfolio', 'website', 'minimal', 'clean', 'simple'],
  mode: 'portfolio',
  features: ['light-mode', 'responsive', 'fast'],

  defaultTheme: {
    name: 'Light Minimal',
    accentColor: '#2563eb',
    background: '#ffffff',
    color: '#1f2937',
    cardBackground: '#f9fafb',
    cardBorderColor: '#e5e7eb',
    mode: 'light',
  },

  defaultNav: {
    sections: [
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
      { title: 'Projects', href: '/projects' },
      { title: 'Contact', href: '/contact' },
    ],
  },

  defaultSections: [
    {
      id: 'home',
      type: 'home',
      title: 'Home',
      enabled: true,
      order: 0,
      data: {
        name: 'Your Name',
        roles: ['Developer', 'Designer'],
      },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About',
      enabled: true,
      order: 1,
      data: {
        content: 'Hello! I\'m a developer passionate about building great products. I focus on creating clean, user-friendly experiences.',
        imageSource: '',
      },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      enabled: true,
      order: 2,
      data: {
        projects: [
          {
            title: 'Project One',
            bodyText: 'A brief description of your project and what makes it special.',
            links: [
              { text: 'View', href: '#' },
            ],
            tags: ['React', 'Node.js'],
          },
          {
            title: 'Project Two',
            bodyText: 'Another project showcasing your skills and creativity.',
            links: [
              { text: 'View', href: '#' },
            ],
            tags: ['TypeScript', 'GraphQL'],
          },
        ],
      },
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      enabled: true,
      order: 3,
      data: {
        email: 'hello@example.com',
        social: [
          { network: 'github', href: 'https://github.com' },
          { network: 'linkedin', href: 'https://linkedin.com' },
        ],
      },
    },
  ],

  variables: [
    {
      key: 'siteName',
      label: 'Site Name',
      type: 'text',
      placeholder: 'Your Name',
      required: true,
      section: 'general',
    },
  ],
};

/**
 * Creative Portfolio Template
 * Bold, animated portfolio for creative professionals
 */
export const creativePortfolioTemplate: PortfolioTemplate = {
  id: 'portfolio-creative',
  name: 'Creative Portfolio',
  description: 'A bold, animated portfolio with unique design elements for creative professionals',
  category: 'creative',
  preview: '/templates/previews/portfolio-creative.png',
  author: 'Telescope',
  stars: 1820,
  difficulty: 'intermediate',
  lastUpdated: '2025-11-22',
  tags: ['portfolio', 'website', 'creative', 'animated', 'bold'],
  mode: 'portfolio',
  features: ['dark-mode', 'animations', 'responsive', 'creative-design'],

  defaultTheme: {
    name: 'Creative Dark',
    accentColor: '#f472b6',
    background: '#0f0f0f',
    color: '#f5f5f5',
    cardBackground: '#1a1a1a',
    cardBorderColor: '#333333',
    mode: 'dark',
  },

  defaultNav: {
    sections: [
      { title: 'Home', href: '/' },
      { title: 'Work', href: '/projects' },
      { title: 'About', href: '/about' },
      { title: 'Contact', href: '/contact' },
    ],
  },

  defaultSections: [
    {
      id: 'home',
      type: 'home',
      title: 'Home',
      enabled: true,
      order: 0,
      data: {
        name: 'Your Name',
        roles: ['Creative Developer', 'UI Designer', 'Problem Solver'],
        backgroundImage: '/images/hero-bg.jpg',
      },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'Work',
      enabled: true,
      order: 1,
      data: {
        projects: [
          {
            image: '/images/projects/creative1.jpg',
            title: 'Brand Identity',
            bodyText: 'Complete brand identity design including logo, color palette, and guidelines.',
            tags: ['Branding', 'Design'],
          },
          {
            image: '/images/projects/creative2.jpg',
            title: 'Web Experience',
            bodyText: 'Interactive web experience with custom animations and micro-interactions.',
            tags: ['Web', 'Animation'],
          },
        ],
      },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About',
      enabled: true,
      order: 2,
      data: {
        content: 'I\'m a creative developer who bridges the gap between design and technology. I create digital experiences that are both beautiful and functional.',
        imageSource: '/images/about/creative-profile.jpg',
      },
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      enabled: true,
      order: 3,
      data: {
        email: 'hello@creative.com',
        social: [
          { network: 'dribbble', href: 'https://dribbble.com' },
          { network: 'behance', href: 'https://behance.net' },
          { network: 'instagram', href: 'https://instagram.com' },
        ],
      },
    },
  ],

  variables: [
    {
      key: 'siteName',
      label: 'Site Name',
      type: 'text',
      placeholder: 'Creative Studio',
      required: true,
      section: 'general',
    },
    {
      key: 'heroVideo',
      label: 'Hero Background Video URL',
      type: 'url',
      placeholder: 'https://example.com/hero.mp4',
      required: false,
      description: 'Optional video background for hero section',
      section: 'hero',
    },
  ],
};
