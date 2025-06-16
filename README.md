# BarterVerse CI/CD Infrastructure

External CI/CD automation and deployment infrastructure for BarterVerse application.

## Architecture

This repository implements the three-tier separation pattern from Issue #36:

1. **BarterVerse repo**: Pure application code only
2. **CI/CD repo** (this): All automation & deployment infrastructure  
3. **Config injection**: Environment-specific deployment patterns

## Directory Structure

```
├── github-workflows/                   # GitHub automation, templates, and workflows
│   ├── github-issues-workflow.js      # Issue management
│   ├── github-projects-integration.js # Project management
│   ├── jules-branch-integration.js    # External branch integration
│   ├── startup-build-check.js         # Build monitoring
│   ├── build-health-report.js         # Health analytics
│   ├── claude-context-helper.js       # Claude integration
│   ├── templates/                     # GitHub templates
│   │   ├── issue-templates/           # GitHub issue templates
│   │   └── pr-templates/              # GitHub PR templates
│   └── workflows/                     # GitHub Actions workflows
│       ├── build-monitoring.yml       # Automated build health monitoring
│       ├── firebase-cleanup.yml       # Deployment cleanup
│       ├── firebase-deploy.yml        # Production deployment
│       ├── firebase-preview.yml       # PR preview deployment
│       └── issues-workflow.yml        # Issue automation
├── deployment/                        # Deployment configurations
│   ├── firebase-configs/              # Firebase configs per environment
│   │   ├── firebase-prod.json         # Production Firebase hosting config
│   │   └── .firebaserc                # Firebase project configuration
│   ├── hosting-configs/               # Hosting configs per environment
│   │   └── apphosting-prod.yaml       # Production App Hosting config
│   └── deployment-scripts/            # Deployment automation
│       └── deploy-production.js       # Production deployment script
└── docs/                             # Documentation and planning
    ├── CICD-MIGRATION-READY.md        # Migration documentation
    ├── ISSUE-36-PLAN-A.md             # Issue #36 planning
    ├── ISSUE-36-SESSION-LOG.md        # Session logs
    ├── ISSUE-36-TESTING-PROTOCOL.md   # Testing protocol
    └── cicd-repo-structure.md         # Repository structure docs
```

## Available Commands

### Issue Management
- `npm run issues:report` - Generate workflow status report
- `npm run issues:create` - Create new issues
- `npm run issues:start <issue-number>` - Start issue workflow
- `npm run issues:progress <issue-number> <step>` - Update progress

### Build Monitoring  
- `npm run build:status` - Check build health across branches
- `npm run build:health` - Comprehensive health analytics

### Project Management
- `npm run projects:create-item-matching` - Create item matching project
- `npm run projects:status <milestone>` - Get project status

### Deployment
- `npm run deploy:prod` - Deploy to production
- `npm run deploy:staging` - Deploy to staging  
- `npm run deploy:dev` - Deploy to development

### Claude Integration
- `npm run claude:info` - Show current context
- `npm run claude:setup` - Setup Claude context for issue

## Cross-Repository Operation

This CI/CD infrastructure operates on the BarterVerse repository from external location:

- **GitHub API access**: Manages issues, PRs, projects in BarterVerse repo
- **Build monitoring**: Monitors BarterVerse builds from external location
- **Config injection**: Pulls clean app code, injects configs, deploys
- **Branch management**: Handles feature branches and integration

## Environment Management

Deployment uses config injection pattern:
1. Pull clean app code from BarterVerse repo
2. Inject environment-specific Firebase/hosting configs
3. Deploy with injected configurations
4. Keep BarterVerse repo deployment-agnostic

## Issue #36 Implementation

This repository solves the critical architectural contamination by:
- **Physical separation**: No CI/CD files in BarterVerse working directory
- **Clean builds**: BarterVerse builds without interference
- **External automation**: All CI/CD operates from separate location
- **Platform agnostic**: BarterVerse can switch deployment platforms

## Usage

Clone this repository separately from BarterVerse:

```bash
git clone https://github.com/creat-o-r/Firebase-GitHub.git barterverse-cicd
cd barterverse-cicd
npm install
npm run build:status  # Check BarterVerse build health
npm run issues:report # Review BarterVerse issues
```