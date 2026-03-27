import { chromium, Page } from 'playwright';

/**
 * 🎬 OneGrant.AI — Demo Recording Script (PROFESSIONAL CLEAN MODE)
 * 
 * NO ON-SCREEN OVERLAYS (to keep the video clean).
 * USES SYSTEM BEEPS TO SIGNAL THE USER.
 */

const DEBUG_PORT = 9222;

// Function to make a system beep sound (terminal bell)
function beep() {
  process.stdout.write('\u0007');
}

(async () => {
  console.log('🔌 Connecting to your open Chrome...');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${DEBUG_PORT}`);
  } catch (e) {
    console.error(`❌ FAILED: Could not connect to Chrome on port ${DEBUG_PORT}!`);
    process.exit(1);
  }

  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('onegrantai.vercel.app'));
  
  if (!page) {
    page = await context.newPage();
    await page.goto('https://onegrantai.vercel.app', { waitUntil: 'domcontentloaded' });
  }

  await page.bringToFront();

  try {
    // ═══════════════════════════════════════════
    // SCENE 1: Landing + Wallet Connect
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 1: Landing Page (INTRO)');
    console.log('   (Intro vibe... waiting for you to connect wallet on your own time)');
    
    // Periodically beep to let the user know we are ready
    const beepTimer = setInterval(() => {
      if (!page.url().includes('/dashboard')) {
        beep(); 
      }
    }, 4000);

    // This will wait UNTIL the dashboard URL is reached
    await page.waitForURL(/.*dashboard/, { timeout: 120000 });
    clearInterval(beepTimer);

    console.log('   ✅ Wallet connected! Starting automation...');
    beep(); // Double beep for confirmation
    await page.waitForTimeout(500);
    beep();
    
    await page.waitForTimeout(4000);

    // ═══════════════════════════════════════════
    // SCENE 2: Dashboard Overview
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 2: Dashboard Overview');
    const statsCard = page.locator('.glass-card').first();
    if (await statsCard.isVisible()) {
      await statsCard.hover();
      await page.waitForTimeout(2500);
    }
    const topPicks = page.getByText(/Top Picks For You/i);
    if (await topPicks.isVisible({ timeout: 3000 }).catch(() => false)) {
      await topPicks.scrollIntoViewIfNeeded();
      await page.waitForTimeout(4000);
    }

    // ═══════════════════════════════════════════
    // SCENE 3: Grant Search + AI Analysis
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 3: Grant Search + AI Analysis');
    await page.getByRole('link', { name: /Grant Search/i }).click();
    await page.waitForTimeout(4000);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(1500);
    const grantCard = page.getByText(/OneHack 3\.0/i).first();
    await grantCard.click();
    await page.waitForTimeout(3000);
    const analyzeBtn = page.getByRole('button', { name: /Quick AI Analysis/i });
    if (await analyzeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await analyzeBtn.click();
      await page.waitForTimeout(18000);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    // ═══════════════════════════════════════════
    // SCENE 4: AI Idea Lab
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 4: AI Idea Lab');
    await page.getByRole('link', { name: /AI Idea Lab/i }).click();
    await page.waitForTimeout(3000);
    const selectEl = page.locator('select');
    if (await selectEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selectEl.selectOption('11');
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: /Proceed/i }).click();
    }
    const ideaText = "AI-powered grant discovery and application platform with on-chain Proof-of-Idea";
    const textarea = page.locator('textarea');
    if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textarea.click();
      for (const char of ideaText) {
        await page.keyboard.type(char, { delay: 45 + Math.random() * 25 });
      }
      await page.waitForTimeout(2000);
      const expandBtn = page.getByRole('button', { name: /Expand Concept/i });
      if (await expandBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expandBtn.click();
        await page.waitForTimeout(22000);
      }
    }

    // ═══════════════════════════════════════════
    // SCENE 5: Generate Draft
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 5: Generate Draft');
    const draftBtn = page.getByRole('button', { name: /Proceed to Draft|Generate Draft/i });
    if (await draftBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await draftBtn.click();
      await page.waitForTimeout(22000);
    }
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(4000);

    // ═══════════════════════════════════════════
    // SCENE 6: On-Chain Submit
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 6: On-Chain Submit');
    const submitBtn = page.getByRole('button', { name: /Finalize On-Chain/i });
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      
      // Triple beep to alert the user to sign the transaction
      beep(); await page.waitForTimeout(200);
      beep(); await page.waitForTimeout(200);
      beep();
      
      console.log('   ⚠️  YOUR TURN: APPROVE TRANSACTION!');
      await page.waitForTimeout(25000);
    }

    // ═══════════════════════════════════════════
    // SCENE 7: Outro
    // ═══════════════════════════════════════════
    console.log('🎬 SCENE 7: Outro');
    await page.getByRole('link', { name: /My Applications/i }).click();
    await page.waitForTimeout(5000);
    await page.getByRole('link', { name: /Profile/i }).click();
    await page.waitForTimeout(5000);
    const logo = page.locator('a').filter({ hasText: /OneGrant/i }).first();
    await logo.click();
    await page.waitForTimeout(8000);

    console.log('✅ DONE!');
  } catch (error) {
    console.error('❌ Error during demo:', error);
  }

  try { browser.disconnect(); } catch {}
})();
