import React, {
  FunctionComponent,
  HTMLAttributes,
  JSXElementConstructor,
} from 'react';

import { cn } from '@/utils/utils';

import s from './Text.module.css';

interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * change the style of the text
   */
  variant?: Variant;
  /**
   * center the text
   */
  center?: boolean;
  /**
   * text to render
   */
  text?: string;
  // overwrite the default component
  component?: string | JSXElementConstructor<never>;
}

type Variant = 'body' | 'link' | 'sub' | 'description' | 'error' | 'input';

/**
 * UI component for rendering text with different, predefined styles
 */
export const Text: FunctionComponent<TextProps> = ({
  variant = 'body',
  center = false,
  className = '',
  children,
  text,
  component,
  ...rest
}) => {
  const componentsMap: {
    [P in Variant]: React.ComponentType<any> | string;
  } = {
    body: 'p',
    link: 'span',
    description: 'p',
    input: 'p',
    error: 'p',
    sub: 'p',
  };

  // @ts-expect-error variant is always defined
  const Component:
    | JSXElementConstructor<any>
    | React.ReactElement<any>
    | React.ComponentType<any>
    | string = component || componentsMap![variant!];

  return (
    // @ts-expect-error Component is always defined
    <Component
      className={cn(
        s.root,
        { 'text-center': center },
        {
          [s.body]: variant === 'body',
          [s.link]: variant === 'link',
          [s.sub]: variant === 'sub',
          [s.description]: variant === 'description',
          [s.error]: variant === 'error',
          [s.input]: variant === 'input',
        },
        className,
      )}
      {...rest}
    >
      {text}
      {children}
    </Component>
  );
};

export default Text;
