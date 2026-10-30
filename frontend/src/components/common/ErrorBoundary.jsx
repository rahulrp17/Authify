import { Component } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('AUTHIFY UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-void px-6">
          <div className="w-full max-w-lg border-2 border-error bg-surface p-8 shadow-brutal-orange">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-error text-error">
              <AlertOctagon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold uppercase leading-none tracking-[-0.06em] text-white">
              Interface fault
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              Something broke while rendering this view. Your session has not
              been changed. Reload the console to continue.
            </p>
            <Button className="mt-6" variant="danger" onClick={this.handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reload console
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
