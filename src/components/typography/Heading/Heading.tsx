import React, {
  FunctionComponent,
  HTMLAttributes,
  JSXElementConstructor,
} from 'react';

import { cn } from '@/utils/utils.ts';

import s from './Heading.module.css';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Change the style of the h1
   * - h1: h1 for page title like on auth pages
   * - menuHeading: h3 for labels in side menu
   * - title: h4 - link text in nav item in side menu
   */
  variant?: Variant;
  /**
   * center the text
   */
  center?: boolean;
}

type Variant =
  | 'gradiant'
  | 'pageHeading'
  | 'sectionHeading'
  | 'cardHeading'
  | 'cardSubHeading'
  | 'menu'
  | 'menuHeading';

/**
 * UI component for rendering headings with different, predefined styles
 */
export const Heading: FunctionComponent<HeadingProps> = ({
  variant = 'pageHeading',
  center = false,
  className = '',
  children,
  ...rest
}) => {
  const componentsMap: {
    [P in Variant]: React.ComponentType<any> | string;
  } = {
    gradiant: 'h1',
    pageHeading: 'h1',
    menuHeading: 'h2',
    sectionHeading: 'h3',
    cardHeading: 'h4',
    menu: 'h5',
    cardSubHeading: 'h6',
  };

  const Component:
    | JSXElementConstructor<any>
    | React.ReactElement<any>
    | React.ComponentType<any>
    | string = componentsMap![variant!];

  return (
    <Component
      className={cn(
        s.root,
        { 'text-center': center },
        {
          [s.gradiant]: variant === 'gradiant',
          [s.pageHeading]: variant === 'pageHeading',
          [s.sectionHeading]: variant === 'sectionHeading',
          [s.cardHeading]: variant === 'cardHeading',
          [s.menu]: variant === 'menu',
          [s.menuHeading]: variant === 'menuHeading',
          [s.cardSubHeading]: variant === 'cardSubHeading',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Heading;
