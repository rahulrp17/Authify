import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Marquee = ({
  items,
  className,
  reverse = false,
  separator = '/',
  duration = 24,
}) => {
  const content = (
    <div className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="flex items-center gap-4 whitespace-nowrap px-4 font-display font-bold uppercase tracking-[0.22em]"
        >
          {item}
          <span className="text-hot-pink" aria-hidden="true">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn('flex overflow-hidden', className)} aria-hidden="true">
      <motion.div
        className="flex w-max will-change-transform"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {content}
        {content}
      </motion.div>
    </div>
  );
};
