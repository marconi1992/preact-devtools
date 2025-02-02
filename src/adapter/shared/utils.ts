import { PreactBindings, SharedVNode } from "./bindings";

export function traverse<T extends SharedVNode>(
	vnode: T,
	fn: (vnode: T) => void,
	bindings: PreactBindings<T>,
) {
	fn(vnode);
	const children = bindings.getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			traverse(child, fn, bindings);
			fn(child);
		}
	}
}
