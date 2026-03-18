import { useId } from "react"
import { twMerge } from "tailwind-merge"
import { BsCheckLg } from "react-icons/bs"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isChecked: boolean
  onChange: () => void
  label: React.ReactNode
  labelClassName?: string
  className?: string
  disabled?: boolean
}

export function Checkbox({
  isChecked,
  onChange,
  label,
  labelClassName = "",
  className = "",
  disabled,
  ...props
}: CheckboxProps) {
  const checkboxId = useId()

  return (
    <label
      htmlFor={checkboxId}
      className={twMerge(
        "group relative flex cursor-pointer items-start gap-xs rounded-[12px] border border-[#777777] px-sm py-xs",
        "transition-colors duration-50 hover:bg-white/20",
        isChecked && "border-cta/60",
        disabled && "opacity-50 cursor-default pointer-events-none",
        className,
      )}
    >
      <div className="relative mt-[2px] inline-flex h-[22px] w-[22px] items-center justify-center">
        <input
          className="peer sr-only"
          type="checkbox"
          id={checkboxId}
          checked={isChecked}
          onChange={onChange}
          {...props}
        />
        <span
          className={twMerge(
            "flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border border-[#777777] bg-primary",
            "transition-colors duration-50",
            isChecked && "border-cta bg-cta",
          )}
        >
          <BsCheckLg
            className={twMerge(
              "text-primary transition-opacity duration-50",
              isChecked ? "opacity-100" : "opacity-0",
            )}
            size={14}
          />
        </span>
      </div>

      <span className={twMerge("flex-1 text-sm leading-relaxed text-secondary-foreground", labelClassName)}>
        {label}
      </span>
    </label>
  )
}
