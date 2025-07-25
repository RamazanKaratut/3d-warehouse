// src/app/ClientLayoutWrapper.tsx
'use client';

import { AnimatePresence, motion, Transition } from 'framer-motion'; // Transition'ı da import ettik
import { usePathname } from 'next/navigation';
import React from 'react';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  // 'Transition' tipini doğrudan Framer Motion'dan alıyoruz
  const pageTransition: Transition = {
    type: 'tween', // 'tween' string literal olarak doğru
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}