/** حركات موحّدة لـ myui */
export const myuiEase = [0.22, 1, 0.36, 1] as const

export const myuiMotion = {
  panel: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, ease: myuiEase },
  },
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.28, ease: myuiEase },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: myuiEase },
  },
  listItem: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.25, ease: myuiEase },
  },
  spring: {
    type: "spring" as const,
    stiffness: 420,
    damping: 34,
  },
}
