interface BooleanWidgetProps {
    value: boolean;
    readOnly: boolean;
    disabled: boolean;
    onNewValue: (value: boolean) => void;
}

const BooleanToggleWidget: React.FC<BooleanWidgetProps> = (props) => {
    return (
        <div className='nodrag nopan flex justify-center items-center'>
            <label
                className='inline-flex items-center cursor-pointer'
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
                    className='sr-only peer'
                />
                <div
                    className={`relative w-14 h-7 peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 ${props.readOnly ? 'peer-checked:bg-green-900 after:bg-neutral-400' : 'peer-checked:bg-green-500 after:bg-white'}`}
                ></div>
            </label>
        </div>
    );
};

export default BooleanToggleWidget;
