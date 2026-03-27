import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Demo Recording Script — uses YOUR Chrome with OneChain extension
 * 
 * USAGE: npx tsx tests/demo_recording.test.ts
 */

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROME_USER_DATA = process.env.LOCALAPPDATA + '\\Google\\Chrome\\User Data';
const SITE_URL = 'https://onegrantai.vercel.app';
const DEBUG_PORT = 9222;

async function waitForDebugPort(port: number, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        console.log('   Chrome version:', data.Browser);
        return true;
      }
    } catch { }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

(async () => {
  // Step 1: Kill ALL Chrome processes aggressively
  console.log('🔄 Closing any running Chrome...');
  try {
    execSync('taskkill /F /IM chrome.exe 2>nul', { shell: 'cmd.exe', stdio: 'ignore' });
  } catch { }
  try {
    execSync('taskkill /F /IM GoogleCrashHandler.exe 2>nul', { shell: 'cmd.exe', stdio: 'ignore' });
    execSync('taskkill /F /IM GoogleCrashHandler64.exe 2>nul', { shell: 'cmd.exe', stdio: 'ignore' });
  } catch { }

  // Wait for processes to fully die
  await new Promise(r => setTimeout(r, 4000));

  // Step 2: Remove Chrome lock files that block new instances
  console.log('🔓 Removing Chrome lock files...');
  const lockFiles = ['SingletonLock', 'SingletonSocket', 'SingletonCookie'];
  for (const lockFile of lockFiles) {
    const lockPath = path.join(CHROME_USER_DATA, lockFile);
    try {
      fs.unlinkSync(lockPath);
      console.log(`   Removed: ${lockFile}`);
    } catch { }
  }

  // Step 3: Launch Chrome with debugging port + extensions
  console.log('🚀 Launching Chrome with extensions on port', DEBUG_PORT);
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${CHROME_USER_DATA}`,
    '--start-maximized',
    '--disable-translate',
    '--lang=en-US',
    '--no-first-run',
  ], {
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],  // capture stderr
  });

  // Log Chrome errors for debugging
  chromeProcess.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('[WARNING]')) {
      console.log('   Chrome stderr:', msg.substring(0, 200));
    }
  });
  chromeProcess.unref();

  // Step 4: Wait for Chrome to be ready (30 second timeout)
  console.log('⏳ Waiting for Chrome to start (up to 30s)...');
  const ready = await waitForDebugPort(DEBUG_PORT, 30000);
  if (!ready) {
    console.error('❌ Chrome did not open debugging port.');
    console.error('   Try manually: close Chrome, then run in cmd.exe (NOT PowerShell):');
    console.error(`   "${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT}`);
    console.error('   Then check: http://127.0.0.1:9222/json/version');
    process.exit(1);
  }
  console.log('✅ Chrome is ready!');

  // Step 4: Connect Playwright to the running Chrome via CDP
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${DEBUG_PORT}`);
  console.log('✅ Playwright connected to your Chrome!');

  const context = browser.contexts()[0];
  const page = await context.newPage();

  try {
    // --- SCENE 1: Landing (0:00 - 0:12) ---
    console.log('🎬 Scene 1: Landing Page');
    await page.goto(SITE_URL);
    await page.waitForTimeout(10000);

    // --- SCENE 2: Dashboard (0:12 - 0:30) ---
    console.log('🎬 Scene 2: Connect Wallet & Dashboard');
    const heroConnectBtn = page.locator('.btn-primary', { hasText: /Connect Wallet/i });
    await heroConnectBtn.click();

    console.log('⏳ WAITING FOR WALLET APPROVAL...');
    await page.waitForURL(/.*dashboard/, { timeout: 60000 });
    await page.waitForTimeout(5000);

    await page.evaluate(() => document.body.style.zoom = '1.1');
    await page.locator('.glass-card').first().hover();
    await page.waitForTimeout(2000);
    await page.evaluate(() => document.body.style.zoom = '1.0');

    await page.getByText(/Top Picks For You/i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);

    // --- SCENE 3: Grant Search (0:30 - 1:00) ---
    console.log('🎬 Scene 3: Grant Search');
    await page.getByRole('link', { name: /Grant Search/i }).click();
    await page.waitForTimeout(3000);

    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    await page.getByText(/OneHack 3.0/i).first().click();
    await page.waitForTimeout(2000);

    const analyzeBtn = page.getByRole('button', { name: /Quick AI Analysis/i });
    await analyzeBtn.click();
    await page.evaluate(() => document.body.style.zoom = '1.2');
    await page.waitForTimeout(15000);
    await page.evaluate(() => document.body.style.zoom = '1.0');

    await page.locator('button', { hasText: '×' }).click();
    await page.waitForTimeout(2000);

    // --- SCENE 4: AI Idea Lab (1:00 - 1:50) ---
    console.log('🎬 Scene 4: AI Idea Lab');
    await page.getByRole('link', { name: /AI Idea Lab/i }).click();
    await page.waitForTimeout(3000);

    await page.locator('select').selectOption('11');
    await page.waitForTimeout(2000);

    const proceedBtn = page.getByRole('button', { name: /Proceed to Brainstorm/i });
    if (await proceedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await proceedBtn.click();
      await page.waitForTimeout(1000);
    }

    const prompt = "AI-powered grant discovery and application platform with on-chain Proof-of-Idea";
    await page.locator('textarea').fill("");
    await page.locator('textarea').type(prompt, { delay: 60 });
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: /Expand Concept/i }).click();
    await page.evaluate(() => document.body.style.zoom = '1.3');
    await page.waitForTimeout(15000);

    const refineBtn = page.getByRole('button', { name: /Refine Idea with AI/i });
    await refineBtn.scrollIntoViewIfNeeded();
    await refineBtn.click();
    await page.waitForTimeout(1000);
    const chatInput = page.locator('input.chat-input');
    await chatInput.type("Can you add more detail about the Move smart contract architecture?", { delay: 50 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(10000);

    const draftBtn = page.getByRole('button', { name: /Proceed to Draft/i });
    await draftBtn.scrollIntoViewIfNeeded();
    await draftBtn.click();
    await page.waitForTimeout(15000);
    await page.evaluate(() => document.body.style.zoom = '1.0');

    // --- SCENE 5: On-Chain Submit (1:50 - 2:15) ---
    console.log('🎬 Scene 5: On-Chain Submit');
    const submitBtn = page.getByRole('button', { name: /Finalize On-Chain/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    await page.evaluate(() => document.body.style.zoom = '1.3');
    console.log("⏳ WAITING 15 SECONDS FOR MANUAL WALLET APPROVAL...");
    await page.waitForTimeout(15000);

    const congrats = page.getByText(/CONGRATS!/i);
    await congrats.waitFor({ state: 'visible', timeout: 60000 });
    await page.waitForTimeout(5000);

    await page.getByRole('button', { name: /View My Certificate/i }).click();
    await page.waitForTimeout(5000);
    await page.evaluate(() => document.body.style.zoom = '1.0');

    // --- SCENE 6: Applications & Profile (2:15 - 2:35) ---
    console.log('🎬 Scene 6: Applications & Profile');
    await page.getByRole('link', { name: /My Applications/i }).click();
    await page.waitForTimeout(5000);

    await page.getByRole('link', { name: /Profile/i }).click();
    await page.waitForTimeout(5000);

    // --- SCENE 7: Vision & Outro (2:35 - 3:00) ---
    console.log('🎬 Scene 7: Outro');
    await page.locator('a', { hasText: /OneGrant/i }).first().click();
    await page.waitForTimeout(20000);

    console.log('✅ Demo recording complete!');

  } catch (error) {
    console.error('❌ Error during demo:', error);
  } finally {
    // Close only the tab, leave Chrome open
    await page.close();
    browser.close();
  }
})();
