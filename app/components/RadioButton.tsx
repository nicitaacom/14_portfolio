import { ChangeEvent } from "react"

interface RadioButton extends React.HTMLAttributes<HTMLInputElement> {
  label: string
  hint: string
  inputName: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  isChecked?: boolean | null
}

export function RadioButton({ label, hint, inputName, onChange, isChecked, ...props }: RadioButton) {
  return (
    <label htmlFor={label} className={`switch-tab ${isChecked ? "switch-tab-active" : ""}`}>
      <input
        type="radio"
        name={inputName}
        value={label}
        id={label}
        className="switch-tab-input"
        onChange={onChange}
        checked={isChecked ?? false}
        {...props}
      />
      <span aria-hidden="true" className="switch-tab-marker" />
      <span className="switch-tab-text">
        <span className="switch-tab-label">{label}</span>
        <span className="switch-tab-hint">{hint}</span>
      </span>
    </label>
  )
}
