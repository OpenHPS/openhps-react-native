import React from 'react';
import { Header as NativeHeader, Left, Body, Button, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

interface IProps {
  title: string;
  hasTabs?: boolean;
}

export default class Header extends React.Component<IProps> {

  constructor(props: any) {
    super(props);
  }

  left() {
    const prevState = Actions.prevState as any;
    const stack = prevState ? prevState.routes : [];
    if (stack.length > 0) {
      return (
        <Left>
          <Button transparent>
            <Icon 
              name='arrow-back'
              onPress={() => Actions.pop()}
            />
          </Button>
        </Left>
      );
    }
  }

  render() {
    return (
      <NativeHeader hasTabs={this.props.hasTabs}>
        {this.left()}
        <Body>
          <Title>{this.props.title}</Title>
        </Body>
      </NativeHeader>
    );
  }
}
