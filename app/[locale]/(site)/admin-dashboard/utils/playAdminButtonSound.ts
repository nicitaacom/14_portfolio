export function playAdminButtonSound(button: number, volume = 0.32) {
  const audio = new Audio(`/UI/admin-dashboard/button${button}.wav`)
  audio.volume = volume
  audio.play().catch(error => console.error("Failed to play admin button sound", error))
}
