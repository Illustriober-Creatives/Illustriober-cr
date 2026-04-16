'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * FormInput Component
 * Theme-aware form input with label and error states
 * Uses CSS variables for perfect theme integration
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const id = props.id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground mb-2 transition-colors"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          id={id}
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-default)',
            color: 'var(--foreground)',
          }}
          className={cn(
            'w-full px-4 py-3',
            'rounded-lg',
            'border',
            'focus:border-accent focus:outline-none',
            'focus:ring-2 focus:ring-accent/20',
            'hover:border-accent/50',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          placeholder={props.placeholder}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400 light:text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-foreground/50 dark:text-zinc-400 light:text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export { FormInput };
