const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const tar = require('tar');

const EXCLUDES = [
    'node_modules',
    '.next',
    '.git',
    '.vercel',
    '.qoder',
    'scripts_backup',
    'testsprite_tests',
    'full_remote_backup.sql',
    'full_remote_backup copy.sql',
    'site.tar.gz',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    // Test files - vitest is devDependency
    'vitest.config.ts',
    'src/__tests__',
    // Exclude migrated/heavy assets
    'public/0', 'public/1', 'public/2', 'public/3', 'public/4', 'public/5',
    'public/HTML', 'public/blogfiles', 'public/business_profile',
    'public/item', 'public/item-images', 'public/minify',
    'public/page-images', 'public/temp', 'public/uploads',
    'public/user-images', 'public/widget-images', 'public/custom-images'
];

async function packageSource() {
    console.log('📦 Packaging source code...');

    try {
        await tar.c(
            {
                gzip: true,
                file: 'site.tar.gz',
                filter: (path, stat) => {
                    // Check if any excluded pattern matches
                    // tar passes relative paths
                    for (const exclude of EXCLUDES) {
                        if (path.includes(exclude)) return false;
                    }
                    return true;
                },
                cwd: process.cwd()
            },
            ['.']
        );
        console.log('✅ Created site.tar.gz');
    } catch (err) {
        console.error('❌ Failed to create tarball:', err);
    }
}

packageSource();
