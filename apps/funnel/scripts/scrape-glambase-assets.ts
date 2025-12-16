import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Asset {
    url: string;
    filename: string;
    type: 'image' | 'video' | 'other';
    metadata?: Record<string, any>;
}

interface ScrapedAssets {
    folderName: string;
    createdAt: string;
    assets: Asset[];
}

/**
 * Script to scrape images from Glambase character creation funnel
 * No account/login required - scrapes visible assets from the creation page
 */
async function scrapeGlambaseAssets() {
    const browser: Browser = await chromium.launch({
        headless: false, // Set to true for headless mode
        slowMo: 500 // Slow down actions for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page: Page = await context.newPage();

    try {
        // Navigate to the creation page
        console.log('Navigating to Glambase character creation page...');
        await page.goto('https://glambase.app/dashboard/create', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Handle age verification if present
        const ageVerificationButton = page.getByRole('button', { name: /I am 18 or older/i });
        if (await ageVerificationButton.isVisible().catch(() => false)) {
            console.log('Handling age verification...');
            await ageVerificationButton.click();
            await page.waitForTimeout(2000);
        }

        console.log('Page loaded. Scanning for images in the character creation funnel...');

        // Intercept network requests to find asset URLs
        const networkAssets: string[] = [];
        page.on('response', async (response) => {
            const url = response.url();
            if (url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|svg)(\?|$)/i)) {
                networkAssets.push(url);
            }
        });

        // Wait for page to fully load
        await page.waitForTimeout(2000);

        // Scroll to load lazy-loaded images
        console.log('Scrolling to load all images...');
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(2000);
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1000);

        // Interact with character creation options to reveal more images
        // Try clicking on different options to see if they reveal preview images
        console.log('Interacting with character creation options to reveal images...');

        // Try clicking on different body type, body shape, etc. options
        const radioButtons = await page.locator('input[type="radio"]').all();
        console.log(`Found ${radioButtons.length} radio buttons - clicking to reveal images...`);

        for (let i = 0; i < Math.min(radioButtons.length, 10); i++) {
            try {
                await radioButtons[i].click({ force: true });
                await page.waitForTimeout(500);
            } catch (e) {
                // Continue
            }
        }

        // Wait for images to load after interactions
        await page.waitForTimeout(2000);

        // Find all image elements
        console.log('Discovering images...');
        const images = await page.$$eval('img', (imgs) =>
            imgs
                .filter(img => img.src && !img.src.includes('data:image') && !img.src.includes('logo') && !img.src.includes('icon'))
                .map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    width: img.width,
                    height: img.height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                }))
        );

        // Find all video elements
        const videos = await page.$$eval('video', (videos) =>
            videos.map(video => ({
                src: video.src || video.currentSrc,
                poster: video.poster || '',
                width: video.width,
                height: video.height
            }))
        );

        // Find background images from CSS
        const backgroundImages = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const bgImages: string[] = [];
            elements.forEach((el) => {
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
                    const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
                    if (match && match[1] && !match[1].includes('data:')) {
                        bgImages.push(match[1]);
                    }
                }
            });
            return [...new Set(bgImages)];
        });

        // Find links that might be asset downloads
        const assetLinks = await page.$$eval('a[href*=".jpg"], a[href*=".png"], a[href*=".webp"], a[href*=".mp4"], a[href*=".gif"]', (links) =>
            links.map((link) => {
                const anchor = link as HTMLAnchorElement;
                return {
                    href: anchor.href,
                    text: anchor.textContent || '',
                    download: anchor.download || ''
                };
            })
        );

        console.log(`Found ${images.length} images, ${videos.length} videos, ${backgroundImages.length} background images, ${assetLinks.length} asset links`);

        // Add network intercepted assets
        console.log(`Also found ${networkAssets.length} assets from network requests`);

        // Combine all asset URLs
        const allAssetUrls = new Set<string>();

        // Add all found URLs to the set
        images.forEach(img => {
            if (img.src && img.naturalWidth > 50 && img.naturalHeight > 50) { // Filter out small icons
                allAssetUrls.add(img.src);
            }
        });
        videos.forEach(video => video.src && allAssetUrls.add(video.src));
        backgroundImages.forEach(bg => allAssetUrls.add(bg));
        assetLinks.forEach(link => link.href && allAssetUrls.add(link.href));
        networkAssets.forEach(url => allAssetUrls.add(url));

        // Compile all assets
        const assets: Asset[] = [];

        // Process all unique asset URLs
        let assetIndex = 0;
        for (const url of allAssetUrls) {
            if (!url || url.startsWith('data:')) continue;

            // Determine type
            let type: 'image' | 'video' | 'other' = 'image';
            if (url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)) {
                type = 'video';
            } else if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i)) {
                type = 'other';
            }

            // Extract metadata from original sources
            const img = images.find(i => i.src === url);
            const video = videos.find(v => v.src === url);
            const link = assetLinks.find(l => l.href === url);

            const metadata: Record<string, any> = {};
            if (img) {
                metadata.alt = img.alt;
                metadata.dimensions = `${img.width}x${img.height}`;
                metadata.naturalDimensions = `${img.naturalWidth}x${img.naturalHeight}`;
                metadata.source = 'img-element';
            } else if (video) {
                metadata.poster = video.poster;
                metadata.dimensions = `${video.width}x${video.height}`;
                metadata.source = 'video-element';
            } else if (link) {
                metadata.linkText = link.text;
                metadata.source = 'link-element';
            } else if (backgroundImages.includes(url)) {
                metadata.source = 'background-image';
            } else {
                metadata.source = 'network-request';
            }

            assets.push({
                url: url,
                filename: extractFilename(url) || `${type}-${assetIndex + 1}${getExtensionFromUrl(url)}`,
                type: type,
                metadata: metadata
            });

            assetIndex++;
        }

        // Remove duplicates
        const uniqueAssets = assets.filter((asset, index, self) =>
            index === self.findIndex((a) => a.url === asset.url)
        );

        console.log(`\nFound ${uniqueAssets.length} unique assets to download`);

        // Create output directory
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(process.cwd(), 'scraped-assets', `glambase-character-creation-${timestamp}`);
        fs.mkdirSync(outputDir, { recursive: true });

        // Create assets subdirectory
        const assetsDir = path.join(outputDir, 'assets');
        fs.mkdirSync(assetsDir, { recursive: true });

        // Download and save assets using request context
        console.log('\nDownloading assets...');
        const downloadedAssets: Asset[] = [];

        for (let i = 0; i < uniqueAssets.length; i++) {
            const asset = uniqueAssets[i];
            try {
                console.log(`Downloading ${i + 1}/${uniqueAssets.length}: ${asset.filename}`);

                // Use request context to fetch the asset
                const response = await context.request.get(asset.url).catch(() => null);

                if (response && response.ok()) {
                    const buffer = await response.body();
                    const fileExtension = path.extname(asset.filename) || getExtensionFromUrl(asset.url) || '.jpg';
                    const safeFilename = sanitizeFilename(asset.filename) || `asset-${i + 1}${fileExtension}`;
                    const filePath = path.join(assetsDir, safeFilename);

                    fs.writeFileSync(filePath, buffer);
                    downloadedAssets.push({
                        ...asset,
                        filename: safeFilename
                    });
                    console.log(`  ✓ Saved: ${safeFilename} (${(buffer.length / 1024).toFixed(2)} KB)`);
                } else {
                    console.log(`  ✗ Failed to download: ${asset.url}`);
                }
            } catch (error) {
                console.error(`  ✗ Error downloading ${asset.url}:`, (error as Error).message);
            }
        }

        // Save metadata
        const metadata: ScrapedAssets = {
            folderName: `glambase-character-creation-${timestamp}`,
            createdAt: new Date().toISOString(),
            assets: downloadedAssets
        };

        fs.writeFileSync(
            path.join(outputDir, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        // Save asset URLs as text file
        const urlsText = downloadedAssets.map(a => a.url).join('\n');
        fs.writeFileSync(path.join(outputDir, 'asset-urls.txt'), urlsText);

        console.log(`\n✅ Scraping complete!`);
        console.log(`📁 Output directory: ${outputDir}`);
        console.log(`📊 Total assets downloaded: ${downloadedAssets.length}`);
        console.log(`💾 Metadata saved to: ${path.join(outputDir, 'metadata.json')}`);

    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function extractFilename(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = path.basename(pathname.split('?')[0]);
        return filename || null;
    } catch {
        return null;
    }
}

function getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|svg)(\?|$)/i);
    return match ? `.${match[1]}` : '.jpg';
}

function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9._-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255);
}

// Run the script
scrapeGlambaseAssets()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });

export { scrapeGlambaseAssets };
