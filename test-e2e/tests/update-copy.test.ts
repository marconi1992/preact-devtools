import {
	clickTreeItem,
	newTestPage,
	typeText,
	waitForSelector,
} from "../test-utils";
import { Page } from "puppeteer";

async function type(page: Page, devtools: Page, value: string | number) {
	const input = '[data-testid="prop-value"] input';
	await waitForSelector(devtools, input);

	await typeText(devtools, input, String(value));
	await page.keyboard.press("Enter");
}

async function waitForResult(page: Page, selector: string, value: string) {
	await page.waitForFunction(
		(s: string, v: string) => {
			const el = document.querySelector(`[data-testid="${s}"]`);
			return el !== null ? el.textContent === v : false;
		},
		{ timeout: 1000 },
		selector,
		value,
	);
}

export const description =
	"Create a copy when doing props/state/context updates";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "update-all");

	// Props
	await clickTreeItem(devtools, "Props");
	await type(page, devtools, "1");
	await waitForResult(page, "props-result", "props: 1, true");

	// State
	await clickTreeItem(devtools, "State");
	await type(page, devtools, "1");
	await waitForResult(page, "state-result", "state: 1, true");

	// Legacy Context
	await clickTreeItem(devtools, "LegacyConsumer");
	await type(page, devtools, "1");
	await waitForResult(page, "legacy-context-result", "legacy context: 1");
}
