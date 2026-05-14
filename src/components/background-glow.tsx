'use client';

import { useActiveTab } from '@/components/tab-bar';
import { motion } from 'framer-motion';

export function BackgroundGlow() {
  const { theme, id } = useActiveTab();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        key={`${id}-a`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 0.8 }}
        className={`absolute rounded-full ${theme.glow} animate-drift-1 h-[300px] w-[300px] blur-[80px] md:h-[600px] md:w-[600px] md:blur-[180px]`}
        style={{ top: '-15%', left: '20%', willChange: 'transform' }}
      />
      <motion.div
        key={`${id}-b`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`absolute rounded-full ${theme.glow} animate-drift-2 h-[250px] w-[250px] blur-[70px] md:h-[500px] md:w-[500px] md:blur-[160px]`}
        style={{ bottom: '-10%', right: '10%', willChange: 'transform' }}
      />
      <motion.div
        key={`${id}-c`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className={`absolute rounded-full ${theme.glow} animate-drift-3 h-[200px] w-[200px] blur-[60px] md:h-[400px] md:w-[400px] md:blur-[140px]`}
        style={{ top: '40%', left: '60%', willChange: 'transform' }}
      />
    </div>
  );
}
