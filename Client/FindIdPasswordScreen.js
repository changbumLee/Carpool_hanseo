import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function FindIdPasswordScreen({ navigation }) {
    const placeholder = "생년월일 (YYYY-MM-DD)";

    const [isFindingId, setIsFindingId] = useState(true); // true면 아이디 찾기, false면 비밀번호 찾기
    const [name, setName] = useState(''); // 이름 상태
    const [birthdate, setBirthdate] = useState(''); // 생년월일 상태
    const [hintAnswer, setHintAnswer] = useState(''); // 힌트에 대한 답변 상태
    const [hint, setHint] = useState(''); // 제공할 힌트 질문
    const [hintVisible, setHintVisible] = useState(false); // 힌트 표시 여부
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    console.log(hint);
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0]; // 로컬 타임존으로 날짜 변환
        setBirthdate(localDate); // 변환된 날짜를 상태로 저장
        hideDatePicker();
    };

    const handleToggle = () => {
        setIsFindingId(!isFindingId);
        setName(''); // 이름 초기화
        setBirthdate(''); // 생년월일 초기화
        setHintAnswer(''); // 힌트 답변 초기화
        setHint(''); // 힌트 초기화
        setHintVisible(false); // 힌트 표시 여부 초기화
    };

    const fetchHint = async () => {
        if (!isFindingId && name && birthdate) { // 비밀번호 찾기일 때만 실행
            try {
                const response = await fetch(`https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getHint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: name, birthdate }), // username 사용
                });
                const data = await response.json();
                if (response.ok) {
                    setHint(data.hint); // 서버로부터 받은 힌트를 상태에 저장
                    setHintVisible(true); // 힌트 표시
                } else {
                    Alert.alert('힌트 가져오기 실패', data.message || '힌트를 가져올 수 없습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
            }
        }
    };
    console.log(name);

    const handleFind = async () => {
        if (!isFindingId && !hintAnswer) {
            Alert.alert('힌트 답변을 입력해주세요.'); // 힌트 답변이 없으면 경고
            return;
        }
    
        const endpoint = isFindingId ? 'findID' : 'findPassword';
    
        const requestData = isFindingId
            ? { name, birthdate } // 아이디 찾기일 때 이름과 생년월일만 보냄
            : { username: name, birthdate, hintAnswer }; // 비밀번호 찾기일 때 모든 필드 보냄
    
        try {
            const response = await fetch(`https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            const data = await response.json();
            if (response.ok) {
                if (isFindingId) {
                    Alert.alert('아이디 찾기', `아이디: ${data.username}`);
                } else {
                    Alert.alert('비밀번호 찾기', '비밀번호가 이메일로 전송되었습니다.');
                }
            } else {
                Alert.alert(isFindingId ? '아이디 찾기 실패' : '비밀번호 찾기 실패', data.message || '정보를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, isFindingId && styles.activeTab]} 
                    onPress={() => setIsFindingId(true)}
                >
                    <Text style={[styles.tabText, isFindingId && styles.activeTabText]}>아이디 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, !isFindingId && styles.activeTab]} 
                    onPress={() => setIsFindingId(false)}
                >
                    <Text style={[styles.tabText, !isFindingId && styles.activeTabText]}>비밀번호 찾기</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>{isFindingId ? '아이디 찾기' : '비밀번호 찾기'}</Text>
            {isFindingId ? (
                <>
                    <TextInput 
                        style={styles.input} 
                        placeholder="이름" 
                        value={name}
                        onChangeText={setName}
                    />
                    <TouchableOpacity style={styles.datePickerContainer} onPress={showDatePicker}>
                        <TextInput 
                            style={styles.input} 
                            placeholder={placeholder}
                            value={birthdate}
                            // onChangeText={setBirthdate}
                            editable={false}

                        />
                        <DateTimePickerModal
                            headerTextIOS={placeholder}
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TextInput 
                        style={styles.input} 
                        placeholder="아이디" 
                        value={name} // 여기를 username 대신 name으로 수정
                        onChangeText={setName}
                    />
                    <TouchableOpacity style={styles.datePickerContainer} onPress={showDatePicker}>
                        <TextInput 
                            style={styles.input} 
                            placeholder={placeholder}
                            value={birthdate}
                            // onChangeText={setBirthdate}
                            editable={false}

                        />
                        <DateTimePickerModal
                            headerTextIOS={placeholder}
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </TouchableOpacity>


                    {!hintVisible ? (
                        <TouchableOpacity style={styles.button} onPress={fetchHint}>
                            <Text style={styles.buttonText}>힌트 보기</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.hintText}>{hint}</Text>
                    )}
                    <TextInput 
                        style={styles.input} 
                        placeholder="힌트 답변" 
                        value={hintAnswer}
                        onChangeText={setHintAnswer}
                    />
                </>
            )}
            <TouchableOpacity style={styles.button} onPress={handleFind}>
                <Text style={styles.buttonText}>{isFindingId ? '아이디 찾기' : '비밀번호 찾기'}</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        alignItems: 'center',
        justifyContent: 'flex-start', // 수직 정렬을 위쪽으로 설정
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    datePickerContainer:{
        width: '100%',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16, // 텍스트 사이즈를 통일
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    activeTabText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    hintText: {
        fontSize: 18, // 힌트 크기를 18로 키움
        color: '#555',
        marginBottom: 5,
    },
});
