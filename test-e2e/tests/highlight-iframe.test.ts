import { newTestPage } from "../test-utils";
import { expect } from "chai";
import { closePage } from "pentf/browser_utils";
import { wait } from "pentf/utils";

export const description = "Mirror component state to the devtools";

export async function run(config: any) {
	const { page, devtools } = await newTestPage(config, "iframe", {
		preact: "next",
	});

	await devtools.hover('[data-testid="tree-item"][data-name="Counter"]');

	// Wait for possible flickering to occur
	await wait(1000);

	const log = (await page.evaluate(() => (window as any).log)) as any[];
	expect(log.filter(x => x.type === "highlight").length).to.equal(1);

	await closePage(page);
}
