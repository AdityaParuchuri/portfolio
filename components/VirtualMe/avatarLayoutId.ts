// Shared between AvatarTrigger (Hero, closed state) and ChatAvatar (modal,
// open state) so framer-motion treats them as the same element and animates
// a flight path between their positions/sizes instead of two independent
// avatars ever being visible at once.
export const AVATAR_LAYOUT_ID = "virtual-me-avatar";
