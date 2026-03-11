declare module "react-syntax-highlighter" {
  import * as React from "react";

  export type SyntaxHighlighterProps = {
    language?: string;
    style?: Record<string, React.CSSProperties>;
    PreTag?:
      | keyof React.JSX.IntrinsicElements
      | React.ComponentType<React.HTMLAttributes<HTMLElement>>;
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLAttributes<HTMLElement>;
    children?: React.ReactNode;
    [key: string]: unknown;
  };

  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
}
