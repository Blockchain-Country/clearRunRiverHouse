import React from 'react'
import './Button.css'

/**
 * Reusable Button component with multiple variants
 * @param {string} variant - Button style variant: 'primary' (default), 'ghost', or 'outline'
 * @param {string} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {string} href - If provided, renders as <a> tag instead of <button>
 * @param {string} target - Target attribute for links
 * @param {string} rel - Rel attribute for links
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (for <button> elements)
 * @param {object} ...props - Other props to pass through
 */
const Button = ({
    variant = 'primary',
    children,
    className = '',
    href,
    target,
    rel,
    onClick,
    type = 'button',
    ...props
}) => {
    // For primary variant, use 'button' class (no suffix)
    // For other variants, use 'button-{variant}' class
    const baseClass = variant === 'primary' ? 'button' : 'button'
    const variantClass = variant === 'primary' ? '' : `button-${variant}`
    const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim()

    // If href is provided, render as anchor tag
    if (href) {
        return (
            <a
                href={href}
                target={target}
                rel={rel}
                className={combinedClassName}
                onClick={onClick}
                {...props}
            >
                {children}
            </a>
        )
    }

    // Otherwise render as button
    return (
        <button
            type={type}
            className={combinedClassName}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button

