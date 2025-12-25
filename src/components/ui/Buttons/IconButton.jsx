import React from 'react'
import './IconButton.css'

const IconButton = ({ icon, onClick, className = '', ariaLabel, ...props }) => {
    const getIconContent = () => {
        switch (icon) {
            case 'prev':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                )
            case 'next':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                )
            case 'close':
                return '✕'
            default:
                return null
        }
    }

    return (
        <button
            type="button"
            className={`icon-button icon-button-${icon} ${className}`}
            onClick={onClick}
            aria-label={ariaLabel || `${icon} button`}
            {...props}
        >
            {getIconContent()}
        </button>
    )
}

export default IconButton

