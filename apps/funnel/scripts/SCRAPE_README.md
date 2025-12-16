# Glambase Assets Scraper

This script uses Playwright to scrape images from the Glambase character creation funnel at `https://glambase.app/dashboard/create`.

**No account/login required** - it scrapes all visible images from the character creation interface.

## Usage

```bash
npm run scrape:glambase
```

or

```bash
yarn scrape:glambase
```

## What it does

1. **Navigates** to `https://glambase.app/dashboard/create`
2. **Handles age verification** if present
3. **Interacts with character creation options** to reveal preview images (clicks radio buttons for different body types, shapes, etc.)
4. **Discovers assets** by:
    - Finding all `<img>` elements (filtering out small icons/logos)
    - Finding all `<video>` elements
    - Finding background images from CSS
    - Finding asset links
    - Intercepting network requests for asset URLs
5. **Downloads** all discovered assets
6. **Saves** everything in a structured format:
    ```
    scraped-assets/
      glambase-character-creation-{timestamp}/
        assets/
          image1.jpg
          image2.png
          video1.mp4
          ...
        metadata.json    # Complete asset metadata
        asset-urls.txt  # List of all asset URLs
    ```

## Output Structure

### metadata.json

Contains structured information about all scraped assets:

```json
{
    "folderName": "glambase-character-creation-2024-01-01T12-00-00-000Z",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "assets": [
        {
            "url": "https://...",
            "filename": "image1.jpg",
            "type": "image",
            "metadata": {
                "alt": "...",
                "dimensions": "1920x1080",
                "naturalDimensions": "1920x1080",
                "source": "img-element"
            }
        }
    ]
}
```

### asset-urls.txt

Plain text file with one URL per line for easy reference.

## Configuration

You can modify the script to:

- Change the headless mode (currently set to `false` for visibility)
- Adjust timeout values
- Change the number of radio buttons to interact with (currently limited to 10)
- Filter image sizes (currently filters out images smaller than 50x50 pixels)
- Change output directory location

## Requirements

- Node.js >= 20.0.0
- Playwright (already installed)
- TypeScript (already installed)
- ts-node (already installed)

## Troubleshooting

1. **No assets found**: The page structure may have changed - check the console output. The script filters out small icons/logos.
2. **Download errors**: Some assets may require authentication or have CORS restrictions - check the console for details
3. **Age verification not working**: Make sure the age verification button text matches (case-insensitive)
