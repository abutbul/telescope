import { ProfileTemplate } from '../types';

export const developerCardTemplate: ProfileTemplate = {
  id: 'developer-card',
  name: 'Developer Card',
  description: 'Clean, badge-heavy profile showcasing your tech stack and GitHub stats',
  category: 'visual',
  preview: '/templates/previews/developer-card.png',
  author: 'Telescope',
  stars: 1250,
  difficulty: 'beginner',
  lastUpdated: '2025-11-22',
  tags: ['badges', 'stats', 'clean', 'popular'],
  mode: 'readme',
  
  markdown: `<div align="center">
  <img src="{{headerImage}}" alt="Header" width="100%"/>
</div>

<h1 align="center">Hi there, I'm {{name}} 👋</h1>
<h3 align="center">{{tagline}}</h3>

<p align="center">
  <!-- WIDGET:social-links -->
</p>

---

## 🚀 About Me

{{aboutMe}}

- 🔭 I'm currently working on **{{currentWork}}**
- 🌱 I'm currently learning **{{currentLearning}}**
- 💬 Ask me about **{{askMeAbout}}**
- 📫 How to reach me: **{{email}}**
- ⚡ Fun fact: **{{funFact}}**

---

## 🛠 Tech Stack

<!-- WIDGET:tech-stack-badges -->

---

## 📊 GitHub Stats

<p align="center">
  <!-- WIDGET:github-stats -->
</p>

<p align="center">
  <!-- WIDGET:streak-stats -->
</p>

<p align="center">
  <!-- WIDGET:language-chart -->
</p>

---

## 🔥 Top Projects

<!-- WIDGET:top-repos -->

---

<p align="center">
  <img src="https://komarev.com/ghpvc/?username={{username}}&label=Profile%20views&color=0e75b6&style=flat" alt="profile views" />
</p>

<p align="center">
  <i>⚡ Let's connect and build something amazing together!</i>
</p>
`,

  variables: [
    {
      key: 'name',
      label: 'Your Name',
      type: 'text',
      placeholder: 'John Doe',
      required: true,
      description: 'Your full name or preferred name'
    },
    {
      key: 'username',
      label: 'GitHub Username',
      type: 'text',
      placeholder: 'johndoe',
      required: true,
      description: 'Your GitHub username (auto-filled)'
    },
    {
      key: 'tagline',
      label: 'Tagline',
      type: 'text',
      placeholder: 'Full Stack Developer | Open Source Enthusiast',
      required: true,
      description: 'A short description of what you do'
    },
    {
      key: 'headerImage',
      label: 'Header Image URL',
      type: 'url',
      placeholder: 'https://example.com/header.gif',
      required: false,
      description: 'Optional animated GIF or image for header'
    },
    {
      key: 'aboutMe',
      label: 'About Me',
      type: 'textarea',
      placeholder: 'I\'m a passionate developer who loves building innovative solutions...',
      required: true,
      description: 'Describe yourself and your interests'
    },
    {
      key: 'currentWork',
      label: 'Current Work',
      type: 'text',
      placeholder: 'Building awesome web applications',
      required: false,
      description: 'What are you currently working on?'
    },
    {
      key: 'currentLearning',
      label: 'Currently Learning',
      type: 'text',
      placeholder: 'Rust, WebAssembly',
      required: false,
      description: 'Technologies you\'re learning'
    },
    {
      key: 'askMeAbout',
      label: 'Ask Me About',
      type: 'text',
      placeholder: 'React, Node.js, System Design',
      required: false,
      description: 'Topics you\'re knowledgeable about'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'your.email@example.com',
      required: false,
      description: 'Your contact email'
    },
    {
      key: 'funFact',
      label: 'Fun Fact',
      type: 'text',
      placeholder: 'I can solve a Rubik\'s cube in under 2 minutes',
      required: false,
      description: 'Something interesting about you'
    }
  ],

  widgets: [
    {
      id: 'social-links',
      name: 'Social Media Links',
      description: 'Badges linking to your social profiles',
      marker: '<!-- WIDGET:social-links -->',
      allowedTypes: ['social-links'],
      defaultWidget: 'social-links'
    },
    {
      id: 'tech-stack',
      name: 'Tech Stack Badges',
      description: 'Technology badges based on your most-used languages',
      marker: '<!-- WIDGET:tech-stack-badges -->',
      allowedTypes: ['tech-stack-badges'],
      defaultWidget: 'tech-stack-badges'
    },
    {
      id: 'github-stats',
      name: 'GitHub Stats Card',
      description: 'Card showing your GitHub statistics',
      marker: '<!-- WIDGET:github-stats -->',
      allowedTypes: ['github-stats', 'telescope-stats'],
      defaultWidget: 'github-stats'
    },
    {
      id: 'streak-stats',
      name: 'Contribution Streak',
      description: 'Your current contribution streak',
      marker: '<!-- WIDGET:streak-stats -->',
      allowedTypes: ['streak-stats', 'contribution-graph'],
      defaultWidget: 'streak-stats'
    },
    {
      id: 'language-chart',
      name: 'Language Statistics',
      description: 'Chart of your most-used programming languages',
      marker: '<!-- WIDGET:language-chart -->',
      allowedTypes: ['language-chart'],
      defaultWidget: 'language-chart'
    },
    {
      id: 'top-repos',
      name: 'Featured Projects',
      description: 'Showcase your top repositories',
      marker: '<!-- WIDGET:top-repos -->',
      allowedTypes: ['top-repos'],
      defaultWidget: 'top-repos'
    }
  ]
};
