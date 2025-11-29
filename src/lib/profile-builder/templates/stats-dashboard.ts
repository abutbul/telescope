import { ProfileTemplate } from '../types';

export const statsDashboardTemplate: ProfileTemplate = {
  id: 'stats-dashboard',
  name: 'Stats Dashboard',
  description: 'Analytics-focused profile with comprehensive GitHub statistics and visualizations',
  category: 'interactive',
  preview: '/templates/previews/stats-dashboard.png',
  author: 'Telescope',
  stars: 980,
  difficulty: 'beginner',
  lastUpdated: '2025-11-22',
  tags: ['stats', 'analytics', 'data-driven', 'visual'],
  mode: 'readme',
  
  markdown: `# {{name}} - {{tagline}}

![Profile Views](https://komarev.com/ghpvc/?username={{username}}&color=blue&style=flat-square)
![GitHub followers](https://img.shields.io/github/followers/{{username}}?label=Followers&style=social)
![GitHub stars](https://img.shields.io/github/stars/{{username}}?label=Stars&style=social)

---

### 👨‍💻 About Me

{{aboutMe}}

📍 {{location}} | 💼 {{jobTitle}} | 🌐 [{{website}}]({{websiteUrl}})

---

### 📊 GitHub Analytics

<p align="center">
  <!-- WIDGET:github-stats -->
</p>

<p align="center">
  <!-- WIDGET:streak-stats -->
</p>

---

### 💻 Most Used Languages

<p align="center">
  <!-- WIDGET:language-chart -->
</p>

---

### 🏆 GitHub Trophies

<p align="center">
  <img src="https://github-profile-trophy.vercel.app/?username={{username}}&theme=darkhub&no-frame=true&no-bg=false&row=1&column=7" alt="trophies" />
</p>

---

### 📈 Contribution Activity

<!-- WIDGET:activity-feed -->

---

### 🔥 Featured Repositories

<!-- WIDGET:top-repos -->

---

### 🛠️ Tech Stack

<!-- WIDGET:tech-stack-badges -->

---

### 📫 Connect with Me

<!-- WIDGET:social-links -->

---

<p align="center">
  <i>💡 "{{quote}}"</i>
</p>
`,

  variables: [
    {
      key: 'name',
      label: 'Your Name',
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
      label: 'Professional Title',
      type: 'text',
      placeholder: 'Software Engineer | Data Scientist',
      required: true
    },
    {
      key: 'aboutMe',
      label: 'About',
      type: 'textarea',
      placeholder: 'Brief introduction about yourself...',
      required: true
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'San Francisco, CA',
      required: false
    },
    {
      key: 'jobTitle',
      label: 'Current Job Title',
      type: 'text',
      placeholder: 'Senior Software Engineer',
      required: false
    },
    {
      key: 'website',
      label: 'Website Name',
      type: 'text',
      placeholder: 'My Portfolio',
      required: false
    },
    {
      key: 'websiteUrl',
      label: 'Website URL',
      type: 'url',
      placeholder: 'https://yourwebsite.com',
      required: false
    },
    {
      key: 'quote',
      label: 'Favorite Quote',
      type: 'text',
      placeholder: 'Code is poetry',
      required: false
    }
  ],

  widgets: [
    {
      id: 'github-stats',
      name: 'GitHub Stats',
      description: 'Comprehensive GitHub statistics card',
      marker: '<!-- WIDGET:github-stats -->',
      allowedTypes: ['github-stats', 'telescope-stats'],
      defaultWidget: 'github-stats'
    },
    {
      id: 'streak-stats',
      name: 'Streak Stats',
      description: 'Current and longest contribution streak',
      marker: '<!-- WIDGET:streak-stats -->',
      allowedTypes: ['streak-stats'],
      defaultWidget: 'streak-stats'
    },
    {
      id: 'language-chart',
      name: 'Language Chart',
      description: 'Most used programming languages',
      marker: '<!-- WIDGET:language-chart -->',
      allowedTypes: ['language-chart'],
      defaultWidget: 'language-chart'
    },
    {
      id: 'activity-feed',
      name: 'Activity Graph',
      description: 'Recent contribution activity',
      marker: '<!-- WIDGET:activity-feed -->',
      allowedTypes: ['activity-feed', 'contribution-graph'],
      defaultWidget: 'contribution-graph'
    },
    {
      id: 'top-repos',
      name: 'Top Repositories',
      description: 'Your most popular repositories',
      marker: '<!-- WIDGET:top-repos -->',
      allowedTypes: ['top-repos'],
      defaultWidget: 'top-repos'
    },
    {
      id: 'tech-stack',
      name: 'Tech Stack',
      description: 'Technology badges',
      marker: '<!-- WIDGET:tech-stack-badges -->',
      allowedTypes: ['tech-stack-badges'],
      defaultWidget: 'tech-stack-badges'
    },
    {
      id: 'social-links',
      name: 'Social Links',
      description: 'Connect on social media',
      marker: '<!-- WIDGET:social-links -->',
      allowedTypes: ['social-links'],
      defaultWidget: 'social-links'
    }
  ]
};
