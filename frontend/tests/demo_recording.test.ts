import { test, expect } from '@playwright/test';

test('Full App Demo Recording', async ({ page }) => {
  // --- SCENE 1: Landing (0:00 - 0:12) ---
  await page.goto('/');
  await expect(page).toHaveTitle(/OneGrant/i);
  await page.waitForTimeout(10000); // 10s for intro voiceover

  // --- SCENE 2: Dashboard (0:12 - 0:30) ---
  // Connect Wallet flow
  const connectBtn = page.getByRole('button', { name: /Connect Wallet/i });
  await connectBtn.click();
  
  // Note: OneWallet extension manual approval is expected here if not auto-connected.
  // We'll give some time or wait for navigation to dashboard.
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
  await page.waitForTimeout(5000); // Wait for dashboard animations

  // Hover over stats strip
  await page.evaluate(() => document.body.style.zoom = '1.1');
  await page.locator('.glass-card').first().hover();
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.body.style.zoom = '1.0');

  // Scroll to "Top Picks"
  await page.getByText(/Top Picks For You/i).scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);

  // --- SCENE 3: Grant Search (0:30 - 1:00) ---
  await page.getByRole('link', { name: /Grant Search/i }).click();
  await page.waitForTimeout(3000);
  
  // Scroll banners
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(2000);
  
  // Open OneHack 3.0
  await page.getByText(/OneHack 3.0/i).first().click();
  await page.waitForTimeout(2000);
  
  // Quick AI Analysis
  const analyzeBtn = page.getByRole('button', { name: /Quick AI Analysis/i });
  await analyzeBtn.click();
  await page.evaluate(() => document.body.style.zoom = '1.2');
  await page.waitForTimeout(15000); // Wait for analysis
  await page.evaluate(() => document.body.style.zoom = '1.0');
  
  // Close modal (clicking outside)
  await page.mouse.click(10, 10);
  await page.waitForTimeout(2000);

  // --- SCENE 4: AI Idea Lab (1:00 - 1:50) ---
  await page.getByRole('link', { name: /AI Idea Lab/i }).click();
  await page.waitForTimeout(3000);
  
  // Select Grant (Option 2 is usually OneHack)
  await page.locator('select').selectOption({ label: /OneHack 3.0/i });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: /Proceed/i }).click();
  
  // Type Idea
  const prompt = "AI-powered grant discovery and application platform with on-chain Proof-of-Idea";
  await page.locator('textarea').fill(""); // Clear
  await page.locator('textarea').type(prompt, { delay: 60 });
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: /Expand Concept/i }).click();
  await page.evaluate(() => document.body.style.zoom = '1.3');
  await page.waitForTimeout(15000); // Generating...
  
  // Refine Idea (Chat)
  await page.getByRole('button', { name: /Refine Idea with AI/i }).click();
  const chatInput = page.locator('input.chat-input');
  await chatInput.type("Can you add more detail about the Move smart contract architecture?", { delay: 50 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(10000);
  
  await page.getByRole('button', { name: /Proceed to Draft/i }).click();
  await page.waitForTimeout(15000); // Generating draft...
  await page.evaluate(() => document.body.style.zoom = '1.0');

  // --- SCENE 5: On-Chain Submit (1:50 - 2:15) ---
  await page.getByRole('button', { name: /Finalize On-Chain/i }).click();
  
  // ZOOM and PAUSE for manual approval
  await page.evaluate(() => document.body.style.zoom = '1.3');
  console.log("WAITING 15 SECONDS FOR MANUAL WALLET APPROVAL...");
  await page.waitForTimeout(15000); 
  
  // Wait for success
  await expect(page.getByText(/CONGRATS!/i)).toBeVisible({ timeout: 60000 });
  await page.waitForTimeout(5000);
  
  await page.getByRole('button', { name: /View My Certificate/i }).click();
  await page.waitForTimeout(5000);
  await page.evaluate(() => document.body.style.zoom = '1.0');

  // --- SCENE 6: Applications & Profile (2:15 - 2:35) ---
  await page.getByRole('link', { name: /My Applications/i }).click();
  await page.waitForTimeout(5000);
  
  await page.getByRole('link', { name: /Profile/i }).click();
  await page.waitForTimeout(5000);

  // --- SCENE 7: Vision & Outro (2:35 - 3:00) ---
  await page.getByRole('link', { name: /OneGrant/i }).first().click(); // Logo link
  await page.waitForTimeout(20000); // Long outro
});
