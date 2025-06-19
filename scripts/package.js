#!/usr/bin/env node

const archiver = require('archiver');
const fs = require('fs-extra');
const path = require('path');
const build = require('./build');

async function packageExtension() {
    console.log('📦 Packaging Universal Scraping Extension...');
    
    try {
        // Build first
        console.log('🏗️  Building extension...');
        await build();
        
        // Create package info
        const packageInfo = await getPackageInfo();
        console.log(`📋 Package: ${packageInfo.name} v${packageInfo.version}`);
        
        // Create zip file
        const zipPath = await createZipPackage(packageInfo);
        
        // Validate package
        await validatePackage(zipPath);
        
        console.log('🎉 Extension packaged successfully!');
        console.log(`📦 Package: ${zipPath}`);
        console.log(`📏 Size: ${await getFileSize(zipPath)}`);
        
        // Print package summary
        await printPackageSummary(zipPath, packageInfo);
        
    } catch (error) {
        console.error('❌ Packaging failed:', error.message);
        process.exit(1);
    }
}

async function getPackageInfo() {
    // Read package.json
    const packageJson = await fs.readJson('package.json');
    
    // Read manifest for extension info
    const manifest = await fs.readJson('dist/manifest.json');
    
    return {
        name: manifest.name.replace(/\\s+/g, '-').toLowerCase(),
        version: manifest.version,
        description: manifest.description,
        manifestVersion: manifest.manifest_version,
        packageVersion: packageJson.version
    };
}

async function createZipPackage(packageInfo) {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `${packageInfo.name}-v${packageInfo.version}-${timestamp}.zip`;
    const zipPath = path.join('dist', filename);
    
    console.log(`📁 Creating package: ${filename}`);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { 
            zlib: { level: 9 } // Maximum compression
        });
        
        output.on('close', () => {
            console.log(`✅ Package created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
            resolve(zipPath);
        });
        
        output.on('error', reject);
        archive.on('error', reject);
        
        archive.pipe(output);
        
        // Add all files from dist except existing zip files
        archive.glob('**/*', {
            cwd: 'dist',
            ignore: ['*.zip']
        });
        
        archive.finalize();
    });
}

async function validatePackage(zipPath) {
    console.log('🔍 Validating package...');
    
    // Check file exists and has reasonable size
    const stats = await fs.stat(zipPath);
    const sizeKB = stats.size / 1024;
    
    if (sizeKB < 10) {
        throw new Error('Package too small - may be incomplete');
    }
    
    if (sizeKB > 10240) { // 10MB limit for Chrome Web Store
        console.warn('⚠️  Package is quite large (>10MB). Consider optimizing.');
    }
    
    console.log('  ✅ Package size is reasonable');
    console.log('  ✅ Package validation passed');
}

async function getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    const sizeKB = stats.size / 1024;
    const sizeMB = sizeKB / 1024;
    
    if (sizeMB >= 1) {
        return `${sizeMB.toFixed(2)} MB`;
    } else {
        return `${sizeKB.toFixed(2)} KB`;
    }
}

async function printPackageSummary(zipPath, packageInfo) {
    console.log('\\n📋 Package Summary:');
    console.log(`📦 Name: ${packageInfo.name}`);
    console.log(`🏷️  Version: ${packageInfo.version}`);
    console.log(`📄 Description: ${packageInfo.description}`);
    console.log(`🛠️  Manifest Version: ${packageInfo.manifestVersion}`);
    console.log(`📂 Location: ${zipPath}`);
    console.log(`📏 Size: ${await getFileSize(zipPath)}`);
    
    console.log('\\n🚀 Ready for Chrome Web Store:');
    console.log('   1. Go to Chrome Web Store Developer Dashboard');
    console.log('   2. Upload the zip file');
    console.log('   3. Fill out store listing details');
    console.log('   4. Submit for review');
    
    console.log('\\n🧪 Local Testing:');
    console.log('   1. Extract the zip file');
    console.log('   2. Load in Chrome as unpacked extension');
    console.log('   3. Test all functionality thoroughly');
    
    // Check for common issues
    await checkForCommonIssues();
}

async function checkForCommonIssues() {
    console.log('\\n🔍 Pre-submission Checklist:');
    
    const checklist = [
        { name: 'Manifest.json is valid', check: checkManifest },
        { name: 'All required permissions listed', check: checkPermissions },
        { name: 'Icons are present', check: checkIcons },
        { name: 'Content scripts properly configured', check: checkContentScripts },
        { name: 'No console.log in production', check: checkConsoleLog }
    ];
    
    for (const item of checklist) {
        try {
            const result = await item.check();
            console.log(`  ${result ? '✅' : '❌'} ${item.name}`);
        } catch (error) {
            console.log(`  ⚠️  ${item.name}: ${error.message}`);
        }
    }
}

async function checkManifest() {
    const manifest = await fs.readJson('dist/manifest.json');
    return manifest.name && manifest.version && manifest.description && manifest.manifest_version === 3;
}

async function checkPermissions() {
    const manifest = await fs.readJson('dist/manifest.json');
    return manifest.permissions && Array.isArray(manifest.permissions);
}

async function checkIcons() {
    const manifest = await fs.readJson('dist/manifest.json');
    if (!manifest.icons) return false;
    
    // Check if icon files exist
    for (const iconPath of Object.values(manifest.icons)) {
        if (!(await fs.pathExists(path.join('dist', iconPath)))) {
            return false;
        }
    }
    return true;
}

async function checkContentScripts() {
    const manifest = await fs.readJson('dist/manifest.json');
    if (!manifest.content_scripts) return true; // Optional
    
    for (const script of manifest.content_scripts) {
        if (!script.js || !Array.isArray(script.js)) return false;
        for (const jsFile of script.js) {
            if (!(await fs.pathExists(path.join('dist', jsFile)))) {
                return false;
            }
        }
    }
    return true;
}

async function checkConsoleLog() {
    // Check for console.log statements in production build
    const jsFiles = ['background.js', 'content-script.js', 'popup.js'];
    
    for (const file of jsFiles) {
        const filePath = path.join('dist', file);
        if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf8');
            if (content.includes('console.log') || content.includes('console.error')) {
                return false; // Found console statements
            }
        }
    }
    return true;
}

// Create a Chrome Web Store package (stricter validation)
async function createStorePackage() {
    console.log('🏪 Creating Chrome Web Store package...');
    
    // Additional validations for store submission
    const manifest = await fs.readJson('dist/manifest.json');
    
    // Remove development files that shouldn't be in store package
    const devFiles = ['README.md', 'CHANGELOG.md', 'LICENSE'];
    for (const file of devFiles) {
        const filePath = path.join('dist', file);
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
            console.log(`  🗑️  Removed dev file: ${file}`);
        }
    }
    
    // Create store-ready package
    const packageInfo = await getPackageInfo();
    const storeFilename = `${packageInfo.name}-store-v${packageInfo.version}.zip`;
    const storePath = path.join('dist', storeFilename);
    
    // Same packaging process but with store-specific name
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(storePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`✅ Store package created: ${storeFilename}`);
            resolve(storePath);
        });
        
        output.on('error', reject);
        archive.on('error', reject);
        
        archive.pipe(output);
        archive.glob('**/*', {
            cwd: 'dist',
            ignore: ['*.zip', 'README.md', 'CHANGELOG.md', 'LICENSE']
        });
        
        archive.finalize();
    });
}

// Self-executing function if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--store')) {
        // Create store-ready package
        packageExtension().then(() => createStorePackage());
    } else {
        // Create development package
        packageExtension();
    }
}

module.exports = { packageExtension, createStorePackage };