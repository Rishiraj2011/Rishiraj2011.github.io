export interface FramePlacement {
  covered?: boolean
  hidden?: boolean
}

export const REVEAL_POLL_MS = 100

// A first sight this long after load is not a number worth acting on, and an inline frame the buyer
// never reveals would otherwise poll for the life of the seller's page.
export const REVEAL_TIMEOUT_MS = 60_000

// Sends the spec names and the original Chrome aliases, so a browser that honours either answers.
const isVisible = (element: Element): boolean | undefined =>
  element.checkVisibility?.({
    opacityProperty: true,
    visibilityProperty: true,
    checkOpacity: true,
    checkVisibilityCSS: true,
  })

export const measureFramePlacement = (container: Element | undefined): FramePlacement => {
  if (!container) {
    return {}
  }

  try {
    const placement: FramePlacement = {}

    const visible = isVisible(container)

    // A hidden container is not hit-testable, so without checkVisibility the cover check reads
    // whatever sits behind it.
    if (visible === undefined) {
      return placement
    }

    placement.hidden = !visible

    const rect = container.getBoundingClientRect()

    if (placement.hidden || rect.width === 0 || rect.height === 0) {
      return placement
    }

    // elementFromPoint skips pointer-events:none elements, so the container would always read as covered.
    if (window.getComputedStyle(container).pointerEvents === 'none') {
      return placement
    }

    // Centre only: an edge point reads covered for any page furniture that merely overlaps the border.
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    if (x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight) {
      const element = document.elementFromPoint(x, y)
      placement.covered = element !== null && !container.contains(element)
    }

    return placement
  } catch (e) {
    return {}
  }
}

// Polls because the mutation that reveals the frame fires before the frame is visible.
export const watchForFrameReveal = (container: Element, onReveal: () => void): (() => void) => {
  const deadline = Date.now() + REVEAL_TIMEOUT_MS

  const interval = setInterval(() => {
    try {
      if (!document.body.contains(container) || Date.now() > deadline) {
        clearInterval(interval)
        return
      }

      if (isVisible(container)) {
        clearInterval(interval)
        onReveal()
      }
    } catch (e) {
      clearInterval(interval)
    }
  }, REVEAL_POLL_MS)

  return () => clearInterval(interval)
}
