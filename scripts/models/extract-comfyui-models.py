#!/usr/bin/env python3
"""
ComfyUI Model List Extractor

This script extracts the complete list of all available models from ComfyUI Manager
on the RunPod server and saves them to JSON and CSV files.

Usage:
    python scripts/extract-comfyui-models.py [--url URL] [--output-dir DIR] [--headless]

Requirements:
    pip install playwright beautifulsoup4 pandas

Author: RYLA Team
Date: 2025-12-19
"""

import os
import sys
import json
import csv
import argparse
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

try:
    from playwright.sync_api import sync_playwright, Page, Browser
    import pandas as pd
except ImportError:
    print("ERROR: Required packages not installed.")
    print("Please run: pip install playwright beautifulsoup4 pandas")
    print("Then run: playwright install chromium")
    sys.exit(1)


# Default RunPod ComfyUI URL
DEFAULT_URL = "https://5qj51a8nptsc4h-8188.proxy.runpod.net/"


def wait_for_table_load(page: Page, timeout: int = 30000) -> bool:
    """Wait for the model table to load."""
    try:
        # Wait for the table or model count to appear
        page.wait_for_selector('text="external models"', timeout=timeout)
        return True
    except Exception as e:
        print(f"Warning: Could not find model count indicator: {e}")
        return False


def scroll_to_load_all_models(page: Page, max_scrolls: int = 100) -> None:
    """Scroll through the table to load all models."""
    print("Scrolling to load all models...")
    
    last_height = 0
    scroll_count = 0
    no_change_count = 0
    
    while scroll_count < max_scrolls:
        # Get current scroll position
        current_height = page.evaluate("document.body.scrollHeight")
        
        # Scroll down
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)  # Wait for content to load
        
        # Check if we've reached the bottom
        new_height = page.evaluate("document.body.scrollHeight")
        
        if new_height == last_height:
            no_change_count += 1
            if no_change_count >= 3:
                print("Reached end of scrollable content.")
                break
        else:
            no_change_count = 0
        
        last_height = new_height
        scroll_count += 1
        
        if scroll_count % 10 == 0:
            print(f"  Scrolled {scroll_count} times...")
    
    # Scroll back to top
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)


def extract_models_from_table(page: Page) -> List[Dict[str, str]]:
    """Extract all model data from the table."""
    print("Extracting model data from table...")
    
    models = []
    
    # Try to find the table using various selectors
    # The table might be in a shadow DOM or have dynamic class names
    try:
        # Get the model count first
        count_text = page.locator('text=/\\d+ external models/').first.inner_text()
        print(f"Found: {count_text}")
        
        # Extract models using JavaScript evaluation
        models_data = page.evaluate("""
            () => {
                const models = [];
                const rows = document.querySelectorAll('table tbody tr, [role="row"]:not([role="columnheader"])');
                
                rows.forEach((row, index) => {
                    try {
                        const cells = row.querySelectorAll('td, [role="gridcell"]');
                        if (cells.length >= 5) {
                            const id = cells[0]?.innerText?.trim() || '';
                            const name = cells[1]?.innerText?.trim() || '';
                            const size = cells[3]?.innerText?.trim() || '';
                            const type = cells[4]?.innerText?.trim() || '';
                            const base = cells[5]?.innerText?.trim() || '';
                            
                            // Only add if we have at least an ID and name
                            if (id && name) {
                                models.push({
                                    id: id,
                                    name: name,
                                    size: size,
                                    type: type,
                                    base: base
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Error extracting row:', e);
                    }
                });
                
                return models;
            }
        """)
        
        if models_data and len(models_data) > 0:
            models = models_data
            print(f"Extracted {len(models)} models using table selector")
        else:
            # Fallback: try to find all model entries by looking for "Install" buttons
            print("Trying alternative extraction method...")
            models = extract_models_alternative(page)
            
    except Exception as e:
        print(f"Error extracting from table: {e}")
        print("Trying alternative extraction method...")
        models = extract_models_alternative(page)
    
    return models


def extract_models_alternative(page: Page) -> List[Dict[str, str]]:
    """Alternative extraction method using Install buttons and surrounding elements."""
    models = []
    
    try:
        # Find all Install buttons and extract data from their parent rows
        install_buttons = page.locator('button:has-text("Install"), button:has-text("In tall")').all()
        print(f"Found {len(install_buttons)} Install buttons")
        
        for i, button in enumerate(install_buttons):
            try:
                # Get the row containing this button
                row = button.locator('xpath=ancestor::tr | ancestor::*[@role="row"]').first
                
                # Extract data from the row
                row_data = row.evaluate("""
                    (row) => {
                        const cells = row.querySelectorAll('td, [role="gridcell"]');
                        const data = {};
                        
                        cells.forEach((cell, idx) => {
                            const text = cell.innerText?.trim() || '';
                            if (idx === 0) data.id = text;
                            else if (idx === 1) data.name = text;
                            else if (idx === 3) data.size = text;
                            else if (idx === 4) data.type = text;
                            else if (idx === 5) data.base = text;
                        });
                        
                        return data;
                    }
                """)
                
                if row_data.get('name'):
                    models.append({
                        'id': row_data.get('id', str(i + 1)),
                        'name': row_data.get('name', ''),
                        'size': row_data.get('size', ''),
                        'type': row_data.get('type', ''),
                        'base': row_data.get('base', '')
                    })
                    
            except Exception as e:
                print(f"Error extracting model {i}: {e}")
                continue
        
        print(f"Extracted {len(models)} models using alternative method")
        
    except Exception as e:
        print(f"Error in alternative extraction: {e}")
    
    return models


