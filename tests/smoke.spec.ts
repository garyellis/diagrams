import { expect, test } from '@playwright/test';

interface DiagramConfig {
    path: string;
    nodes: string[];
    connections: string[];
    cards: string[];
    groups: string[];
    steps: number;
    button: string;
}

const diagrams: Record<string, DiagramConfig> = {
    'Failure diagram': {
        path: '/cf-api-proxy-failure.html',
        nodes: ['user', 'edge', 'origin', 'api', 'admin'],
        connections: [
            'link-user-edge',
            'link-edge-origin',
            'link-admin-api',
            'link-api-edge',
        ],
        cards: ['dns-record'],
        groups: [],
        steps: 5,
        button: 'Play Outage Scenario',
    },
    'Solution diagram': {
        path: '/cf-api-proxy-solution.html',
        nodes: [
            'admin',
            'azure-portal',
            'azure-dns',
            'cf-api',
            'cf-dns',
            'edge',
            'user',
            'origin',
        ],
        connections: [
            'link-admin-portal',
            'link-portal-dns',
            'link-user-edge',
            'link-edge-origin',
        ],
        cards: ['dns-record-azure', 'dns-record-cf'],
        groups: ['azure-group', 'cf-group'],
        steps: 5,
        button: 'Demonstrate Failover',
    },
};

for (const [name, cfg] of Object.entries(diagrams)) {
    test.describe(name, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(cfg.path);
        });

        test('loads without console errors', async ({ page }) => {
            const errors: string[] = [];
            page.on('pageerror', (err) => errors.push(err.message));
            await page.reload();
            expect(errors).toEqual([]);
        });

        test('renders stage', async ({ page }) => {
            await expect(page.locator('#stage')).toBeVisible();
        });

        test('renders all nodes', async ({ page }) => {
            for (const id of cfg.nodes) {
                await expect(page.locator(`#${id}`)).toBeVisible();
            }
        });

        test('renders all connections', async ({ page }) => {
            for (const id of cfg.connections) {
                await expect(page.locator(`#${id}`)).toBeAttached();
            }
        });

        if (cfg.cards.length > 0) {
            test('renders DNS cards', async ({ page }) => {
                for (const id of cfg.cards) {
                    await expect(page.locator(`#${id}`)).toBeVisible();
                }
            });
        }

        if (cfg.groups.length > 0) {
            test('renders group boxes', async ({ page }) => {
                for (const id of cfg.groups) {
                    await expect(page.locator(`#${id}`)).toBeVisible();
                }
            });
        }

        test('renders legend', async ({ page }) => {
            await expect(page.locator('#legend')).toBeVisible();
        });

        test('renders step dots', async ({ page }) => {
            await expect(page.locator('.step-dot')).toHaveCount(cfg.steps);
        });

        test('play button is visible and enabled', async ({ page }) => {
            const btn = page.locator('#run-btn');
            await expect(btn).toBeVisible();
            await expect(btn).toBeEnabled();
            await expect(btn).toHaveText(cfg.button);
        });
    });
}
