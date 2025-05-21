// Create a new file: src/types/aframe.d.ts
import "react"; // This line is important to treat this file as a module.

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [key: string]: any };
      "a-entity": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [key: string]: any };
      "a-marker": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [key: string]: any };
      "a-assets": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [key: string]: any };
      "a-asset-item": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [key: string]: any };
      // Add any other A-Frame elements you use here, following the same pattern.
    }
  }
}
