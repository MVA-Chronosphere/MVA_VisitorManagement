import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import AddVisitorScreen from "./screens/AddVisitorScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddVisitor" component={AddVisitorScreen} options={{ title: "Add Visitor" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
