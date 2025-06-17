const express = require('express');
const { Webhooks } = require('@octokit/webhooks');
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const detect = require('./detect');
const templates = require('./templates');

require('dotenv').config();

const app = express();

// Check required environment variables
const requiredEnvVars = ['WEBHOOK_SECRET', 'APP_ID', 'PRIVATE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.log('⚠️  Missing required environment variables:', missingEnvVars.join(', '));
  console.log('ℹ️  App running in setup mode - webhook disabled');
  console.log('📋 Add these environment variables in Railway dashboard:');
  console.log('   - WEBHOOK_SECRET: Generate a random secret string');
  console.log('   - APP_ID: GitHub App ID from app settings');
  console.log('   - PRIVATE_KEY: GitHub App private key (full PEM content)');
  console.log('   - INSTALLATION_ID: GitHub App installation ID (optional)');
}

const webhooks = missingEnvVars.length === 0 ? new Webhooks({
  secret: process.env.WEBHOOK_SECRET,
}) : null;

// GitHub App authentication
const auth = missingEnvVars.length === 0 ? createAppAuth({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: process.env.INSTALLATION_ID,
}) : null;

// Webhook handler for app installation
if (webhooks) {
  webhooks.on('installation.created', async ({ payload }) => {
  console.log('App installed on:', payload.installation.account.login);
  
  const { token } = await auth({ type: "installation", installationId: payload.installation.id });
  const octokit = new Octokit({ auth: token });
  
  // Get repositories from installation
  const { data: { repositories } } = await octokit.rest.apps.listReposAccessibleToInstallation();
  
  for (const repo of repositories) {
    await setupRepo(octokit, repo.owner.login, repo.name);
  }
  });

  // Webhook handler for repository push
  webhooks.on('push', async ({ payload }) => {
  if (payload.ref !== 'refs/heads/main' && payload.ref !== 'refs/heads/master') return;
  
  const { token } = await auth({ type: "installation", installationId: payload.installation.id });
  const octokit = new Octokit({ auth: token });
  
    console.log('Push to main branch:', payload.repository.full_name);
    // Workflow will handle deployment
  });
}

// Setup repository with CI/CD workflow
async function setupRepo(octokit, owner, repo) {
  console.log(`Setting up CI/CD for ${owner}/${repo}`);
  
  try {
    // Get repository contents to detect framework
    const { data: contents } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '',
    });
    
    const framework = detect.detectFramework(contents);
    console.log(`Detected framework: ${framework} for ${owner}/${repo}`);
    
    // Check if workflow already exists
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.github/workflows/ci.yml',
      });
      console.log('Workflow already exists, skipping');
      return;
    } catch (error) {
      // Workflow doesn't exist, create it
    }
    
    // Create workflow file
    const workflowContent = templates.getWorkflow(framework);
    
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: '.github/workflows/ci.yml',
      message: '🚀 Add universal CI/CD workflow via GitHub App',
      content: Buffer.from(workflowContent).toString('base64'),
    });
    
    // Create a setup comment or issue
    await octokit.rest.issues.create({
      owner,
      repo,
      title: '🚀 Universal CI/CD Setup Complete',
      body: templates.getSetupInstructions(framework),
    });
    
    console.log(`Successfully set up CI/CD for ${owner}/${repo}`);
    
  } catch (error) {
    console.error(`Error setting up ${owner}/${repo}:`, error);
  }
}

// Express server for webhooks
app.use(express.json());

if (webhooks) {
  app.post('/webhook', webhooks.middleware);
} else {
  app.post('/webhook', (req, res) => {
    res.status(503).json({ error: 'Webhook disabled - missing environment variables' });
  });
}

app.get('/', (req, res) => {
  const status = missingEnvVars.length === 0 ? 'configured' : 'needs setup';
  const html = `
    <h1>🚀 Universal CI/CD GitHub App</h1>
    <p><strong>Status:</strong> ${status}</p>
    ${missingEnvVars.length > 0 ? `
      <h3>⚠️ Missing Environment Variables:</h3>
      <ul>
        ${missingEnvVars.map(v => `<li><code>${v}</code></li>`).join('')}
      </ul>
      <p>Add these in Railway dashboard under Variables tab.</p>
    ` : `
      <h3>✅ Ready to receive webhooks</h3>
      <p>Webhook endpoint: <code>/webhook</code></p>
    `}
  `;
  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});