/// <reference types="vite/client" />

// Fix for JSX attributes with double braces
declare namespace JSX {
  interface IntrinsicAttributes {
    [key: string]: any;
  }
}