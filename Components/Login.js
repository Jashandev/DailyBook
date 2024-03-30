import { View , Text , Image , TextInput , TouchableOpacity } from 'react-native'
import React , { useContext } from 'react'
import AuthContext from '../Service/Context/AuthContext'
import UserContext from '../Service/Context/UserContext'

const Login = () => {

    const AuthContextdata = useContext(AuthContext);
    const UserContextdata = useContext(UserContext);
    // console.warn(AuthContextdata , UserContextdata);

    const [number, onChangeNumber] = React.useState('');
    const hundlesubmit = () => {
        console.warn(number);
    };

  return (
    <View className="h-screen w-screen flex items-center">
        <Text className="text-slate-900 mt-8 text-xl font-bold">LOGIN</Text>
         <Image className="h-96 w-96 mt-8 bg-contain" source={require('../Assets/Login.png')} />
         <TextInput placeholder='Phone' onChangeText={onChangeNumber} value={number} inputMode='numeric' className="h-12 w-10/12 border-b-2 border-indigo-600 text-lg font-bold"></TextInput>
         <TouchableOpacity onPress={hundlesubmit} className="h-12 w-10/12 mt-8 bg-blue-700 flex items-center justify-center rounded-md ">
                <Text className="text-yellow-50 text-xl font-bold">Submit</Text>
         </TouchableOpacity>
    </View>
  )
}

export default Login;