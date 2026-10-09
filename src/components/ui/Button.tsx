import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type StyleProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  block?: boolean;
};

const cx = ({ variant = 'secondary', size = 'md', icon, block }: StyleProps, className?: string) =>
  [styles.btn, styles[variant], styles[size], icon && styles.icon, block && styles.block, className]
    .filter(Boolean)
    .join(' ');

type Props = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant, size, icon, block, className, ...rest },
  ref,
) {
  return <button ref={ref} className={cx({ variant, size, icon, block }, className)} {...rest} />;
});

export function ButtonLink({ variant, size, icon, block, className, ...rest }: LinkProps & StyleProps) {
  return <Link className={cx({ variant, size, icon, block }, className)} {...rest} />;
}
