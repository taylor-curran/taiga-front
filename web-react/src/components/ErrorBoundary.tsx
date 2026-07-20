import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[admin-react]', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="port-pending" data-testid="error-boundary">
          <h2 className="port-pending__title">Something went wrong</h2>
          <p className="port-pending__path">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
