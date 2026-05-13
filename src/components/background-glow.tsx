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
        className={`absolute h-[600px] w-[600px] rounded-full ${theme.glow} animate-drift-1 blur-[180px]`}
        style={{ top: '-15%', left: '20%' }}
      />
      <motion.div
        key={`${id}-b`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`absolute h-[500px] w-[500px] rounded-full ${theme.glow} animate-drift-2 blur-[160px]`}
        style={{ bottom: '-10%', right: '10%' }}
      />
      <motion.div
        key={`${id}-c`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className={`absolute h-[400px] w-[400px] rounded-full ${theme.glow} animate-drift-3 blur-[140px]`}
        style={{ top: '40%', left: '60%' }}
      />
    </div>
  );
}
