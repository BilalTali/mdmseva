import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-primary-400 text-secondary-900 focus:border-primary-700'
                    : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 focus:border-secondary-300 focus:text-secondary-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
