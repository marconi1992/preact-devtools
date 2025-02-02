import { h } from "preact";
import { useState, useCallback } from "preact/hooks";
import { DataInput } from "../../DataInput";
import s from "./NewProp.module.css";
import s2 from "./ElementProps.module.css";

export interface NewPropProps {
	onChange: (value: any, path: string) => void;
}

const initial = undefined;
export function NewProp(props: NewPropProps) {
	const [name, setName] = useState("");
	const [value, setValue] = useState(initial);

	const onChangeName = useCallback((e: Event) => {
		setName((e.target as any).value);
	}, []);

	const onReset = useCallback(() => {
		setValue(initial);
	}, []);

	const onChangeValue = useCallback((v: any) => {
		setValue(v);
	}, []);

	const onCommit = useCallback(
		(value: any) => {
			if (name) {
				props.onChange(value, "." + name);
				setName("");
				setValue(initial);
			}
		},
		[name, props.onChange],
	);

	return (
		<div class={s.root}>
			<div class={`${s2.name} ${s.nameWrapper}`}>
				<input
					name="new-prop-name"
					type="text"
					placeholder="new prop"
					class={`${s2.nameInput} ${s.name}`}
					value={name}
					onInput={onChangeName}
				/>
			</div>
			<DataInput
				class={s.value}
				value={value}
				showReset={initial !== value}
				onChange={onChangeValue}
				onCommit={onCommit}
				onReset={onReset}
				placeholder="new value"
				name="new-prop-value"
			/>
		</div>
	);
}
