// Allow Angular-style custom tag names (`tg-*`) in JSX so the React port can
// emit DOM elements that match what the AngularJS reference renders.
import type * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tg-working-on': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-issues-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-project-navigation': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-backlog-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-backlog-graph': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-kanban-board': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-kanban-column': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'tg-svg': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'svg-icon'?: string };
    }
  }
}
