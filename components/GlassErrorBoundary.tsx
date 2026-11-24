'use client';
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
interface Props { name: string; children: React.ReactNode; }
interface State { failed: boolean; }
export default class GlassErrorBoundary extends React.Component<Props,State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error(`GiNi module error (${this.props.name})`, error, info.componentStack); }
  render() {
    if (this.state.failed) return <section role="alert" className="gini-error-card gini-glass"><AlertTriangle size={30}/><h2>{this.props.name} could not be displayed</h2><p>Your other modules are safe. Try loading this view again.</p><button className="gini-primary-button" onClick={()=>this.setState({failed:false})}><RotateCcw size={16}/> Retry</button></section>;
    return this.props.children;
  }
}
