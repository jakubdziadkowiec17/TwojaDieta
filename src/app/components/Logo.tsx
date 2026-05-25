import React from 'react';
import logo from '../../assets/logo.svg';

export function Logo({ className = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { className?: string }) {
  return <img src={logo} className={className} alt="Logo" {...props} />;
}

export default Logo;
