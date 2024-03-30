import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthState from './Service/Context/AuthState';
import UserState from './Service/Context/UserState';
import Login from './Components/Login'
import Dashboard from './Components/Dashboard'
import Register from './Components/Register'

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <AuthState>
        <UserState>
            <NavigationContainer>
                <MyStack/>
            </NavigationContainer>
        </UserState>
    </AuthState>
  );
}

export default App;