const express = require('express');
const { Webhooks } = require('@octokit/webhooks');
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const detect = require('./detect');
const templates = require('./templates');

require('dotenv').config();

const app = express();
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET,
});

// GitHub App authentication
const auth = createAppAuth({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: process.env.INSTALLATION_ID,
});

// Webhook handler for app installation
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
app.post('/webhook', webhooks.middleware);

app.get('/', (req, res) => {
  res.send('Universal CI/CD GitHub App is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});