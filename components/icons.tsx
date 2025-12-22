// Modern Vectorized Icons for WordReveal
// Using react-icons for consistent, scalable iconography

import React from 'react';
import {
  // Navigation & Actions
  FiChevronLeft,
  FiChevronRight,
  FiX,

  // Content & Editing
  FiEdit3,
  FiSettings,

  // File Operations
  FiDownload,
  FiUpload,
  FiSave,

  // UI States
  FiFileText,
  FiStar,
} from 'react-icons/fi';

// Import IconType from react-icons
import { IconType } from 'react-icons';

// Create a proper React component type that accepts className
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;

// Icon mapping for easy maintenance and consistency
export const Icons = {
  // Navigation
  Back: FiChevronLeft as IconComponent,
  Next: FiChevronRight as IconComponent,
  Close: FiX as IconComponent,

  // Content Actions
  Edit: FiEdit3 as IconComponent,
  Settings: FiSettings as IconComponent,

  // File Operations
  Import: FiUpload as IconComponent,
  Export: FiDownload as IconComponent,
  Save: FiSave as IconComponent,

  // States
  Document: FiFileText as IconComponent,
  Star: FiStar as IconComponent,
} as const;

// Type for icon names
export type IconName = keyof typeof Icons;

// Helper function to get icon component
export const getIcon = (name: IconName): IconComponent => {
  return Icons[name];
};

// Default props for consistent icon styling
export const defaultIconProps = {
  size: 24,
  strokeWidth: 2,
} as const;