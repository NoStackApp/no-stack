import React, { Component } from 'react';

import UserClassView from '../UserClassView';
import UserActionView from '../UserActionView';
import UserSourceView from '../UserSourceView';

class ViewSwitcher extends Component {
  views = {
    USER_CLASS_VIEW: 'USER_CLASS_VIEW',
    USER_ACTION_VIEW: 'USER_ACTION_VIEW',
    USER_SOURCE_VIEW: 'USER_SOURCE_VIEW',
  };

  ViewSelector = {
    [this.views.USER_CLASS_VIEW]: UserClassView,
    [this.views.USER_ACTION_VIEW]: UserActionView,
    [this.views.USER_SOURCE_VIEW]: UserSourceView,
  };

  indexView = this.views.USER_CLASS_VIEW;

  indexProps = this.props;

  state = {
    currentView: this.views.USER_CLASS_VIEW,
    currentProps: this.props,
    history: [],
  };

  changeView = (view, props) => {
    const { currentView, currentProps, history } = this.state;

    this.setState({
      currentView: view,
      currentProps: props,
      history: [...history, { currentView, currentProps }],
    });
  };

  goBack = () => {
    const { history } = this.state;

    if (history.length < 1) {
      return;
    }

    const rawHistory = [...history];

    const { currentView, currentProps } = rawHistory.pop();

    this.setState({
      currentView,
      currentProps,
      history: rawHistory,
    });
  };

  returnToIndex = () => {
    this.setState({
      currentView: this.indexView,
      currentProps: this.props,
      history: [],
    });
  };

  render() {
    const { currentView, currentProps } = this.state;

    const View = this.ViewSelector[currentView];

    return (
      <View
        {...currentProps}
        changeView={this.changeView}
        goBack={this.goBack}
        returnToIndex={this.returnToIndex}
        views={this.views}
      />
    );
  }
}

export default ViewSwitcher;
