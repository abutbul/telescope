import { PortfolioTemplate, PortfolioSection } from '../types';

/**
 * Modern Portfolio Template
 * Inspired by dev-portfolio with a clean, professional design
 */
export const modernPortfolioTemplate: PortfolioTemplate = {
  id: 'portfolio-modern',
  name: 'Modern Developer Portfolio',
  description: 'A fully customizable portfolio website with dark mode, animations, and multiple sections for showcasing your work',
  category: 'professional',
  preview: '/templates/previews/portfolio-modern.png',
  author: 'Telescope',
  stars: 2100,
  difficulty: 'intermediate',
  lastUpdated: '2025-11-22',
  tags: ['portfolio', 'website', 'dark-mode', 'responsive', 'animations'],
  mode: 'portfolio',
  features: ['dark-mode', 'animations', 'responsive', 'github-pages'],

  defaultTheme: {
    name: 'Dark Professional',
    accentColor: '#3D84C6',
    background: '#121212',
    color: '#eeeeee',
    cardBackground: '#1B1B1B',
    cardBorderColor: '#ffffff20',
    mode: 'dark',
  },

  defaultNav: {
    logo: {
      source: '/images/logo.png',
      height: 45,
      width: 50,
    },
    sections: [
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
      { title: 'Skills', href: '/skills' },
      { title: 'Education', href: '/education' },
      { title: 'Experience', href: '/experience' },
      { title: 'Projects', href: '/projects' },
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
        roles: ['a Developer', 'a Designer', 'a Creator'],
      },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About',
      enabled: true,
      order: 1,
      data: {
        content: 'I am a passionate developer who loves creating beautiful and functional applications. I have experience in building web and mobile applications using modern technologies.\n\nI enjoy learning new things and sharing knowledge with others. When I\'m not coding, you can find me exploring new technologies, reading tech blogs, or contributing to open-source projects.',
        imageSource: '/images/about/profile.png',
      },
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      enabled: true,
      order: 2,
      data: {
        intro: 'I love to learn new things and experiment with new technologies.\nThese are some of the major languages, technologies, tools and platforms I have worked with:',
        skills: [
          {
            title: 'Languages',
            items: [
              { icon: '/images/skills/js.png', title: 'JavaScript' },
              { icon: '/images/skills/ts.png', title: 'TypeScript' },
              { icon: '/images/skills/python.png', title: 'Python' },
            ],
          },
          {
            title: 'Frameworks & Technologies',
            items: [
              { icon: '/images/skills/react.png', title: 'React' },
              { icon: '/images/skills/node.png', title: 'Node.js' },
              { icon: '/images/skills/next.png', title: 'Next.js' },
            ],
          },
          {
            title: 'Tools & Platforms',
            items: [
              { icon: '/images/skills/git.png', title: 'Git' },
              { icon: '/images/skills/docker.png', title: 'Docker' },
              { icon: '/images/skills/aws.png', title: 'AWS' },
            ],
          },
        ],
      },
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      enabled: true,
      order: 3,
      data: {
        education: [
          {
            title: '2018 - 2022',
            cardTitle: 'B.S. Computer Science',
            cardSubtitle: 'University Name, City',
            cardDetailedText: 'GPA: 3.8/4.0',
          },
          {
            title: '2014 - 2018',
            cardTitle: 'High School Diploma',
            cardSubtitle: 'High School Name, City',
            cardDetailedText: 'Graduated with honors',
          },
        ],
      },
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      enabled: true,
      order: 4,
      data: {
        experiences: [
          {
            title: 'Senior Software Engineer',
            subtitle: 'Tech Company',
            workType: 'Full-time',
            workDescription: [
              'Led development of **microservices** architecture serving 1M+ users',
              'Mentored junior developers and conducted code reviews',
              'Improved application performance by **40%**',
            ],
            dateText: '01/2022 – Present',
          },
          {
            title: 'Software Engineer',
            subtitle: 'Startup Inc',
            workType: 'Full-time',
            workDescription: [
              'Built responsive web applications using **React** and **TypeScript**',
              'Implemented CI/CD pipelines reducing deployment time by 60%',
            ],
            dateText: '06/2020 – 12/2021',
          },
          {
            title: 'Software Engineering Intern',
            subtitle: 'Tech Corp',
            workType: 'Internship',
            workDescription: [
              'Developed internal tools using **Python** and **Flask**',
              'Collaborated with cross-functional teams on new features',
            ],
            dateText: '05/2019 – 08/2019',
          },
        ],
      },
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      enabled: true,
      order: 5,
      data: {
        projects: [
          {
            image: '/images/projects/project1.png',
            title: 'Portfolio Website',
            bodyText: '- Modern portfolio website built with **React** and **TypeScript**\n- Features dark mode, animations, and responsive design\n- Deployed on GitHub Pages',
            links: [
              { text: 'GitHub', href: 'https://github.com/username/portfolio' },
              { text: 'Live', href: 'https://username.github.io' },
            ],
            tags: ['React', 'TypeScript', 'Tailwind CSS'],
          },
          {
            title: 'Task Management App',
            bodyText: '- Full-stack application with **Node.js** backend\n- Real-time updates using WebSockets\n- JWT authentication',
            links: [
              { text: 'GitHub', href: 'https://github.com/username/task-app' },
            ],
            tags: ['Node.js', 'React', 'MongoDB', 'WebSocket'],
          },
          {
            title: 'AI Chat Bot',
            bodyText: '- Intelligent chatbot powered by **OpenAI API**\n- Context-aware conversations\n- Multi-language support',
            links: [
              { text: 'GitHub', href: 'https://github.com/username/chatbot' },
            ],
            tags: ['Python', 'OpenAI', 'FastAPI'],
          },
        ],
      },
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      enabled: true,
      order: 6,
      data: {
        email: 'your.email@example.com',
        location: 'San Francisco, CA',
        social: [
          { network: 'github', href: 'https://github.com/username' },
          { network: 'linkedin', href: 'https://linkedin.com/in/username' },
          { network: 'twitter', href: 'https://twitter.com/username' },
          { network: 'email', href: 'mailto:your.email@example.com' },
        ],
      },
    },
  ],

  variables: [
    {
      key: 'siteName',
      label: 'Site Name',
      type: 'text',
      placeholder: 'John Doe Portfolio',
      required: true,
      description: 'The name shown in browser tab and header',
      section: 'general',
    },
    {
      key: 'faviconUrl',
      label: 'Favicon URL',
      type: 'url',
      placeholder: '/images/favicon.png',
      required: false,
      description: 'Custom favicon for your site',
      section: 'general',
    },
    {
      key: 'resumeUrl',
      label: 'Resume URL',
      type: 'url',
      placeholder: 'https://drive.google.com/your-resume',
      required: false,
      description: 'Link to your resume (Google Drive, Dropbox, etc.)',
      section: 'general',
    },
  ],
};
