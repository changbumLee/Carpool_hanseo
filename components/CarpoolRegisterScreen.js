import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CarpoolRegisterScreen from './CarpoolRegisterReigon'; // 지역 선택 모달 화면
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CarpoolRecruitPage({ userid, id }) {
    const navigation = useNavigation(); // useNavigation 훅 사용
    const route = useRoute();
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date(Date.now() + 15 * 60 * 1000));
    const [selectedLimit, setSelectedLimit] = useState('3인');
    // const [selectedGender, setSelectedGender] = useState('무관');
    const [startPointDetail, setStartPointDetail] = useState('');
    const [endPointDetail, setEndPointDetail] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSelectingStart, setIsSelectingStart] = useState(true);

    const handleOpenModal = (isStart) => {
        setIsSelectingStart(isStart);
        setModalVisible(true);
    };

    const handleLocationSelect = (location) => {
        setModalVisible(false);
        if (isSelectingStart) {
            setStartPoint(location);
        } else {
            setEndPoint(location);
        }
    };

    const swapPoints = () => {
      const tempPoint = startPoint;
      const tempDetail = startPointDetail;
      setStartPoint(endPoint);
      setEndPoint(tempPoint);
      setStartPointDetail(endPointDetail);
      setEndPointDetail(tempDetail);
  };

    const handleCreateCarpool = async () => {
        if (startPoint === '' || endPoint === '' || startPointDetail === '' || endPointDetail === '') {
            Alert.alert('카풀 생성 실패', '모든 필드를 입력해주세요.');
            return;
        }

        const date = selectedDate.toISOString().split('T')[0];

        const selectedDateTime = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            selectedTime.getHours(),
            selectedTime.getMinutes()
        );

        const formattedDateTime = `${selectedDateTime.toISOString().split('T')[0]} ${selectedDateTime
            .toTimeString()
            .slice(0, 5)}`;

        const currentTime = new Date();
        const localCreatedAt = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentTime
            .getDate()
            .toString()
            .padStart(2, '0')} ${currentTime
            .getHours()
            .toString()
            .padStart(2, '0')}:${currentTime
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`;


        const room_id = Math.floor(Math.random() * 10001);

        const carpoolDetails = {
          room_id,
          driver: id, // 운전자 ID를 지정해주세요
          max_passengers: selectedLimit.replace('인', ''),
          date,
          start_time: formattedDateTime,
          created_at: localCreatedAt,
          start_region: startPoint,
          end_region: endPoint,
          details: `${startPointDetail};${endPointDetail}`, // 세부 사항을 저장
        };

        try {
            console.log("Attempting to fetch...");
            const response = await fetch('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/createCarpool', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(carpoolDetails),
            });
            console.log("Fetch completed", response);
            console.log(JSON.stringify(carpoolDetails))

            const data = await response.json();
            console.log(data.message);
    
            if (response.ok) {
                Alert.alert('카풀 생성 완료', '카풀이 성공적으로 생성되었습니다!');
                navigation.navigate('Home');
            } else {
                Alert.alert('카풀 생성 실패', data.message || '카풀 생성에 실패했습니다.');
            }
         } catch (error) {
              console.error('Error:', error);
              console.error('Error stack trace:', error.stack); // 스택 트레이스 출력
              Alert.alert('카풀 생성 실패', '네트워크 오류가 발생했습니다.');
         }
    };
    useEffect(() => {
        if (route.params?.addressData) {
          const { default_address, isStart } = route.params.addressData;
          if (isStart) {
            setStartPointDetail(default_address);
          } else {
            setEndPointDetail(default_address);
          }
        }
      }, [route.params]);
    const navigateToAddressScreen = (isStart) => {
        navigation.navigate('AddAddressScreen', {
          isStart,
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>모집하기</Text>
            <Text style={styles.subtitle}>방장이 되어 원하는 시간과 장소를 입력하고 사람들을 모집할 수 있어요</Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>출발지</Text>
                <TouchableOpacity style={styles.input} onPress={() => handleOpenModal(true)}>
                    <Text>{startPoint || '출발지 선택'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateToAddressScreen(true)}>
                    <TextInput
                        style={styles.detailInput}
                        placeholder="상세 주소 (예: 한서대학교)"
                        value={startPointDetail}
                        editable={false}
                    />
                </TouchableOpacity>
            </View>
            
            {/* 출발지와 도착지 교환 버튼 */}
            <TouchableOpacity style={styles.swapButton} onPress={swapPoints}>
                <MaterialIcons name="cached" size={30} color="#4CAF50" style={styles.swapButtonText}/>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>도착지</Text>
                <TouchableOpacity style={styles.input} onPress={() => handleOpenModal(false)}>
                    <Text>{endPoint || '도착지 선택'}</Text>
                </TouchableOpacity >
                <TouchableOpacity onPress={() => navigateToAddressScreen(false)}>
                    <TextInput
                        style={styles.detailInput}
                        placeholder="상세 주소 (예: 서울특별시 사당역)"
                        value={endPointDetail}
                        editable={false}
                    />
                </TouchableOpacity>
            </View>


            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>날짜</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.input}>{selectedDate.toISOString().split('T')[0]}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            mode="date"
                            value={selectedDate}
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) setSelectedDate(date);
                            }}
                        />
                    )}
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>시간</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.input}>{selectedTime.toTimeString().slice(0, 5)}</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            mode="time"
                            value={selectedTime}
                            onChange={(event, time) => {
                                setShowTimePicker(false);
                                if (time) setSelectedTime(time);
                            }}
                        />
                    )}
                </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>탑승인원 (운전자 포함)</Text>
              <View style={styles.row}>
                {['3인', '4인', '5인'].map((limit) => (
                    <TouchableOpacity
                        key={limit}
                        style={[styles.optionButton, selectedLimit === limit && styles.selectedOption]}
                        onPress={() => setSelectedLimit(limit)}
                    >
                        <Text>{limit}</Text>
                    </TouchableOpacity>
                ))}
              </View>
            </View>


            <TouchableOpacity style={styles.startButton} onPress={handleCreateCarpool}>
                <Text style={styles.buttonText}>카풀 시작</Text>
            </TouchableOpacity>

            {/* 지역 선택 모달 */}
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
               <CarpoolRegisterScreen onSelect={handleLocationSelect} isSelectingStart={isSelectingStart} />
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 20 },
    inputContainer: { marginBottom: 10 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    input: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff' },
    detailInput: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginTop: 5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    halfInput: { flex: 0.48 },
    optionButton: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, flex: 1, alignItems: 'center' },
    selectedOption: { backgroundColor: '#90CAF9', color: '#fff' },
    startButton: { backgroundColor: '#4865C0', padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    swapButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 10,
        width: 50,
    },
    swapButtonText: { color: '#2196F3',  fontWeight: 'bold' },
});

