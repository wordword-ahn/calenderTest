import React, { Component } from "react"
import { View, Image, TouchableOpacity, AsyncStorage, ScrollView, Text, Dimensions, TextInput, Switch, StyleSheet, Alert, Platform } from "react-native"
import moment from "moment" // 검색해보니 JavaScript 날짜 작업에 쓰인다고 함
import * as Calendar from "expo-calendar"
import * as Localization from "expo-localization"
import Constants from "expo-constants"

import CalendarStrip from "react-native-calendar-strip"
import DateTimePicker from "react-native-modal-datetime-picker"
import { Context } from "../data/CalenderContext"
import { Task } from "../components/CalenderTask"

const styles = StyleSheet.create({
  // Todo list
  taskListContent: {
    height: 100,
    width: 327,
    alignSelf: "center",
    borderRadius: 10,
    shadowColor: "#2E66E7",
    backgroundColor: "#ffffff",
    marginTop: 10,
    marginBottom: 10,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // 둥둥 떠다니는 [+]버튼
  viewTask: {
    position: "absolute",
    bottom: 40,
    right: 17,
    height: 60,
    width: 60,
    backgroundColor: "#2E66E7",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E66E7",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 30,
    shadowOpacity: 0.5,
    elevation: 5,
    zIndex: 999,
  },



  // ----- Todolist 누른 후 뜨는 수정/삭제 창 -----

  // [수정/삭제] 전체를 담는 틀
  changeTaskContainer: {
    height: 475,
    width: 327,
    alignSelf: "center",
    borderRadius: 20,
    shadowColor: "#2E66E7",
    backgroundColor: "#ffffff",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowRadius: 20,
    shadowOpacity: 0.2,
    elevation: 5,
    padding: 22,
  },

  // [수정/삭제] 작은 타이틀 (제목, 내용, 시간)
  changeTitle: {
    color: "#9CAAC4",
    fontSize: 16,
    fontWeight: "600",
  },

  // [수정/삭제] 입력하는 input 창
  changeInput: {
    height: 25,
    fontSize: 19,
    marginTop: 3,
  },

  // [수정/삭제] 알람 + 알람버튼을 담는 틀
  changeAlarmContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // [수정/삭제] 버튼 2개의 틀
  changeButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // [수정/삭제] 수정 버튼
  changeUpdateButton: {
    backgroundColor: "#2E66E7",
    width: 100,
    height: 38,
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 5,
    justifyContent: "center",
    marginRight: 20,
  },

  // [수정/삭제] 삭제 버튼
  changeDeleteButton: {
    backgroundColor: "#ff6347",
    width: 100,
    height: 38,
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 5,
    justifyContent: "center",
  },

  // [수정/삭제] 버튼 안에 들어가는 텍스트
  changeButtonText: {
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
  },

  // 구분선
  changeSepeerator: {
    height: 0.5,
    width: "100%",
    backgroundColor: "#979797",
    alignSelf: "center",
    marginVertical: 20,
  },
})

export default class Home extends Component {
  state = {
    datesWhitelist: [
      {
        start: moment(),
        end: moment().add(365, "days"), // total 4 days enabled
      },
    ],
    todoList: [],
    markedDate: [],
    currentDate: `${moment().format("YYYY")}-${moment().format("MM")}-${moment().format("DD")}`,
    isModalVisible: false,
    selectedTask: null,
    isDateTimePickerVisible: false,
  }

  componentWillMount() {
    this._handleDeletePreviousDayTask()
  }

  _handleDeletePreviousDayTask = async () => {
    const { currentDate } = this.state
    try {
      const value = await AsyncStorage.getItem("TODO")

      if (value !== null) {
        const todoList = JSON.parse(value)
        const todayDate = `${moment().format("YYYY")}-${moment().format("MM")}-${moment().format("DD")}`
        const checkDate = moment(todayDate)
        await todoList.filter((item) => {
          const currDate = moment(item.date)
          const checkedDate = checkDate.diff(currDate, "days")
          if (checkedDate > 0) {
            item.todoList.forEach(async (listValue) => {
              try {
                await Calendar.deleteEventAsync(listValue.alarm.createEventAsyncRes.toString())
              } catch (error) {
                console.log(error)
              }
            })
            return false
          }
          return true
        })

        // await AsyncStorage.setItem('TODO', JSON.stringify(updatedList));
        this._updateCurrentTask(currentDate)
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  _handleModalVisible = () => {
    const { isModalVisible } = this.state
    this.setState({
      isModalVisible: !isModalVisible,
    })
  }

  _updateCurrentTask = async (currentDate) => {
    try {
      const value = await AsyncStorage.getItem("TODO")
      if (value !== null) {
        const todoList = JSON.parse(value)
        const markDot = todoList.map((item) => item.markedDot)
        const todoLists = todoList.filter((item) => {
          if (currentDate === item.date) {
            return true
          }
          return false
        })
        if (todoLists.length !== 0) {
          this.setState({
            markedDate: markDot,
            todoList: todoLists[0].todoList,
          })
        } else {
          this.setState({
            markedDate: markDot,
            todoList: [],
          })
        }
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true })

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false })

  _handleDatePicked = (date) => {
    const { selectedTask } = this.state
    const prevSelectedTask = { ...selectedTask }
    const selectedDatePicked = prevSelectedTask.alarm.time
    const hour = moment(date).hour()
    const minute = moment(date).minute()
    const newModifiedDay = moment(selectedDatePicked)
      .hour(hour)
      .minute(minute)

    prevSelectedTask.alarm.time = newModifiedDay
    this.setState({
      selectedTask: prevSelectedTask,
    })

    this._hideDateTimePicker()
  }

  handleAlarmSet = () => {
    const { selectedTask } = this.state
    const prevSelectedTask = { ...selectedTask }
    prevSelectedTask.alarm.isOn = !prevSelectedTask.alarm.isOn
    this.setState({
      selectedTask: prevSelectedTask,
    })
  }

  _updateAlarm = async () => {
    const { selectedTask } = this.state
    const calendarId = await this._createNewCalendar()
    const event = {
      title: selectedTask.title,
      notes: selectedTask.notes,
      startDate: moment(selectedTask.alarm.time)
        .add(0, "m")
        .toDate(),
      endDate: moment(selectedTask.alarm.time)
        .add(5, "m")
        .toDate(),
      timeZone: Localization.timezone,
    }

    if (selectedTask.alarm.createEventAsyncRes === "") {
      try {
        const createEventAsyncRes = await Calendar.createEventAsync(calendarId.toString(), event)
        const updateTask = { ...selectedTask }
        updateTask.alarm.createEventAsyncRes = createEventAsyncRes
        this.setState({
          selectedTask: updateTask,
        })
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await Calendar.updateEventAsync(selectedTask.alarm.createEventAsyncRes.toString(), event)
      } catch (error) {
        console.log(error)
      }
    }
  }

  _deleteAlarm = async () => {
    const { selectedTask } = this.state
    console.log(selectedTask.alarm)

    try {
      await Calendar.deleteEventAsync(selectedTask.alarm.createEventAsyncRes)

      const updateTask = { ...selectedTask }
      updateTask.alarm.createEventAsyncRes = ""
      this.setState({
        selectedTask: updateTask,
      })
    } catch (error) {
      console.log(error)
    }
  }

  _getEvent = async () => {
    const { selectedTask } = this.state

    if (selectedTask.alarm.createEventAsyncRes) {
      try {
        await Calendar.getEventAsync(selectedTask.alarm.createEventAsyncRes.toString())
      } catch (error) {
        console.log(error)
      }
    }
  }

  _findCalendars = async () => {
    const calendars = await Calendar.getCalendarsAsync()

    return calendars
  }

  _createNewCalendar = async () => {
    const calendars = await this._findCalendars()
    const newCalendar = {
      title: "test",
      entityType: Calendar.EntityTypes.EVENT,
      color: "#2196F3",
      sourceId: Platform.OS === "ios" ? calendars.find((cal) => cal.source && cal.source.name === "Default").source.id : undefined,

      source:
        Platform.OS === "android"
          ? {
              name: calendars.find((cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER).source.name,
              isLocalAccount: true,
            }
          : undefined,
      name: "test",
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      ownerAccount: Platform.OS === "android" ? calendars.find((cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER).ownerAccount : undefined,
    }

    let calendarId = null

    try {
      calendarId = await Calendar.createCalendarAsync(newCalendar)
    } catch (e) {
      Alert.alert(e.message)
    }

    return calendarId
  }

  render() {
    const {
      state: { datesWhitelist, markedDate, todoList, isModalVisible, selectedTask, isDateTimePickerVisible, currentDate },
      props: { navigation },
    } = this

    return (
      <Context.Consumer>
        {(value) => (
          <>
            {selectedTask !== null && (
              <Task isModalVisible={isModalVisible}>
                <DateTimePicker isVisible={isDateTimePickerVisible} onConfirm={this._handleDatePicked} onCancel={this._hideDateTimePicker} mode="time" />






                {/* TodoList 누르면 뜨는 수정/삭제 창 */}
                <View style={styles.changeTaskContainer}>
                  <View>
                      <Text style={styles.changeTitle}> 제목 </Text>
                      <TextInput
                          style={styles.changeInput}
                          onChangeText={(text) => {
                            const prevSelectedTask = { ...selectedTask }
                            prevSelectedTask.title = text
                            this.setState({
                              selectedTask: prevSelectedTask,
                            })
                          }}
                          value={selectedTask.title}
                          placeholder="제목을 적으세요"
                      />
                  </View>

                  <View style={styles.changeSepeerator} />
                  
                  <View>
                    <Text style={styles.changeTitle}> 내용 </Text>

                    <TextInput
                      style={styles.changeInput}
                      onChangeText={(text) => {
                        const prevSelectedTask = { ...selectedTask }
                        prevSelectedTask.notes = text
                        this.setState({
                          selectedTask: prevSelectedTask,
                        })
                      }}
                      value={selectedTask.notes}
                      placeholder="내용을 적으세요"
                    />
                  </View>

                  <View style={styles.changeSepeerator} />

                  
                  {/* 시간 */}
                  <View>
                    <Text style={styles.changeTitle}> 시간 </Text>
                    <TouchableOpacity onPress={() => this._showDateTimePicker()} style={{ height: 25, marginTop: 3 }}>
                      <Text style={{ fontSize: 19 }}>{moment(selectedTask.alarm.time).format("h:mm A")}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.changeSepeerator} />


                  {/* 알람 + 알람버튼 */}
                  <View style={styles.changeAlarmContainer}>
                    <View>
                      <Text style={styles.changeTitle}> 알람 </Text>
                      <View style={{ height: 25, marginTop: 3 }}>
                        <Text style={{ fontSize: 19 }}>{moment(selectedTask.alarm.time).format("h:mm A")}</Text>
                      </View>
                    </View>

                    <Switch value={selectedTask.alarm.isOn} onValueChange={this.handleAlarmSet} />
                  </View>


                  {/* 수정버튼, 삭제버튼 */}
                  <View style={styles.changeButtonContainer}>  
                      <TouchableOpacity
                          onPress={async () => {
                              this._handleModalVisible()
                              if (selectedTask.alarm.isOn) {
                                await this._updateAlarm()
                              } else {
                                await this._deleteAlarm()
                              }
                              await value.updateSelectedTask({
                                date: currentDate,
                                todo: selectedTask,
                              })
                              this._updateCurrentTask(currentDate)
                          }}
                          style={styles.changeUpdateButton}
                      >
                          <Text style={styles.changeButtonText}> 수정 </Text>
                      </TouchableOpacity>

                    {/* 삭제 버튼 */}
                    <TouchableOpacity
                        onPress={async () => {
                            this._handleModalVisible()
                            this._deleteAlarm()
                            await value.deleteSelectedTask({
                              date: currentDate,
                              todo: selectedTask,
                            })
                            this._updateCurrentTask(currentDate)
                        }}
                        style={styles.changeDeleteButton}
                    >
                        <Text style={styles.changeButtonText}> 삭제 </Text>
                    </TouchableOpacity>
                  </View>


                </View>
              </Task>
            )}
            <View
              style={{
                flex: 1,
                paddingTop: Constants.statusBarHeight,
              }}
            >
              <CalendarStrip
                ref={(ref) => {
                  this.calenderRef = ref
                }}
                calendarAnimation={{ type: "sequence", duration: 30 }}
                daySelectionAnimation={{
                  type: "background",
                  duration: 200,
                  highlightColor: "#ffffff",
                }}
                style={{
                  height: 150,
                  paddingTop: 20,
                  paddingBottom: 20,
                }}
                calendarHeaderStyle={{ color: "#000000" }}
                dateNumberStyle={{ color: "#000000", paddingTop: 10 }}
                dateNameStyle={{ color: "#BBBBBB" }}
                highlightDateNumberStyle={{
                  color: "#fff",
                  backgroundColor: "#2E66E7",
                  marginTop: 10,
                  height: 35,
                  width: 35,
                  textAlign: "center",
                  borderRadius: 17.5,
                  overflow: "hidden",
                  paddingTop: 6,
                  fontWeight: "400",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                highlightDateNameStyle={{ color: "#2E66E7" }}
                disabledDateNameStyle={{ color: "grey" }}
                disabledDateNumberStyle={{ color: "grey", paddingTop: 10 }}
                datesWhitelist={datesWhitelist}
                iconLeft={require("../assets/Calenderleft-arrow.png")}
                iconRight={require("../assets/Calenderright-arrow.png")}
                iconContainer={{ flex: 0.1 }}
                markedDates={markedDate}
                onDateSelected={(date) => {
                  const selectedDate = `${moment(date).format("YYYY")}-${moment(date).format("MM")}-${moment(date).format("DD")}`
                  this._updateCurrentTask(selectedDate)
                  this.setState({
                    currentDate: selectedDate,
                  })
                }}
              />

              {/* [+]버튼 */}
              <TouchableOpacity
                style={styles.viewTask}
                onPress={() =>
                  navigation.navigate("CreateTask", {
                    updateCurrentTask: this._updateCurrentTask,
                    currentDate,
                    createNewCalendar: this._createNewCalendar,
                  })
                }
              >
                <Image source={require("../assets/Calenderplus.png")} style={{ height: 30, width: 30 }} />
              </TouchableOpacity>

              {/* Todo 리스트 */}
              <View style={{ width: "100%", height: Dimensions.get("window").height - 170 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  {todoList.map((item) => (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState(
                          {
                            selectedTask: item,
                            isModalVisible: true,
                          },
                          () => {
                            this._getEvent()
                          },
                        )
                      }}
                      key={item.key}
                      style={styles.taskListContent}
                    >
                      <View style={{ marginLeft: 13 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: item.color,
                              marginRight: 8,
                            }}
                          />

                          <Text
                            style={{
                              color: "#554A4C",
                              fontSize: 20,
                              fontWeight: "700",
                            }}
                          >
                            {item.title}
                          </Text>
                        </View>

                        <View>
                          <View
                            style={{
                              flexDirection: "row",
                              marginLeft: 20,
                            }}
                          >
                            <Text
                              style={{
                                color: "#BBBBBB",
                                fontSize: 14,
                                marginRight: 5,
                              }}
                            >
                              {`${moment(item.alarm.time).format("YYYY")}/${moment(item.alarm.time).format("MM")}/${moment(item.alarm.time).format("DD")}`}
                            </Text>

                            <Text
                              style={{
                                color: "#BBBBBB",
                                fontSize: 14,
                              }}
                            >
                              {item.notes}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          height: 80,
                          width: 5,
                          backgroundColor: item.color,
                          borderRadius: 5,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </Context.Consumer>
    )
  }
}
