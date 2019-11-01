// ***** 캘린더에서 +버튼을 누르면 이 창으로 진입한다 ***** //

import React, { Component } from "react"
import { Text, Image, View, TouchableOpacity, Dimensions, ScrollView, TextInput, Keyboard, Switch, StyleSheet, Alert } from "react-native"
import { CalendarList } from "react-native-calendars"
import moment from "moment"
import * as Calendar from "expo-calendar"
import * as Localization from "expo-localization"
import Constants from "expo-constants"
import DateTimePicker from "react-native-modal-datetime-picker"
import uuid from "uuid"
import { Context } from "../data/CalenderContext"

const { width: vw } = Dimensions.get("window")
// moment().format('YYYY/MM/DD')


const styles = StyleSheet.create({
    // 화면 배경
    background: {
      flex: 1,
      paddingTop: Constants.statusBarHeight,
      backgroundColor: "#eaeef7",
    },

    // [←] 뒤로가기 버튼
    backButton: {
      flexDirection: "row",
      marginTop: 60,
      width: "100%",
      alignItems: "center",
    },  

    // 화면 최상단에 나오는 타이틀 ("일정추가")
    firstTitle: {
      alignSelf: "center",
      fontSize: 20,
      width: 120,
      height: 25,
      textAlign: "center",
    },

    // [달력]을 포함하는 틀
    calenderContainer: {
      marginTop: 30,
      width: 350,
      height: 350,
      alignSelf: "center",
    },

    // [제목/내용/시간/알람] 포함하는 틀
    BigContainer: {
      height: 400,
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

    // input 창 위에 달린 타이틀
    inputTitle: {
      color: "#9CAAC4",
      fontSize: 16,
      fontWeight: "600",
    },

    // 입력하는 input 창
    inputContent: {
      height: 25,
      borderColor: "#5DD976",
      borderLeftWidth: 1,
      paddingLeft: 8,
      fontSize: 19,
    },

    // 제목 | 내용 사이에 들어가는 실선
    line: {
      height: 0.5,
      width: "100%",
      backgroundColor: "#979797",
      alignSelf: "center",
      marginVertical: 20,
    },

    alarmStyle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    // 일정추가 버튼
    createButton: {
      width: 252,
      height: 48,
      alignSelf: "center",
      marginTop: 40,
      borderRadius: 5,
      justifyContent: "center",
    },
})



export default class CreateTask extends Component {
  state = {
    selectedDay: {
      [`${moment().format("YYYY")}-${moment().format("MM")}-${moment().format("DD")}`]: {
        selected: true,
        selectedColor: "#2E66E7",
      },
    },
    currentDay: moment().format(),
    taskText: "",
    notesText: "",
    keyboardHeight: 0,
    visibleHeight: Dimensions.get("window").height,
    isAlarmSet: false,
    alarmTime: moment().format(),
    isDateTimePickerVisible: false,
    timeType: "",
    creatTodo: {},
    createEventAsyncRes: "",
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", this._keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", this._keyboardDidHide)
  }

  componentWillUnmount() {
    Keyboard.removeListener("keyboardDidShow", this._keyboardDidShow)
    Keyboard.removeListener("keyboardDidHide", this._keyboardDidHide)
  }

  _keyboardDidShow = (e) => {
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      visibleHeight: Dimensions.get("window").height - e.endCoordinates.height - 30,
    })
  }

  _keyboardDidHide = () => {
    this.setState({
      visibleHeight: Dimensions.get("window").height,
    })
  }

  handleAlarmSet = () => {
    const { isAlarmSet } = this.state
    this.setState({
      isAlarmSet: !isAlarmSet,
    })
  }

  synchronizeCalendar = async (value) => {
    const { navigation } = this.props
    const { createNewCalendar } = navigation.state.params
    const calendarId = await createNewCalendar()

    try {
      const createEventAsyncRes = await this._addEventsToCalendar(calendarId)
      this.setState(
        {
          createEventAsyncRes,
        },
        () => {
          this._handleCreateEventData(value)
        },
      )
    } catch (e) {
      Alert.alert(e.message)
    }
  }

  _addEventsToCalendar = async (calendarId) => {
    const { taskText, notesText, alarmTime } = this.state
    const event = {
      title: taskText,
      notes: notesText,
      startDate: moment(alarmTime)
        .add(0, "m")
        .toDate(),
      endDate: moment(alarmTime)
        .add(5, "m")
        .toDate(),
      timeZone: Localization.timezone,
    }

    try {
      const createEventAsyncRes = await Calendar.createEventAsync(calendarId.toString(), event)

      return createEventAsyncRes
    } catch (error) {
      console.log(error)
    }
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true })

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false })

  _handleCreateEventData = async (value) => {
    const {
      state: { currentDay, taskText, notesText, isAlarmSet, alarmTime, createEventAsyncRes },
      props: { navigation },
    } = this
    const { updateCurrentTask, currentDate } = navigation.state.params
    const creatTodo = {
      key: uuid(),
      date: `${moment(currentDay).format("YYYY")}-${moment(currentDay).format("MM")}-${moment(currentDay).format("DD")}`,
      todoList: [
        {
          key: uuid(),
          title: taskText,
          notes: notesText,
          alarm: {
            time: alarmTime,
            isOn: isAlarmSet,
            createEventAsyncRes,
          },
          color: `rgb(${Math.floor(Math.random() * Math.floor(256))},${Math.floor(Math.random() * Math.floor(256))},${Math.floor(Math.random() * Math.floor(256))})`,
        },
      ],
      markedDot: {
        date: currentDay,
        dots: [
          {
            key: uuid(),
            color: "#2E66E7",
            selectedDotColor: "#2E66E7",
          },
        ],
      },
    }

    await value.updateTodo(creatTodo)
    await updateCurrentTask(currentDate)
    navigation.navigate("Home")
  }

  _handleDatePicked = (date) => {
    const { currentDay } = this.state
    const selectedDatePicked = currentDay
    const hour = moment(date).hour()
    const minute = moment(date).minute()
    const newModifiedDay = moment(selectedDatePicked)
      .hour(hour)
      .minute(minute)

    this.setState({
      alarmTime: newModifiedDay,
    })

    this._hideDateTimePicker()
  }


  render() {
    const {
      state: { selectedDay, currentDay, taskText, visibleHeight, notesText, isAlarmSet, alarmTime, isDateTimePickerVisible },
      props: { navigation },
    } = this

    return (
      <Context.Consumer>
        {(value) => (
          <>
            <DateTimePicker isVisible={isDateTimePickerVisible} onConfirm={this._handleDatePicked} onCancel={this._hideDateTimePicker} mode="time" />


            <View style={styles.background}>
              <View style={{ height: visibleHeight }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                
                  {/* 화면 상단 */}
                  <View style={styles.backButton}>
                      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={{ marginRight: vw / 2 - 120, marginLeft: 20 }}>
                        <Image style={{ height: 25, width: 40 }} source={require("../assets/Calenderback.png")} resizeMode="contain" />
                      </TouchableOpacity>

                      <Text style={styles.firstTitle}> 일정 추가 </Text>
                  </View>


                  {/* 달력 */}                  
                  <View style={styles.calenderContainer}>
                    <CalendarList
                      style={{
                        width: 350,
                        height: 350,
                      }}
                      current={currentDay}
                      minDate={moment().format()}
                      horizontal
                      pastScrollRange={0}
                      pagingEnabled
                      calendarWidth={350}
                      onDayPress={(day) => {
                        this.setState({
                          selectedDay: {
                            [day.dateString]: {
                              selected: true,
                              selectedColor: "#2E66E7",
                            },
                          },
                          currentDay: day.dateString,
                          alarmTime: day.dateString,
                        })
                      }}
                      monthFormat="yyyy MMMM"
                      hideArrows
                      markingType="simple"
                      theme={{
                        selectedDayBackgroundColor: "#2E66E7",
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: "#2E66E7",
                        backgroundColor: "#eaeef7",
                        calendarBackground: "#eaeef7",
                        textDisabledColor: "#d9dbe0",
                      }}
                      markedDates={selectedDay}
                    />
                  </View>


                  {/* 입력 */}     
                  <View style={styles.BigContainer}>
                    <Text style={styles.inputTitle}> 제목 </Text>
                    <TextInput style={styles.inputContent} onChangeText={(text) => this.setState({ taskText: text })} value={taskText} placeholder="무슨 일을 하실건가요?" />

                    <View style={styles.line} />
                    
                    <View>
                      <Text style={styles.inputTitle}> 내용 </Text>
                      <TextInput style={styles.inputContent}
                        onChangeText={(text) => this.setState({ notesText: text })}
                        value={notesText}
                        placeholder="내용을 적으세요"
                      />
                    </View>

                    
                    <View style={styles.line} />


                    {/* 시간 */}     
                    <View>
                        <Text style={styles.inputTitle}> 시간 </Text>
                        <TouchableOpacity onPress={() => this._showDateTimePicker()}>
                            <Text style={{ fontSize: 19 }}>{moment(alarmTime).format("h:mm A")}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    
                    <View style={styles.line} />
                    
                    
                    {/* 알람 */}  
                    <View style={styles.alarmStyle}>
                        <View>
                            <Text style={styles.inputTitle}> 알람 </Text>
                            <View style={{ height: 25, marginTop: 3 }}>
                                <Text style={{ fontSize: 19 }}>{moment(alarmTime).format("h:mm A")}</Text>
                            </View>
                        </View>
                      <Switch value={isAlarmSet} onValueChange={this.handleAlarmSet} />
                    </View>
                  </View>


                  {/* 일정추가 버튼 */}  
                  <TouchableOpacity
                    disabled={taskText === ""}
                    style={[
                      styles.createButton,
                      {
                        backgroundColor: taskText === "" ? "rgba(46, 102, 231,0.5)" : "#2E66E7",
                      },
                    ]}
                    onPress={async () => {
                      if (isAlarmSet) {
                        await this.synchronizeCalendar(value)
                      }
                      if (!isAlarmSet) {
                        this._handleCreateEventData(value)
                      }
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        textAlign: "center",
                        color: "#fff",
                      }}
                    >
                      일정 추가
                    </Text>
                  </TouchableOpacity>



                </ScrollView>
              </View>
            </View>
          </>
        )}
      </Context.Consumer>
    )
  }
}
