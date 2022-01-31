import React from 'react';
import {
  Container,
  Form,
  Input,
  Label,
  Item,
  Button,
  Text,
  Content
} from 'native-base';
import App from '../App';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import Header from '../components/Header';

interface IProps {
    app: App
}

interface IState {
    connecting: boolean;
    url: string;
}

export default class ConnectionPage extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            connecting: false,
            url: ""
        };
    }

    async componentDidMount() {
        AsyncStorage.getItem("url", (err, result) => {
            if (err || result === null) {
                return;
            }
            this.setState({
                connecting: false,
                url: result
            });
        });
    }

    connect() {
        this.setState({
            ...this.state,
            connecting: true
        });
        this.props.app.offlineModel.connect(this.state.url).then(() => {
            this.setState({
                connecting: false,
                url: this.state.url
            });
            Actions.push("map", {
                app: this.props.app
            });
            AsyncStorage.setItem("url", this.state.url);
        }).catch(ex => {
            this.setState({
                connecting: false,
                url: this.state.url
            });
        });
    }

    render() {
        return (
            <Container>
                <Header title={"Connect"}/>
                <Content 
                    contentContainerStyle={{
                        paddingTop: 40, 
                        paddingHorizontal: 10}
                }>
                    <Form>
                        <Item floatingLabel>
                            <Label>URL</Label>
                            <Input
                                onChangeText={(e) => {
                                    this.setState({
                                        ...this.state,
                                        url: e
                                    });
                                }}
                                value={this.state.url}
                            />
                        </Item>
                        <Button
                            onPress={() => this.connect()}
                            disabled={this.state.connecting}
                        >
                            <Text>{this.state.connecting ? "Connecting ..." : "Connect"}</Text>
                        </Button>
                    </Form>
                </Content>
            </Container>
        );
    }
}
