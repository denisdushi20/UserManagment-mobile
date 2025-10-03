import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserListScreen from "./screens/UserList";
import UserDetailsScreen from "./screens/UserDetails";
import AddUserScreen from "./screens/AddUser";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Users">
        <Stack.Screen name="Users" component={UserListScreen} />
        <Stack.Screen name="Details" component={UserDetailsScreen} options={{ title: "User Details" }} />
        <Stack.Screen name="AddUser" component={AddUserScreen} options={{ title: "Add User" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
