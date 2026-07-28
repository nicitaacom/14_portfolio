"use client"
import type { ChangeEvent } from "react"

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  type?: string
  value: string | number | undefined
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function Input({ type, value, onChange, className, placeholder, ...props }: InputProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const inputValue = e.target.value
      const firstChar = inputValue.charAt(0)
      if (firstChar === "0" && inputValue.length > 1 && !inputValue.includes(".")) {
        return
      }
    }

    onChange(e)
  }

  return (
    <input
      className={`site-input workshop-input px-sm py-xs text-secondary outline-none ${className}`}
      type={type}
      inputMode={type === "number" ? "numeric" : undefined}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      {...props}
    />
  )
}
