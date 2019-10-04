import React, { Component } from 'react';

import UserClassView from '../UserClassView';
import UserActionView from '../UserActionView';
import UserSourceView from '../UserSourceView';

export enum View {
  USER_CLASS_VIEW = 'USER_CLASS_VIEW',
  USER_ACTION_VIEW = 'USER_ACTION_VIEW',
  USER_SOURCE_VIEW = 'USER_SOURCE_VIEW',
}

export interface ViewSwitcherProps {
  platformData: object;
}

export interface HistoryEntry {
  currentView: View;
  currentProps: object;
}

export interface ViewSwitcherState {
  currentView: View;
  currentProps: object;
  history: HistoryEntry[];
}

class ViewSwitcher extends Component<ViewSwitcherProps, ViewSwitcherState> {
  private ViewSelector = {
    [View.USER_CLASS_VIEW]: UserClassView,
    [View.USER_ACTION_VIEW]: UserActionView,
    [View.USER_SOURCE_VIEW]: UserSourceView,
  };

  private indexView = View.USER_CLASS_VIEW;

  private indexProps = this.props;

  public readonly state = {
    currentView: View.USER_CLASS_VIEW,
    currentProps: this.props,
    history: [],
  };

  public changeView = (view: View, props: object): void => {
    const { currentView, currentProps, history } = this.state;

    this.setState({
      currentView: view,
      currentProps: props,
      history: [...history, { currentView, currentProps }],
    });
  };

  public goBack = (): void => {
    const { history } = this.state;

    if (history.length < 1) {
      return;
    }

    const rawHistory = [...history];

    const currentHistoryEntry = (rawHistory as HistoryEntry[]).pop();

    if (
      !currentHistoryEntry ||
      !currentHistoryEntry.currentView ||
      !currentHistoryEntry.currentProps
    ) {
      return;
    }

    this.setState({
      currentView: currentHistoryEntry.currentView,
      currentProps: currentHistoryEntry.currentProps,
      history: rawHistory,
    });
  };

  public returnToIndex = (): void => {
    this.setState({
      currentView: this.indexView,
      currentProps: this.props,
      history: [],
    });
  };

  public render(): JSX.Element {
    const { currentView, currentProps } = this.state;

    const ViewComponent = this.ViewSelector[currentView];

    return (
      <ViewComponent
        {...currentProps}
        changeView={this.changeView}
        goBack={this.goBack}
        returnToIndex={this.returnToIndex}
        views={View}
      />
    );
  }
}

export default ViewSwitcher;
