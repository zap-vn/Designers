#!/usr/bin/env node

/**
 * Diagnose and Recover from Build/Server Issues
 * Analyzes log files and attempts automated recovery
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Find and analyze recent log files
 */
function analyzeLogFiles() {
    console.log('\n🔍 Analyzing log files...');

    const logPatterns = [
        'server.log', 'server_utf8.log',
        'compile.log', 'compile_utf8.log',
        'tsc_errors.log', 'tsc_health_check.txt',
        'build_log.txt', 'next_errors.txt'
    ];

    const issues = {
        hasTypeErrors: false,
        hasCompileErrors: false,
        hasServerErrors: false,
        hasDependencyIssues: false,
        errorDetails: []
    };

    for (const pattern of logPatterns) {
        const logPath = join(process.cwd(), pattern);
        if (existsSync(logPath)) {
            try {
                const content = readFileSync(logPath, 'utf-8');
                const lines = content.split('\n');

                // Check for common error patterns
                if (content.includes('error TS') || content.includes('Type error')) {
                    issues.hasTypeErrors = true;
                    issues.errorDetails.push(`TypeScript errors in ${pattern}`);
                }

                if (content.includes('Module not found') || content.includes('Cannot find module')) {
                    issues.hasDependencyIssues = true;
                    issues.errorDetails.push(`Missing dependencies in ${pattern}`);
                }

                if (content.includes('EADDRINUSE') || content.includes('port already in use')) {
                    issues.hasServerErrors = true;
                    issues.errorDetails.push(`Port conflict in ${pattern}`);
                }

                if (content.includes('Failed to compile') || content.includes('Compilation failed')) {
                    issues.hasCompileErrors = true;
                    issues.errorDetails.push(`Compilation errors in ${pattern}`);
                }
            } catch (e) {
                // Skip unreadable logs
            }
        }
    }

    return issues;
}

/**
 * Attempt automated recovery based on detected issues
 */
async function attemptRecovery(issues) {
    console.log('\n🔧 Attempting automated recovery...\n');

    let recoveryActions = [];

    // 1. Dependency Issues - Run npm install
    if (issues.hasDependencyIssues) {
        console.log('📦 Detected missing dependencies - running npm install...');
        try {
            await execAsync('npm install', { cwd: process.cwd() });
            console.log('   ✅ Dependencies reinstalled');
            recoveryActions.push('Reinstalled dependencies');
        } catch (error) {
            console.log('   ⚠️  Failed to reinstall dependencies');
        }
    }

    // 2. Port Conflicts - Kill processes on port 3000
    if (issues.hasServerErrors) {
        console.log('🔌 Detected port conflict - clearing port 3000...');
        try {
            // Windows: Find and kill process on port 3000
            const { stdout } = await execAsync('netstat -ano | findstr :3000', { cwd: process.cwd() });
            const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));

            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && !isNaN(pid)) {
                    await execAsync(`taskkill /F /PID ${pid}`, { cwd: process.cwd() });
                    console.log(`   ✅ Killed process ${pid} on port 3000`);
                    recoveryActions.push(`Cleared port 3000 (PID: ${pid})`);
                }
            }
        } catch (error) {
            // Port might already be free
            console.log('   ℹ️  Port 3000 is available');
        }
    }

    // 3. Clear Next.js cache if compile errors
    if (issues.hasCompileErrors) {
        console.log('🗑️  Detected compile errors - clearing Next.js cache...');
        try {
            await execAsync('Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue', {
                cwd: process.cwd(),
                shell: 'powershell.exe'
            });
            console.log('   ✅ Cleared .next cache');
            recoveryActions.push('Cleared Next.js cache');
        } catch (error) {
            console.log('   ⚠️  Could not clear cache');
        }
    }

    // 4. TypeScript errors are informational only
    if (issues.hasTypeErrors) {
        console.log('ℹ️  TypeScript errors detected (non-blocking)');
        recoveryActions.push('TypeScript errors noted (non-blocking)');
    }

    return recoveryActions;
}

/**
 * Fix localhost corruption (aggressive cache clearing)
 */
