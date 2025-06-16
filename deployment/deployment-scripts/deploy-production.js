#!/usr/bin/env node

/**
 * Production Deployment Script - Config Injection Pattern
 * 
 * Implements Issue #36 three-tier separation:
 * 1. Pull clean app code from BarterVerse repo (specific branch)
 * 2. Inject production Firebase/hosting configs
 * 3. Deploy with injected configurations
 * 4. Keep BarterVerse repo deployment-agnostic
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BARTERVERSE_REPO = 'https://github.com/creat-o-r/Barterverse.git';
const TEMP_DIR = '/tmp/barterverse-deploy-prod';
const DEFAULT_BRANCH = 'testing'; // Production deploys from testing branch

async function deployProduction(branch = DEFAULT_BRANCH) {
    console.log(`🚀 Starting Production Deployment from branch: ${branch}`);
    console.log('📋 Using Config Injection Pattern for clean separation');
    
    try {
        // Step 1: Clean deployment directory
        console.log('📁 Preparing deployment directory...');
        if (fs.existsSync(TEMP_DIR)) {
            execSync(`rm -rf ${TEMP_DIR}`);
        }
        
        // Step 2: Clone clean BarterVerse repo from specified branch
        console.log(`📦 Cloning clean BarterVerse code from ${branch} branch...`);
        execSync(`git clone --depth 1 --branch ${branch} ${BARTERVERSE_REPO} ${TEMP_DIR}`);
        
        // Step 3: Inject production configs
        console.log('⚙️ Injecting production configurations...');
        const prodFirebaseConfig = path.join(__dirname, '../firebase-configs/firebase-prod.json');
        const prodHostingConfig = path.join(__dirname, '../hosting-configs/apphosting-prod.yaml');
        
        // Verify configs exist
        if (!fs.existsSync(prodFirebaseConfig)) {
            throw new Error('Production Firebase config not found');
        }
        if (!fs.existsSync(prodHostingConfig)) {
            throw new Error('Production hosting config not found');
        }
        
        // Copy configs to clean app directory
        fs.copyFileSync(prodFirebaseConfig, path.join(TEMP_DIR, 'firebase.json'));
        fs.copyFileSync(prodHostingConfig, path.join(TEMP_DIR, 'apphosting.yaml'));
        
        console.log('✅ Configs injected - app repo remains clean');
        
        // Step 4: Install dependencies and build
        console.log('🔨 Building application...');
        execSync('npm install', { cwd: TEMP_DIR, stdio: 'inherit' });
        execSync('npm run build', { cwd: TEMP_DIR, stdio: 'inherit' });
        
        // Step 5: Deploy to Firebase
        console.log('🚀 Deploying to production...');
        execSync('firebase deploy --project barterverse-l9uq3', { cwd: TEMP_DIR, stdio: 'inherit' });
        
        // Step 6: Cleanup
        console.log('🧹 Cleaning up...');
        execSync(`rm -rf ${TEMP_DIR}`);
        
        console.log(`✅ Production deployment completed successfully from ${branch}!`);
        
    } catch (error) {
        console.error('❌ Production deployment failed:', error.message);
        
        // Cleanup on failure
        if (fs.existsSync(TEMP_DIR)) {
            execSync(`rm -rf ${TEMP_DIR}`);
        }
        
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const branch = args[0] || DEFAULT_BRANCH;

// Run if called directly
if (require.main === module) {
    deployProduction(branch);
}

module.exports = { deployProduction };