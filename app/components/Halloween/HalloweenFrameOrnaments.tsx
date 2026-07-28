interface HalloweenFrameOrnamentsProps {
  variant: "modal" | "project" | "navbar"
}

export function HalloweenFrameOrnaments({ variant }: HalloweenFrameOrnamentsProps) {
  const skullTransform =
    variant === "modal"
      ? "translate(470 -34) scale(.65)"
      : variant === "project"
        ? "translate(477 14) scale(.5)"
        : "translate(484 4) scale(.32)"
  const leftPumpkinTransform = variant === "modal" ? "translate(73 526) scale(.55)" : "translate(78 532) scale(.48)"
  const rightPumpkinTransform = variant === "modal" ? "translate(868 526) scale(.55)" : "translate(874 532) scale(.48)"

  return (
    <svg
      aria-hidden="true"
      className={`halloween-only halloween-frame-ornaments halloween-frame-ornaments-${variant}`}
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      fill="none">
      <path
        className="halloween-frame-vine halloween-frame-crown-vine"
        d="M20 94C34 74 28 46 57 31C50 55 67 69 89 52C79 77 98 90 125 76M29 72 8 52M53 45 43 19M87 57l16-23M980 94C966 74 972 46 943 31C950 55 933 69 911 52C921 77 902 90 875 76M971 72l21-20M947 45l10-26M913 57l-16-23"
      />
      <path
        className="halloween-frame-vine"
        d="M23 108C50 202 47 306 25 398C17 432 25 481 67 490C40 523 61 572 107 554M977 108C950 202 953 306 975 398C983 432 975 481 933 490C960 523 939 572 893 554"
      />
      <path
        className="halloween-frame-web"
        d="M22 105L146 22M22 105L212 112M22 105L106 211M56 82C89 91 115 105 137 129M86 61C124 70 157 89 183 115M944 82C911 91 885 105 863 129M914 61C876 70 843 89 817 115"
      />
      {/* Stencil skull: wide cranium pinching at the temples, flared cheekbones and a broad grin.
          The first path is the bone silhouette, every path after it is a dark cut-out. */}
      <g className="halloween-frame-skull" transform={skullTransform}>
        <path d="M50 1C72 1 89 15 92 35C94 45 92 52 89 57C93 61 94 67 91 72C88 78 82 81 76 83C74 92 70 100 63 106C59 109 54 110 50 110C46 110 41 109 37 106C30 100 26 92 24 83C18 81 12 78 9 72C6 67 7 61 11 57C8 52 6 45 8 35C11 15 28 1 50 1Z" />
        <path d="M13 42C21 34 38 34 44 43L47 56C45 62 34 65 25 62C16 59 10 50 13 42Z" />
        <path d="M87 42C79 34 62 34 56 43L53 56C55 62 66 65 75 62C84 59 90 50 87 42Z" />
        <path d="M50 62C47 68 42 73 41 79C40 84 44 87 48 85C49 84 50 83 50 82C50 83 51 84 52 85C56 87 60 84 59 79C58 73 53 68 50 62Z" />
        <path d="M27 86H73V89H27ZM27 96H73V99H27ZM33 89H35V96H33ZM39 89H41V96H39ZM45 89H47V96H45ZM51 89H53V96H51ZM57 89H59V96H57ZM63 89H65V96H63ZM36 99H38V106H36ZM42 99H44V106H42ZM48 99H50V106H48ZM54 99H56V106H54ZM60 99H62V106H60Z" />
      </g>
      <g className="halloween-frame-pumpkin halloween-frame-pumpkin-left" transform={leftPumpkinTransform}>
        <ellipse cx="55" cy="48" rx="52" ry="43" />
        <path d="M55 7C48-4 55-14 68-19" />
        <path d="M23 42L39 29L45 48M87 42L71 29L65 48M35 65C49 77 65 77 79 64" />
      </g>
      <g className="halloween-frame-pumpkin halloween-frame-pumpkin-right" transform={rightPumpkinTransform}>
        <ellipse cx="55" cy="48" rx="52" ry="43" />
        <path d="M55 7C48-4 55-14 68-19" />
        <path d="M23 42L39 29L45 48M87 42L71 29L65 48M35 65C49 77 65 77 79 64" />
      </g>
    </svg>
  )
}
