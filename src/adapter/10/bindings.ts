import { HookType } from "../shared/hooks";
import type { Component, VNode } from "preact";
import type {
	Component as IComponent,
	VNode as IVNode,
} from "preact/src/internal";
import { ComponentHooks, HookState, PreactBindings } from "../shared/bindings";
import { RendererConfig } from "../shared/renderer";
import { getRenderReasonPost } from "./renderReason";

// Mangle accessors

/**
 * Get the direct parent of a `vnode`
 */
export function getVNodeParent(vnode: VNode): VNode | null {
	return (
		(vnode as IVNode)._parent ||
		(vnode as any).__ ||
		// Older Preact X versions used `__p`
		(vnode as any).__p ||
		null
	);
}

/**
 * Check if a `vnode` is the root of a tree
 */
export function isRoot(vnode: VNode, config: RendererConfig): boolean {
	return getVNodeParent(vnode) == null && vnode.type === config.Fragment;
}

/**
 * Return the component instance of a `vnode` or `hookState`
 */
export function getComponent(node: HookState | VNode): Component | null {
	return (node as HookState | IVNode)._component || (node as any).__c || null;
}

/**
 * Get a `vnode`'s _dom reference.
 */
export function getDom(vnode: VNode): HTMLElement | Text | null {
	return (vnode as IVNode)._dom || (vnode as any).__e || null;
}

export function hasDom(x: any): boolean {
	return x != null && ("_dom" in x || "__e" in x);
}

/**
 * Check if a `vnode` represents a `Suspense` component
 */
export function isSuspenseVNode(vnode: VNode): boolean {
	const c = getComponent(vnode) as any;
	// FYI: Mangling of `_childDidSuspend` is not stable in Preact < 10.3.0
	return c != null && !!(c._childDidSuspend || c.__c);
}

/**
 * Get the internal hooks state of a component
 */
export function getComponentHooks(vnode: VNode): ComponentHooks | null {
	const c = getComponent(vnode);
	if (!c) return null;
	return (c as any).__hooks || (c as any).__H || null;
}

export function getStatefulHooks(vnode: VNode): HookState[] | null {
	const hooks = getComponentHooks(vnode);
	return hooks !== null
		? hooks._list ||
				hooks.__ ||
				hooks.i || // Preact 10.1.0
				null
		: null;
}

export function isUseReducerOrState(hookState: HookState): boolean {
	return !!hookState._component || !!hookState.__c;
}

export function getStatefulHookValue(hookState: HookState): unknown {
	if (hookState !== null) {
		const value = hookState._value || hookState.__ || null;
		if (value !== null && Array.isArray(value)) {
			return value[0];
		}
	}

	return null;
}

export function getHookState(
	vnode: VNode,
	index: number,
	type?: HookType,
): unknown {
	const c = getComponent(vnode);
	if (c === null) return null;

	const list = getStatefulHooks(vnode);
	if (list && list[index]) {
		// useContext
		if (type === HookType.useContext) {
			const context = list[index]._context || list[index].__c || list[index].c;
			const provider = c.context[context._id] || c.context[context.__c];
			return provider
				? provider.props.value
				: context._defaultValue || context.__;
		}
		const value = list[index]._value || list[index].__;

		if (type === HookType.useRef) {
			return value.current;
		} else if (type === HookType.useErrorBoundary && !value) {
			return "__preact_empty__";
		}

		return value;
	}

	return [];
}

/**
 * Get the diffed children of a `vnode`
 */
export function getActualChildren(
	vnode: VNode,
): Array<VNode | null | undefined> {
	return (vnode as IVNode)._children || (vnode as any).__k || [];
}

// End Mangle accessors

/**
 * Get the root of a `vnode`
 */
export function findRoot(vnode: VNode, config: RendererConfig): VNode {
	let next: VNode | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		if (isRoot(next, config)) {
			return next;
		}
	}

	return vnode;
}

/**
 * Get the ancestor component that rendered the current vnode
 */
