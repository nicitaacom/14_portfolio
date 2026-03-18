import { FieldErrors, RegisterOptions, UseFormRegister } from "react-hook-form"
import { twMerge } from "tailwind-merge"

interface FormData {
  inputNotificationTo: string
  contact: string
}

interface FormInputProps {
  id: keyof FormData
  type?: string
  className?: string
  placeholder?: string
  register: UseFormRegister<FormData>
  validationRule?: RegisterOptions<FormData, keyof FormData>
  errors: FieldErrors
  disabled?: boolean
}

type ValidationRules = {
  [key in keyof FormData]: {
    required: string
    pattern: {
      value: RegExp
      message: string
    }
  }
}

const validationRules: ValidationRules = {
  inputNotificationTo: {
    required: "This field is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Enter valid email address",
    },
  },
  contact: {
    required: "This field is required",
    pattern: {
      value: /.+/,
      message: "This field is required",
    },
  },
}

export function FormInput({
  className = "",
  id,
  type = "text",
  placeholder = "",
  register,
  validationRule,
  errors,
  disabled = false,
}: FormInputProps) {
  // const validationRule = validationRules[id as keyof typeof validationRules]

  return (
    <div>
      <div className="flex flex-col">
        <input
          className={twMerge(
            "w-full rounded-[16px] border border-[#909090] bg-primary/70 px-sm py-sm text-secondary outline-none transition-colors duration-300 placeholder:text-secondary-foreground/55 focus:border-cta",
            errors[id] && "border-danger text-danger",
            disabled && "opacity-50 cursor-default pointer-events-none",
            className,
          )}
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={id}
          disabled={disabled}
          {...register(id, validationRule)}
        />
      </div>
    </div>
  )
}
