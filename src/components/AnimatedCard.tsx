import { motion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  id: string;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(({ children, id }, ref) => {
  return (
    <motion.div
      ref={ref}
      key={id}
      initial={{
        opacity: 0,
        scaleY: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        scaleY: 1,
        height: 'auto',
      }}
      exit={{
        opacity: 0,
        scaleY: 0,
        height: 0,
      }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        layout: true,
      }}
      style={{
        transformOrigin: 'top',
        overflow: 'hidden',
      }}
      layout
    >
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;