export function getAncestor(vnode: VNode): VNode | null {
	let next: VNode | null = vnode;
	while ((next = getVNodeParent(next)) != null) {
		return next;
	}

	return null;
}

/**
 * Get human readable name of the component/dom element
 */
export function getDisplayName(vnode: VNode, config: RendererConfig): string {
	const { type } = vnode;
	if (type === config.Fragment) return "Fragment";
	else if (typeof type === "function") {
		// Context is a special case :((
		// See: https://reactjs.org/docs/context.html#contextdisplayname
		const c = getComponent(vnode)!;
		if (c !== null) {
			// Consumer
			if (c.constructor) {
				const ct = (c.constructor as any).contextType;
				if (ct && ct.Consumer === type && ct.displayName) {
					return `${ct.displayName}.Consumer`;
				}
			}

			// Provider
			if ((c as any).sub) {
				const ctx = (type as any)._contextRef || (type as any).__;
				if (ctx && ctx.displayName) {
					return `${ctx.displayName}.Provider`;
				}
			}

			if (isSuspenseVNode(vnode)) {
				return "Suspense";
			}

			// Preact 10.4.1 uses a raw Component as a child for Suspense
			// by doing `createElement(Component, ...);`
			if (type === config.Component) {
				return "Component";
			}
		}

		return type.displayName || type.name || "Anonymous";
	} else if (typeof type === "string") return type;
	return "#text";
}

export function getEndTime(vnode: VNode): number {
	return vnode.endTime || 0;
}

export function getStartTime(vnode: VNode): number {
	return vnode.startTime || 0;
}

export function getNextState<S>(c: Component): S {
	return (c as IComponent)._nextState || (c as any).__s || null;
}

export function setNextState<S>(c: Component, value: S): S {
	return ((c as IComponent)._nextState = (c as any).__s = value);
}

function getSuspenseStateKey(c: Component<any, any>) {
	if ("_suspended" in c.state) {
		return "_suspended";
	} else if ("__e" in c.state) {
		return "__e";
	}

	// This is a bit whacky, but property name mangling is unsafe in
	// Preact <10.4.9
	const keys = Object.keys(c.state);
	if (keys.length > 0) {
		return keys[0];
	}

	return null;
}

export function getSuspendedState(vnode: VNode) {
	const c = getComponent(vnode);
	if (c) {
		const key = getSuspenseStateKey(c);
		if (key) {
			return !!(c as any)._nextState[key];
		}
	}

	return null;
}

export function isTextVNode(vnode: VNode) {
	return vnode !== null && vnode.type === null;
}

export function createSuspenseState(vnode: VNode, suspended: boolean) {
	const c = getComponent(vnode) as Component<any, any>;
	const key = getSuspenseStateKey(c);
	if (c && key) {
		return { [key]: suspended };
	}

	return {};
}

export function getInstance(vnode: VNode): any {
	// For components we use the instance to check refs, otherwise
	// we'll use a dom node
	if (typeof vnode.type === "function") {
		return getComponent(vnode);
	}

	return getDom(vnode);
}

export function isComponent(vnode: VNode) {
	return vnode !== null && typeof vnode.type === "function";
}

export function isVNode(x: any): x is VNode {
	return x != null && x.type !== undefined && hasDom(x);
}

export function isElement(vnode: VNode): boolean {
	return typeof vnode.type === "string";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isPortal(vnode: VNode) {
	// TODO: Find a way to detect portals
	return false;
}

export const bindingsV10: PreactBindings<VNode> = {
	isRoot,
	getDisplayName,
	getPropsVNodeDisplayName: getDisplayName,
	getActualChildren,
	getAncestor,
	getDom,
	isTextVNode,
	getInstance,
	createSuspenseState,
	getComponent,
	getComponentHooks,
	getHookState,
	getVNodeParent,
	isComponent,
	isElement,
	isSuspenseVNode,
	getSuspendedState,
	isVNode,
	setNextState,
	isPortal,
	getStatefulHookValue,
	getStatefulHooks,
	isUseReducerOrState,
	getRenderReasonPost,
};
