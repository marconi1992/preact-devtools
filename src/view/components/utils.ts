const OFFSET = 16;

export function scrollIntoView(el: HTMLElement) {
	// Find closest scrollable parent
	let parent: HTMLElement | null = el;
	while ((parent = parent.parentNode as any)) {
		if (parent.scrollHeight > parent.clientHeight) {
			break;
		}
	}

	if (parent) {
		let rect = el.getBoundingClientRect();
		let top = parent.scrollTop;

		if (el.offsetTop <= parent.scrollTop) {
			top = el.offsetTop - OFFSET;
		} else if (
			el.offsetTop + rect.height >
			parent.scrollTop + parent.clientHeight
		) {
			top = el.offsetTop - parent.clientHeight + rect.height + OFFSET;
		} else {
			return;
		}
		parent.scrollTo({
			top,
			behavior: "smooth",
		});
	}
}
