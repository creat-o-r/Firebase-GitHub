// Workflow templates for different frameworks
function getWorkflow(framework) {
  const baseWorkflow = `name: Universal CI/CD
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      actions: read
      pull-requests: write
      checks: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_BUILD_COMMIT: \${{ github.sha }}
          NEXT_PUBLIC_BUILD_BRANCH: \${{ github.ref_name }}
          
      - name: Deploy to Firebase
        if: github.event_name == 'push'
        uses: FirebaseExtended/action-hosting-deploy@v0
        id: firebase_deploy
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: \${{ secrets.FIREBASE_PROJECT_ID }}
        env:
          FIREBASE_CLI_EXPERIMENTS: webframeworks
          
      - name: Deploy Preview
        if: github.event_name == 'pull_request'
        uses: FirebaseExtended/action-hosting-deploy@v0
        id: firebase_preview
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: \${{ secrets.FIREBASE_PROJECT_ID }}
          expires: 7d
        env:
          FIREBASE_CLI_EXPERIMENTS: webframeworks
          
      - name: Comment PR with preview URL
        if: github.event_name == 'pull_request' && success()
        uses: actions/github-script@v7
        with:
          script: |
            const deploymentUrl = '\${{ steps.firebase_preview.outputs.details_url }}';
            const commit = '\${{ github.event.pull_request.head.sha }}'.slice(0, 7);
            const branch = '\${{ github.head_ref }}';
            const buildTime = new Date().toLocaleString();
            
            const comment = \`## 🚀 Preview Deployment Successful!
            
            **🌐 Preview URL:** \${deploymentUrl}  
            **📝 Branch:** \\\`\${branch}\\\`  
            **💾 Commit:** \\\`\${commit}\\\`  
            **⏰ Built:** \${buildTime}  
            **🤖 Framework:** ${framework}
            
            *Preview expires in 7 days*\`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
`;

  return baseWorkflow;
}

function getSetupInstructions(framework) {
  return `## 🚀 Universal CI/CD Setup Complete!

**Detected Framework:** ${framework}

### What was added:
- ✅ **CI/CD Workflow** in \`.github/workflows/ci.yml\`
- ✅ **Auto-deploy** on push to main branch
- ✅ **Preview deployments** for pull requests
- ✅ **Deployment comments** with URLs

### Required Secrets:
Add these secrets in your repository settings (\`Settings > Secrets and variables > Actions\`):

1. **\`FIREBASE_SERVICE_ACCOUNT\`** - Your Firebase service account JSON
2. **\`FIREBASE_PROJECT_ID\`** - Your Firebase project ID (e.g., \`my-app-12345\`)

### How to get Firebase secrets:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project > Settings > Service accounts
3. Generate new private key (download JSON)
4. Copy the entire JSON content to \`FIREBASE_SERVICE_ACCOUNT\` secret
5. Copy your project ID to \`FIREBASE_PROJECT_ID\` secret

### Next Steps:
1. ✅ Add the required secrets above
2. ✅ Push code to main branch or create a PR
3. ✅ Watch automatic deployment happen!

**Need help?** Check out the [Firebase Hosting GitHub Action docs](https://github.com/FirebaseExtended/action-hosting-deploy)

*🤖 This setup was created automatically by Universal CI/CD App*`;
}

module.exports = {
  getWorkflow,
  getSetupInstructions
};