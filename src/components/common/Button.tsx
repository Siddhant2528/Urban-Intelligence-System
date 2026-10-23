import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border border-brand bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  ghost: 'border border-transparent bg-transparent text-brand hover:bg-brand-soft',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
}

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string,
) {
  return `inline-flex items-center justify-center gap-2 rounded-control font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`
}

export function Button({
  children,
  className = '',
  leadingIcon,
  size = 'md',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, size, className)}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  )
}

interface ButtonLinkProps {
  to: LinkProps['to']
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  className?: string
}

export function ButtonLink({
  children,
  className = '',
  leadingIcon,
  size = 'md',
  to,
  variant = 'primary',
}: ButtonLinkProps) {
  return (
    <Link className={getButtonClassName(variant, size, className)} to={to}>
      {leadingIcon}
      {children}
    </Link>
  )
}