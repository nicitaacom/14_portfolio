interface AuthHeaderProps {
  errorMessage: string
}

export function AuthHeader({ errorMessage }: AuthHeaderProps) {
  return (
    <div className="flex flex-col gap-xs">
      <h1 className="text-lg text-secondary">Admin auth</h1>
      <p className="text-sm">Enter the password first. GitHub login stays disabled until it matches.</p>
      <p className="text-sm">Password check runs automatically every 5 seconds after typing stops.</p>
      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
    </div>
  )
}
