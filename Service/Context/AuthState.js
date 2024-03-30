import React from 'react';
import AuthContext from './AuthContext';
import { View, Text } from 'react-native'

const AuthState = (props) => {
  return (
    <AuthContext.Provider value={"jashan"}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthState;