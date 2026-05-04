const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function extractDesignSystem() {
    let url;
    // 1. Get URL from argument or url.txt
    const argUrl = process.argv[2];
    if (argUrl) {
        url = argUrl.trim();
    } else {
        try {
            url = await fs.readFile('url.txt', 'utf8');
            url = url.trim();
        } catch (err) {
            console.error('Error reading url.txt:', err);
        }
    }

    if (!url) {
        console.error('No URL provided (via arg or url.txt)');
        return;
    }

    console.log(`Analyzing: ${url}`);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    // 2. Set realistic User-Agent and Viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    try {
        console.log(`Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });

        // 3. Scroll to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight || totalHeight > 5000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        await fs.ensureDir(dataDir);

        // 1. Take Screenshot
        const screenshotPath = path.join(dataDir, 'screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('Screenshot saved.');

        // 2. Extract Design Tokens
        const designSystem = await page.evaluate(() => {
            const tokens = {
                colors: new Set(),
                fonts: new Set(),
                variables: {},
                siteTitle: document.title
            };

            // Helper to get all computed styles
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                
                // Colors
                if (style.color) tokens.colors.add(style.color);
                if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    tokens.colors.add(style.backgroundColor);
                }

                // Fonts
                if (style.fontFamily) {
                    const firstFont = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
                    tokens.fonts.add(firstFont);
                }
            });

            // CSS Variables from :root
            const rootStyle = window.getComputedStyle(document.documentElement);
            const sheets = Array.from(document.styleSheets);
            try {
                sheets.forEach(sheet => {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach(rule => {
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
            } catch (e) {
                console.warn('Could not access some stylesheets (CORS?)');
            }

            return {
                title: tokens.siteTitle,
                url: window.location.href,
                colors: Array.from(tokens.colors).slice(0, 50), // Limit for brevity
                fonts: Array.from(tokens.fonts),
                variables: tokens.variables
            };
        });

        // 3. Save JSON
        const jsonPath = path.join(dataDir, 'design-system.json');
        await fs.writeJson(jsonPath, designSystem, { spaces: 2 });
        console.log('Design system data saved.');

    } catch (err) {
        console.error('Error during extraction:', err);
    } finally {
        await browser.close();
    }
}

extractDesignSystem();