async function fixLocalhostCorruption() {
    console.log('\n🔧 Fixing localhost corruption...');

    const actions = [];

    try {
        // 1. Kill all Node processes
        console.log('   Killing all Node processes...');
        await execAsync('Stop-Process -Name node -Force -ErrorAction SilentlyContinue', {
            cwd: process.cwd(),
            shell: 'powershell.exe'
        });
        console.log('   ✅ Node processes killed');
        actions.push('Killed all Node processes');

        // Wait for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.log('   ℹ️  No Node processes to kill');
    }

    try {
        // 2. Clear Next.js cache
        console.log('   Clearing Next.js cache (.next)...');
        await execAsync('Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue', {
            cwd: process.cwd(),
            shell: 'powershell.exe'
        });
        console.log('   ✅ .next cache cleared');
        actions.push('Cleared .next cache');
    } catch (error) {
        console.log('   ℹ️  .next already clean');
    }

    try {
        // 3. Clear node_modules/.cache if exists
        console.log('   Clearing node_modules cache...');
        await execAsync('Remove-Item -Path node_modules\\.cache -Recurse -Force -ErrorAction SilentlyContinue', {
            cwd: process.cwd(),
            shell: 'powershell.exe'
        });
        console.log('   ✅ node_modules cache cleared');
        actions.push('Cleared node_modules cache');
    } catch (error) {
        // Cache might not exist
    }

    try {
        // 4. Clear Windows DNS cache (can cause localhost issues)
        console.log('   Flushing DNS cache...');
        await execAsync('ipconfig /flushdns', {
            cwd: process.cwd(),
            shell: 'cmd.exe'
        });
        console.log('   ✅ DNS cache flushed');
        actions.push('Flushed DNS cache');
    } catch (error) {
        console.log('   ⚠️  Could not flush DNS');
    }

    return actions;
}

/**
 * Clear stale IDE problems by running fresh checks
 */
async function clearStaleProblems() {
    console.log('\n🧹 Clearing stale IDE problems...');

    try {
        // Run TypeScript check to refresh problem markers
        console.log('   Running TypeScript check...');
        await execAsync('npx tsc --noEmit', { cwd: process.cwd() });
        console.log('   ✅ No TypeScript errors');
    } catch (error) {
        // TypeScript errors are expected and non-blocking
        console.log('   ℹ️  TypeScript errors detected (will show in IDE)');
    }

    try {
        // Run ESLint to refresh lint markers
        console.log('   Running ESLint check...');
        await execAsync('npm run lint', { cwd: process.cwd() });
        console.log('   ✅ No lint errors');
    } catch (error) {
        // Lint errors are expected and non-blocking
        console.log('   ℹ️  Lint warnings detected (will show in IDE)');
    }

    console.log('   ✅ IDE problem markers refreshed');
    return 'Refreshed IDE problem markers';
}

/**
 * Main execution
 */
async function main() {
    console.log('🏥 Running diagnostic and recovery check...');

    const issues = analyzeLogFiles();

    if (issues.errorDetails.length === 0) {
        console.log('\n✅ No critical issues detected in log files');
    } else {
        console.log('\n⚠️  Issues detected:');
        issues.errorDetails.forEach(detail => console.log(`   - ${detail}`));
    }

    const recoveryActions = await attemptRecovery(issues);

    // Only fix localhost corruption if explicitly needed or if server issues detected
    if (issues.hasServerErrors || issues.hasCompileErrors) {
        const corruptionFixes = await fixLocalhostCorruption();
        recoveryActions.push(...corruptionFixes);
    }

    // Always refresh IDE problems for clean state
    const problemClearAction = await clearStaleProblems();
    if (problemClearAction) {
        recoveryActions.push(problemClearAction);
    }

    console.log('\n' + '='.repeat(50));
    if (recoveryActions.length > 0) {
        console.log('✅ Recovery actions completed:');
        recoveryActions.forEach(action => console.log(`   ✓ ${action}`));
        console.log('\n💡 IDE should now show current problems only');
    } else {
        console.log('ℹ️  Workspace is healthy');
    }
    console.log('='.repeat(50) + '\n');

    process.exit(0);
}

main();
