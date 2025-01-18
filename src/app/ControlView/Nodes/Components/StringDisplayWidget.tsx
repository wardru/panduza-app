interface StringDisplayWidgetProps {
    value: string;
}

const StringDisplayWidget: React.FC<StringDisplayWidgetProps> = (props) => {
    return (
        <div className='flex items-center justify-center'>
            <label className='text-center text-white font-semibold px-1 py-0.5 text-lg rounded-md bg-gray-700'>
                {props.value}
            </label>
        </div>
    );
};

export default StringDisplayWidget;
