import { Variants, Transition } from "framer-motion"

// Spring Physics Defaults
export const springPhysics = {
  type: "spring",
  stiffness: 260,
  damping: 20,
  mass: 1,
} as Transition

export const gentleSpring = {
  type: "spring",
  stiffness: 200,
  damping: 25,
} as Transition

export const softSpring = {
  type: "spring",
  stiffness: 150,
  damping: 30,
} as Transition

// Card Variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...softSpring,
      delay: 0.1,
    },
  },
  hover: {
    y: -12,
    scale: 1.02,
    transition: gentleSpring,
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
}

// Icon Variants
export const iconVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.2,
    rotate: 15,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
}

// Image Variants (Ken Burns Effect)
export const imageVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 25,
      duration: 3,
    },
  },
}

// Text Variants (Word-by-word reveal)
export const textVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...softSpring,
      delay: custom * 0.1,
    },
  }),
}

// Floating Animation Variants
export const floatingVariants: Variants = {
  initial: {
    y: 100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      ...springPhysics,
      delay: 0.5,
    },
  },
}

// Stagger Container Variants
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Page Transition Variants
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: softSpring,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      ...softSpring,
      duration: 0.2,
    },
  },
}

// Bottom Sheet Variants
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springPhysics,
  },
  drag: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    },
  },
}

// Map Pin Animation Variants
export const mapPinVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  hover: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1],
    transition: {
      scale: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
      opacity: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}