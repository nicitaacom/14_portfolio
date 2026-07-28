import { ChangeEvent } from "react"

interface RadioButton extends React.HTMLAttributes<HTMLInputElement> {
  label: string
  inputName: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  isChecked?: boolean | null
}

export function RadioButton({ label, inputName, onChange, isChecked, ...props }: RadioButton) {
  return (
    <label
      htmlFor={label}
      className={`machine-panel plaque relative flex cursor-pointer items-center justify-center px-4 py-2 text-secondary ${
        isChecked ? "border-cta shadow-[0_0_0_1px_hsl(var(--cta)/0.55),0_4px_0_hsl(var(--steel-deep)),0_8px_10px_rgb(0_0_0/0.5)]" : "border-brass/50"
      }`}>
      <input
        type="radio"
        name={inputName}
        value={label}
        id={label}
        className="hidden peer"
        onChange={onChange}
        checked={isChecked ?? false}
        {...props}
      />
      {label}
    </label>
  )
}
