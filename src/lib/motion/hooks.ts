import { useState, useEffect } from "react"

export const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!imageUrls.length) {
      setIsLoading(false)
      return
    }

    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url))
          resolve()
        }
        img.onerror = reject
      })
    }

    Promise.all(imageUrls.map(loadImage))
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [imageUrls])

  return { loadedImages, isLoading }
}

export const useMotionControls = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [isTapped, setIsTapped] = useState(false)

  const handleTapStart = () => setIsTapped(true)
  const handleTapEnd = () => setIsTapped(false)
  const handleHoverStart = () => setIsHovered(true)
  const handleHoverEnd = () => setIsHovered(false)

  return {
    isHovered,
    isTapped,
    handleTapStart,
    handleTapEnd,
    handleHoverStart,
    handleHoverEnd,
  }
}