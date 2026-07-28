interface HalloweenFrameOrnamentsProps {
  variant: "modal" | "project" | "navbar"
}

export function HalloweenFrameOrnaments({ variant }: HalloweenFrameOrnamentsProps) {
  const skullTransform =
    variant === "modal"
      ? "translate(470 -34) scale(.65)"
      : variant === "project"
        ? "translate(477 -24) scale(.5)"
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
      <g className="halloween-frame-skull" transform={skullTransform}>
        <path d="M45 5C72 5 91 24 91 51C91 70 81 85 66 92V111H26V92C10 84 1 69 1 51C1 24 19 5 45 5Z" />
        <ellipse cx="28" cy="50" rx="12" ry="15" />
        <ellipse cx="63" cy="50" rx="12" ry="15" />
        <path d="M45 62L36 76H54L45 62Z" />
        <path d="M28 92V110M39 91V111M51 91V111M62 92V110" />
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
