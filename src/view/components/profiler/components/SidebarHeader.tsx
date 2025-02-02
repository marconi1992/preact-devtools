import { h, Fragment } from "preact";
import { Actions } from "../../Actions";
import s from "../../sidebar/Sidebar.module.css";
import {
	useStore,
	useObserver,
	useEmitter,
} from "../../../store/react-bindings";
import { ComponentName } from "../../ComponentName";
import { useCallback } from "preact/hooks";
import { IconBtn } from "../../IconBtn";
import { BugIcon, InspectNativeIcon, CodeIcon } from "../../icons";
import { DevNodeType } from "../../../store/types";

export function SidebarHeader() {
	const store = useStore();
	const selected = useObserver(() => store.profiler.selectedNode.$);
	const emit = useEmitter();
	const log = useCallback(() => {
		if (selected) emit("log", { id: selected.id, children: selected.children });
	}, [selected]);
	const inspectHostNode = useCallback(() => {
		emit("inspect-host-node", null);
	}, []);
	const viewSource = useCallback(() => {
		if (selected) {
			emit("view-source", selected.id);
		}
	}, [selected]);

	const canViewSource =
		selected &&
		selected.type !== DevNodeType.Group &&
		selected.type !== DevNodeType.Element;

	return (
		<Actions class={s.actions}>
			<ComponentName>{selected && selected.name}</ComponentName>
			<div class={s.iconActions}>
				{selected && (
					<Fragment>
						<IconBtn
							title="Show matching DOM element"
							onClick={inspectHostNode}
						>
							<InspectNativeIcon />
						</IconBtn>
						<IconBtn title="Log internal vnode" onClick={log}>
							<BugIcon />
						</IconBtn>
						<IconBtn
							title="View Component Source"
							onClick={viewSource}
							disabled={!canViewSource}
						>
							<CodeIcon />
						</IconBtn>
					</Fragment>
				)}
			</div>
		</Actions>
	);
}
