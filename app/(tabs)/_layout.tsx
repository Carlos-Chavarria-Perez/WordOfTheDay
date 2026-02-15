import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";


export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="home" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="word"
        options={{
          title: "Word of Day",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="file-word-o" size={focused ? 28 : 24} color={color} />
          ),
        }}
      /> */}

      {/* <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="trophy" size={focused ? 28 : 24} color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="gear" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
