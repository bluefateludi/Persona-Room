import { Component, type ReactNode } from "react";
/** Keep the reading and layout controls available when a GPU context fails. */
export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="webgl-fallback" role="status">
        <p>三维展厅暂时无法显示，仍可使用展品目录阅读、试听和收藏。</p>
        <button onClick={() => this.setState({ failed: false })}>
          重新打开三维展厅
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
