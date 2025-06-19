#!/usr/bin/env node

const webpack = require('webpack');
const config = require('../webpack.config.js');
const fs = require('fs-extra');
const path = require('path');

async function build() {
    console.log('🏗️  Building Universal Scraping Extension...');
    
    try {
        // Clean dist directory
        console.log('🧹 Cleaning dist directory...');
        await fs.emptyDir('dist');
        console.log('✅ Cleaned dist directory');
        
        // Run webpack
        console.log('📦 Running webpack build...');
        const compiler = webpack(config);
        
        await new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (err) return reject(err);
                
                if (stats.hasErrors()) {
                    console.error('❌ Build failed with errors:');
                    console.error(stats.compilation.errors);
                    return reject(new Error('Build failed'));
                }
                
                if (stats.hasWarnings()) {
                    console.warn('⚠️  Build completed with warnings:');
                    console.warn(stats.compilation.warnings);
                }
                
                console.log('✅ Webpack build completed');
                resolve();
            });
        });
        
        // Copy additional files
        console.log('📁 Copying additional files...');
        await copyAdditionalFiles();
        
        // Validate build
        console.log('🔍 Validating build...');
        await validateBuild();
        
        console.log('🎉 Extension build completed successfully!');
        console.log('📂 Output directory: dist/');
        
        // Print build summary
        await printBuildSummary();
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

async function copyAdditionalFiles() {
    const files = [
        { from: 'README.md', to: 'dist/README.md' },
        { from: 'CHANGELOG.md', to: 'dist/CHANGELOG.md' },
        { from: 'LICENSE', to: 'dist/LICENSE' },
        { from: 'src/popup/popup.css', to: 'dist/popup.css' }
    ];
    
    for (const file of files) {
        if (await fs.pathExists(file.from)) {
            await fs.copy(file.from, file.to);
            console.log(`  ✅ Copied ${file.from}`);
        } else {
            console.log(`  ⚠️  File not found: ${file.from}`);
        }
    }
}

async function validateBuild() {
    const requiredFiles = [
        'dist/manifest.json',
        'dist/background.js',
        'dist/content-script.js',
        'dist/popup.html',
        'dist/popup.js'
    ];
    
    for (const file of requiredFiles) {
        if (!(await fs.pathExists(file))) {
            throw new Error(`Required file missing: ${file}`);
        }
    }
    
    // Validate manifest.json
    const manifest = await fs.readJson('dist/manifest.json');
    if (!manifest.name || !manifest.version || !manifest.manifest_version) {
        throw new Error('Invalid manifest.json: missing required fields');
    }
    
    console.log('  ✅ All required files present');
    console.log('  ✅ Manifest validation passed');
}

async function printBuildSummary() {
    const distPath = path.resolve('dist');
    const files = await fs.readdir(distPath);
    
    console.log('\\n📋 Build Summary:');
    console.log(`📂 Output directory: ${distPath}`);
    console.log(`📄 Files created: ${files.length}`);
    
    // Calculate total size
    let totalSize = 0;
    for (const file of files) {
        const filePath = path.join(distPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
            totalSize += stats.size;
        }
    }
    
    console.log(`📏 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    // List main files with sizes
    const mainFiles = ['manifest.json', 'background.js', 'content-script.js', 'popup.js'];
    console.log('\\n📋 Main files:');
    
    for (const file of mainFiles) {
        const filePath = path.join(distPath, file);
        if (await fs.pathExists(filePath)) {
            const stats = await fs.stat(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  📄 ${file}: ${sizeKB} KB`);
        }
    }
    
    console.log('\\n🚀 Ready to load in Chrome:');
    console.log('   1. Open chrome://extensions/');
    console.log('   2. Enable "Developer mode"');
    console.log('   3. Click "Load unpacked"');
    console.log('   4. Select the dist/ folder');
}

// Self-executing function if called directly
if (require.main === module) {
    build();
}

module.exports = build;