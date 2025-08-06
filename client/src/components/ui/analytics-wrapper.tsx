import React from 'react';
import { trackHomepageInteraction } from '../../../lib/analytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
  eventType: string;
  elementName?: string;
  className?: string;
  onClick?: () => void;
}

export const AnalyticsButton: React.FC<AnalyticsWrapperProps> = ({ 
  children, 
  eventType, 
  elementName, 
  className = "",
  onClick 
}) => {
  const handleClick = () => {
    trackHomepageInteraction(eventType, elementName);
    if (onClick) onClick();
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

interface AnalyticsLinkProps {
  children: React.ReactNode;
  href: string;
  eventType: string;
  elementName?: string;
  className?: string;
}

export const AnalyticsLink: React.FC<AnalyticsLinkProps> = ({ 
  children, 
  href, 
  eventType, 
  elementName, 
  className = "" 
}) => {
  const handleClick = () => {
    trackHomepageInteraction(eventType, elementName);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};