def navigate_to_model_manager(page: Page, base_url: str) -> bool:
    """Navigate to the ComfyUI Model Manager interface."""
    try:
        print(f"Navigating to {base_url}...")
        page.goto(base_url, wait_until="networkidle", timeout=60000)
        time.sleep(3)
        
        # Click the settings button (⚙️)
        print("Clicking settings button...")
        settings_button = page.locator('button:has-text("⚙️"), button[aria-label*="settings" i]').first
        if settings_button.is_visible():
            settings_button.click()
            time.sleep(2)
        else:
            # Try alternative selector
            page.click('button:has-text("⚙️")')
            time.sleep(2)
        
        # Click ComfyUI Manager
        print("Opening ComfyUI Manager...")
        manager_button = page.locator('button:has-text("ComfyUI Manager"), button:has-text("Manager")').first
        if manager_button.is_visible():
            manager_button.click()
            time.sleep(3)
        else:
            print("Could not find ComfyUI Manager button")
            return False
        
        # Click Model Manager
        print("Opening Model Manager...")
        model_manager_button = page.locator('button:has-text("Model Manager")').first
        if model_manager_button.is_visible():
            model_manager_button.click()
            time.sleep(5)  # Wait for the model list to load
        else:
            print("Could not find Model Manager button")
            return False
        
        # Wait for the table to load
        print("Waiting for model table to load...")
        if not wait_for_table_load(page):
            print("Warning: Model table may not have loaded completely")
        
        return True
        
    except Exception as e:
        print(f"Error navigating to model manager: {e}")
        return False


def save_models(models: List[Dict[str, str]], output_dir: Path) -> None:
    """Save models to JSON and CSV files."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save as JSON
    json_path = output_dir / f"comfyui-models-{timestamp}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump({
            'extracted_at': datetime.now().isoformat(),
            'total_models': len(models),
            'models': models
        }, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(models)} models to {json_path}")
    
    # Save as CSV
    csv_path = output_dir / f"comfyui-models-{timestamp}.csv"
    if models:
        df = pd.DataFrame(models)
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"Saved {len(models)} models to {csv_path}")
    
    # Save as Markdown table
    md_path = output_dir / f"comfyui-models-{timestamp}.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(f"# ComfyUI Available Models\n\n")
        f.write(f"**Extracted**: {datetime.now().isoformat()}\n")
        f.write(f"**Total Models**: {len(models)}\n\n")
        f.write("| ID | Name | Size | Type | Base |\n")
        f.write("|----|------|------|------|------|\n")
        for model in models:
            name = model.get('name', '').replace('|', '\\|')
            f.write(f"| {model.get('id', '')} | {name} | {model.get('size', '')} | {model.get('type', '')} | {model.get('base', '')} |\n")
    print(f"Saved {len(models)} models to {md_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Extract all available models from ComfyUI Manager"
    )
    parser.add_argument(
        '--url',
        type=str,
        default=DEFAULT_URL,
        help=f'ComfyUI server URL (default: {DEFAULT_URL})'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='docs/ops/runpod',
        help='Output directory for extracted data (default: docs/ops/runpod)'
    )
    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode'
    )
    parser.add_argument(
        '--slow-mo',
        type=int,
        default=0,
        help='Slow down operations by specified milliseconds (default: 0)'
    )
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("ComfyUI Model List Extractor")
    print("=" * 60)
    print(f"URL: {args.url}")
    print(f"Output: {output_dir}")
    print(f"Headless: {args.headless}")
    print("=" * 60)
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(
            headless=args.headless,
            slow_mo=args.slow_mo
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        page = context.new_page()
        
        try:
            # Navigate to model manager
            if not navigate_to_model_manager(page, args.url):
                print("ERROR: Failed to navigate to model manager")
                sys.exit(1)
            
            # Scroll to load all models
            scroll_to_load_all_models(page)
            
            # Extract models
            models = extract_models_from_table(page)
            
            if not models:
                print("ERROR: No models extracted. The page structure may have changed.")
                print("Taking a screenshot for debugging...")
                screenshot_path = output_dir / f"debug-screenshot-{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                page.screenshot(path=str(screenshot_path))
                print(f"Screenshot saved to {screenshot_path}")
                sys.exit(1)
            
            print(f"\nSuccessfully extracted {len(models)} models!")
            
            # Save models
            save_models(models, output_dir)
            
            print("\n" + "=" * 60)
            print("Extraction complete!")
            print("=" * 60)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            # Save screenshot for debugging
            screenshot_path = output_dir / f"error-screenshot-{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            page.screenshot(path=str(screenshot_path))
            print(f"Error screenshot saved to {screenshot_path}")
            sys.exit(1)
            
        finally:
            if not args.headless:
                print("\nBrowser will remain open for 10 seconds for inspection...")
                time.sleep(10)
            browser.close()


if __name__ == "__main__":
    main()
