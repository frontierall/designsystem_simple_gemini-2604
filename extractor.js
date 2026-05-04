const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function run() {
    // 1. Read multiple URLs from url.txt
    let urls = [];
    try {
        const content = await fs.readFile('url.txt', 'utf8');
        urls = content.split('\n').map(u => u.trim()).filter(u => u && u.startsWith('http'));
    } catch (err) {
        console.error('url.txt를 읽을 수 없습니다.');
        return;
    }

    if (urls.length === 0) {
        console.log('분석할 URL이 없습니다.');
        return;
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const history = [];

    for (const url of urls) {
        console.log(`\n--- Analyzing: ${url} ---`);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1440, height: 900 });

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Scroll to trigger lazy loading
            await page.evaluate(async () => {
                await new Promise(r => {
                    let totalHeight = 0;
                    let distance = 200;
                    let timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= document.body.scrollHeight || totalHeight > 3000) {
                            clearInterval(timer);
                            window.scrollTo(0, 0);
                            r();
                        }
                    }, 100);
                });
            });

            // 2. Component Structure Audit Logic
            const analysis = await page.evaluate(() => {
                const getTokens = () => {
                    const tokens = { colors: new Set(), fonts: new Set(), variables: {} };
                    document.querySelectorAll('*').forEach(el => {
                        const s = window.getComputedStyle(el);
                        if (s.color) tokens.colors.add(s.color);
                        if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') tokens.colors.add(s.backgroundColor);
                        if (s.fontFamily) tokens.fonts.add(s.fontFamily.split(',')[0].replace(/['"]/g, '').trim());
                    });
                    return tokens;
                };

                const analyzeButtons = () => {
                    const buttons = Array.from(document.querySelectorAll('button, a[class*="btn"], a[class*="button"]')).slice(0, 10);
                    return buttons.map(b => {
                        const s = window.getComputedStyle(b);
                        return {
                            text: b.innerText.substring(0, 10),
                            padding: s.padding,
                            borderRadius: s.borderRadius,
                            backgroundColor: s.backgroundColor,
                            fontSize: s.fontSize
                        };
                    });
                };

                const analyzeLayout = () => {
                    const mains = Array.from(document.querySelectorAll('main, section, .container, [class*="container"]')).slice(0, 5);
                    return mains.map(m => {
                        const s = window.getComputedStyle(m);
                        return {
                            tag: m.tagName,
                            className: m.className.substring(0, 20),
                            maxWidth: s.maxWidth,
                            margin: s.margin
                        };
                    });
                };

                const tokens = getTokens();
                return {
                    title: document.title,
                    url: window.location.href,
                    colors: Array.from(tokens.colors).slice(0, 30),
                    fonts: Array.from(tokens.fonts).slice(0, 10),
                    buttons: analyzeButtons(),
                    layout: analyzeLayout()
                };
            });

            // 3. Save to Historical Archive
            const domain = new URL(url).hostname.replace(/\./g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const folderName = `${timestamp}_${domain}`;
            const folderPath = path.join(__dirname, 'data', folderName);
            await fs.ensureDir(folderPath);

            await page.screenshot({ path: path.join(folderPath, 'screenshot.png'), fullPage: false });
            await fs.writeJson(path.join(folderPath, 'result.json'), analysis, { spaces: 2 });

            history.push({
                id: folderName,
                timestamp,
                title: analysis.title,
                url,
                path: `./data/${folderName}/`
            });

            console.log(`Saved to ${folderName}`);

        } catch (err) {
            console.error(`Error analyzing ${url}:`, err.message);
        } finally {
            await page.close();
        }
    }

    // Update history.json index
    const historyPath = path.join(__dirname, 'data', 'history.json');
    let existingHistory = [];
    if (await fs.pathExists(historyPath)) {
        existingHistory = await fs.readJson(historyPath);
    }
    const updatedHistory = [...history, ...existingHistory].slice(0, 50); // Keep last 50
    await fs.writeJson(historyPath, updatedHistory, { spaces: 2 });

    await browser.close();
    console.log('\n--- All analysis completed ---');
}

run();
