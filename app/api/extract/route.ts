import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60; // Vercel Hobby plan limit is 10s, but Pro/Trial can be 60s. 
// Note: Puppeteer on Serverless is heavy.

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    // 1. Launch Browser (Optimized for Vercel Serverless)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // 2. Navigate and Extract
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

    // Scroll to trigger lazy loading
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve(true);
          }
        }, 100);
      });
    });

    // Extract Screenshot (Base64 for direct response)
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });

    // Extract Design Tokens
    const designSystem = await page.evaluate(() => {
      const tokens: any = {
        colors: new Set(),
        fonts: new Set(),
        variables: {},
        title: document.title
      };

      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color) tokens.colors.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          tokens.colors.add(style.backgroundColor);
        }
        if (style.fontFamily) {
          const firstFont = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          tokens.fonts.add(firstFont);
        }
      });

      // CSS Variables
      try {
        Array.from(document.styleSheets).forEach(sheet => {
          Array.from(sheet.cssRules || []).forEach((rule: any) => {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              const styles = rule.style;
              for (let i = 0; i < styles.length; i++) {
                const prop = styles[i];
                if (prop.startsWith('--')) {
                  tokens.variables[prop] = styles.getPropertyValue(prop).trim();
                }
              }
            }
          });
        });
      } catch (e) {}

      return {
        title: tokens.title,
        colors: Array.from(tokens.colors).slice(0, 30),
        fonts: Array.from(tokens.fonts).slice(0, 10),
        variables: tokens.variables
      };
    });

    await browser.close();

    return NextResponse.json({
      ...designSystem,
      screenshot: `data:image/png;base64,${screenshot}`,
      url
    });

  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ 
      error: "분석 실패", 
      details: error.message 
    }, { status: 500 });
  }
}
