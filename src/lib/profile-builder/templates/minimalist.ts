import { ProfileTemplate } from '../types';

export const minimalistTemplate: ProfileTemplate = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Clean and simple profile focusing on essentials',
  category: 'minimalist',
  preview: '/templates/previews/minimalist.png',
  author: 'Telescope',
  stars: 750,
  difficulty: 'beginner',
  lastUpdated: '2025-11-22',
  tags: ['simple', 'clean', 'minimal', 'beginner-friendly'],
  mode: 'readme',
  
  markdown: `### Hey there 👋

I'm **{{name}}**, {{tagline}}

{{aboutMe}}

#### 💼 What I'm up to

- 🔭 Working on: {{currentWork}}
- 🌱 Learning: {{currentLearning}}
- 💬 Ask me about: {{expertise}}

#### 🛠️ Technologies

<!-- WIDGET:tech-stack-badges -->

#### 📈 Stats

<!-- WIDGET:github-stats -->

#### 📫 Reach me

<!-- WIDGET:social-links -->

---

*Last updated: {{lastUpdated}}*
`,

  variables: [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'John Doe',
      required: true
    },
    {
      key: 'username',
      label: 'GitHub Username',
      type: 'text',
      placeholder: 'johndoe',
      required: true
    },
    {
      key: 'tagline',
      label: 'One-liner',
      type: 'text',
      placeholder: 'a software developer',
      required: true
    },
    {
      key: 'aboutMe',
      label: 'About',
      type: 'textarea',
      placeholder: 'A brief intro...',
      required: true
    },
    {
      key: 'currentWork',
      label: 'Current Work',
      type: 'text',
      placeholder: 'My awesome project',
      required: false
    },
    {
      key: 'currentLearning',
      label: 'Currently Learning',
      type: 'text',
      placeholder: 'Rust, Go',
      required: false
    },
    {
      key: 'expertise',
      label: 'Areas of Expertise',
      type: 'text',
      placeholder: 'React, TypeScript, Node.js',
      required: false
    }
  ],

  widgets: [
    {
      id: 'tech-stack',
      name: 'Tech Stack',
      description: 'Simple technology badges',
      marker: '<!-- WIDGET:tech-stack-badges -->',
      allowedTypes: ['tech-stack-badges'],
      defaultWidget: 'tech-stack-badges'
    },
    {
      id: 'github-stats',
      name: 'GitHub Stats',
      description: 'Basic GitHub stats',
      marker: '<!-- WIDGET:github-stats -->',
      allowedTypes: ['github-stats'],
      defaultWidget: 'github-stats'
    },
    {
      id: 'social-links',
      name: 'Social Links',
      description: 'Contact links',
      marker: '<!-- WIDGET:social-links -->',
      allowedTypes: ['social-links'],
      defaultWidget: 'social-links'
    }
  ]
};
