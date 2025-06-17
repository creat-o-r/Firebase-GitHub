// Framework detection logic
function detectFramework(contents) {
  const files = contents.map(item => item.name);
  
  // Check for Next.js
  if (files.includes('next.config.js') || files.includes('next.config.ts')) {
    return 'nextjs';
  }
  
  // Check for React (Vite)
  if (files.includes('vite.config.js') || files.includes('vite.config.ts')) {
    return 'vite';
  }
  
  // Check for Vue
  if (files.includes('vue.config.js') || files.includes('nuxt.config.js')) {
    return 'vue';
  }
  
  // Check for Angular
  if (files.includes('angular.json')) {
    return 'angular';
  }
  
  // Check for Svelte
  if (files.includes('svelte.config.js')) {
    return 'svelte';
  }
  
  // Check for static site generators
  if (files.includes('gatsby-config.js')) {
    return 'gatsby';
  }
  
  if (files.includes('astro.config.js')) {
    return 'astro';
  }
  
  // Check for package.json to determine generic Node.js
  if (files.includes('package.json')) {
    return 'nodejs';
  }
  
  // Default to static site
  return 'static';
}

// Detect deployment platform
function detectDeployment(contents) {
  const files = contents.map(item => item.name);
  
  if (files.includes('firebase.json')) {
    return 'firebase';
  }
  
  if (files.includes('vercel.json') || files.includes('.vercelignore')) {
    return 'vercel';
  }
  
  if (files.includes('netlify.toml') || files.includes('_redirects')) {
    return 'netlify';
  }
  
  // Default to Firebase (most common for our use case)
  return 'firebase';
}

module.exports = {
  detectFramework,
  detectDeployment
};