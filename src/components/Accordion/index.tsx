import { useState } from 'react';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface AccordionProps {
    name: string;
    children?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = (props) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className='my-0.5 rounded-md'>
            <span
                className='flex items-center py-1 px-1'
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <ChevronDownIcon className='size-4 flex-shrink-0' />
                ) : (
                    <ChevronRightIcon className='size-4 flex-shrink-0' />
                )}
                <label className='text-white ml-4 text-md'>{props.name}</label>
            </span>
            {isOpen && props.children ? <div className=' mx-2 py-1 '> {props.children} </div> : null}
        </div>
    );
};
