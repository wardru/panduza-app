interface BooleanWidgetProps {
    value: boolean;
    readOnly: boolean;
    disabled?: boolean;
    onNewValue: (value: boolean) => void;
}

const BooleanToggle: React.FC<BooleanWidgetProps> = (props) => {
    return (
        <div className='nodrag nopan flex items-center justify-center'>
            <label
                className='inline-flex cursor-pointer items-center'
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    type='checkbox'
                    checked={props.value}
                    disabled={props.disabled}
                    onChange={(e) => {
                        props.onNewValue(e.currentTarget.checked);
                    }}
                    readOnly={props.readOnly}
                    className='peer sr-only'
                />
                <div
                    className={`peer relative h-7 w-14 rounded-full peer-focus:ring-blue-300 peer-focus:outline-hidden after:absolute after:start-[4px] after:top-0.5 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-neutral-400 dark:bg-neutral-600 dark:peer-focus:ring-blue-800 ${props.readOnly ? 'peer-checked:bg-[#7AB872] after:bg-[#D7D7D7]' : 'peer-checked:bg-[#26c211] after:bg-[#D7D7D7]'}`}
                ></div>
            </label>
        </div>
    );
};

export default BooleanToggle;
