import React from 'react';
import Link from 'next/link';

export default function NavLinks() {
    const links = [
        { href: '/', label: 'Home' },
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/staking', label: 'Staking' },
        { href: '/model-management', label: 'My Models' },
    ];

    return (
        <div className="flex items-center space-x-6">
            {links.map(link => (
                <Link 
                    key={link.href} 
                    href={link.href}
                    className="nav-link text-gray-600 hover:text-gray-900"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}