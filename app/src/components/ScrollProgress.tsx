import { motion, useScroll, useSpring } from 'motion/react';

/** Top progress bar driven by Motion's scroll tracker. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return <motion.div className="progress" style={{ width: '100%', scaleX }} />;
}
