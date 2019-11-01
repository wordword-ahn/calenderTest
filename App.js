import React, { Component } from 'react';
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import * as Permissions from 'expo-permissions';
import Home from './screens/CalenderHome';
import CreateTask from './screens/CalenderCreateTask';
import TodoStore from './data/CalenderTodoStore';

// https://github.com/skdev24/calender-event-app
// https://www.npmjs.com/package/react-native-calendars
// npm install react-navigation react-native-gesture-handler react-native-reanimated react-native-screens
// npm install moment
// npm install react-native-calendars
// npm install expo-calendar
// npm install expo-localization
// npm install react-native-calendar-strip
// npm install react-native-modal-datetime-picker
// npm install react-navigation-stack

// npm install react-navigation react-native-gesture-handler react-native-reanimated react-native-screens moment react-native-calendars expo-calendar expo-localization react-native-calendar-strip react-native-modal-datetime-picker react-navigation-stack

const AppNavigator = createStackNavigator(
  {
    Home,
    CreateTask,
  },
  {
    headerMode: 'none',
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  async componentWillMount() {
    await this._askForCalendarPermissions();
    await this._askForReminderPermissions();
  }

  _askForCalendarPermissions = async () => {
    await Permissions.askAsync(Permissions.CALENDAR);
  };

  _askForReminderPermissions = async () => {
    if (Platform.OS === 'android') {
      return true;
    }

    await Permissions.askAsync(Permissions.REMINDERS);
  };

  render() {
    return (
      <TodoStore>
        <AppContainer />
      </TodoStore>
    );
  }
}
