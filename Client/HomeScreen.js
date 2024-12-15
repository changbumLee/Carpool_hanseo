import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import MyPageScreen from '../components/MyPageScreen';
import CarpoolRegisterScreen from '../components/CarpoolRegisterScreen';
import CarpoolSearchScreen from '../components/CarpoolSearchScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Swipeable from "react-native-gesture-handler/Swipeable";
import MapModal from './MapModal'; // 모달 컴포넌트 가져오기
import { Frame, Notice } from "../assets/Frame";

const Tab = createBottomTabNavigator();

function HomeScreenContent({ id }) {
  const [reservations, setReservations] = useState([]); // 신청한 카풀 데이터
  const [driverCarpools, setDriverCarpools] = useState([]); // 운전자가 모집한 카풀 데이터
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [error, setError] = useState(null); // 에러 메시지
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [modalVisible, setModalVisible] = useState(false); // 지도 모달 상태
  const [currentCarpool, setCurrentCarpool] = useState(null); // 선택한 위치 데이터
  const [showDriverCarpools, setShowDriverCarpools] = useState(false); // 운전자가 모집한 카풀 리스트 보기 토글
  
  const fetchReservations = useCallback(async () => {
    if (id) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getPassengers?id=${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setReservations(data.reservations || []); // 신청한 카풀 데이터 설정
        } else {
          setError(data.message || '데이터를 가져오는 중 오류가 발생했습니다.');
        }
      } catch (fetchError) {
        setError('서버와의 통신 중 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);
  const fetchDriverCarpools = useCallback(async () => {
    if (id) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getDriverCarpools?id=${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setDriverCarpools(data.carpools || []); // 운전자가 모집한 카풀 데이터 설정
        } else {
          setError(data.message || '데이터를 가져오는 중 오류가 발생했습니다.');
        }
      } catch (fetchError) {
        setError('서버와의 통신 중 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (showDriverCarpools) {
        fetchDriverCarpools();
      } else {
        fetchReservations();
      }
    }, [fetchReservations, fetchDriverCarpools, showDriverCarpools])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (showDriverCarpools) {
      await fetchDriverCarpools();
    } else {
      await fetchReservations();
    }
    setRefreshing(false);
  };

  const handleToggleView = () => {
    setShowDriverCarpools((prev) => !prev); // 토글 상태 변경
  };

  const handleOpenModal = (item) => {
    console.log(item)
    setCurrentCarpool({
      location: {
        latitude: item.latitude || 37.5665,
        longitude: item.longitude || 126.9780,
      },
      info: {
        startRegion: item.start_region,
        endRegion: item.end_region,
        time: new Date(item.start_time).toLocaleString('ko-KR', {
          timeZone: 'UTC',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
        driver: item.driver || '정보 없음',
        fee: item.fee || '무료',
        user: id,
        room: item.room_id
      },
      destinationDetail: item.details.split(';')[1] || "충남 서산시 해미면 한서1로 46", 
    });
    setModalVisible(true);
  };
  const handleCancel = async (roomId) => {
    try {
      const response = await fetch(
        "https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/cancelReservation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, roomId }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        Alert.alert("알림", "카풀이 성공적으로 취소되었습니다.");
        fetchReservations();
      } else {
        Alert.alert("오류", data.message || "카풀 취소 중 오류 발생");
      }
    } catch (error) {
      Alert.alert("오류", "서버와의 통신 중 문제가 발생했습니다.");
    }
  };

  const renderReservation = ({ item }) => (
    <Swipeable
        renderRightActions={() => (
            <View style={styles.swipeActions}>
                <TouchableOpacity
                    style={[styles.swipeButton, styles.enterButton]}
                    onPress={() => handleOpenModal(item)}
                >
                    <Text style={styles.actionText}>입장</Text>
                </TouchableOpacity>
                {!showDriverCarpools && (
                  <TouchableOpacity
                    style={[styles.swipeButton, styles.cancelButton]}
                    onPress={() => confirmCancel(item.room_id)}
                  >
                    <Text style={styles.actionText}>취소</Text>
                  </TouchableOpacity>
                )}  
            </View>
        )}
    >
        <TouchableOpacity style={styles.listItem} onPress={() => handleOpenModal(item)}>
            <Frame
                startRegion={item.start_region}
                endRegion={item.end_region}
                startTime={new Date(item.start_time).toLocaleString('ko-KR', {
                    timeZone: 'UTC',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                })}
                carNumber={`${item.vehicle_number}`}
                
            />
        </TouchableOpacity>
      </Swipeable>
  );

  // "취소" 버튼 클릭 시 확인 메시지 표시
  const confirmCancel = (roomId) => {
      Alert.alert(
          '확인',
          '정말 취소하시겠습니까?',
          [
              {
                  text: '취소',
                  style: 'cancel',
              },
              {
                  text: '확인',
                  onPress: () => handleCancel(roomId),
              },
          ],
          { cancelable: false }
      );
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.title}>
          {showDriverCarpools ? '모집한 카풀' : '신청한 카풀'}
        </Text>
        <Switch
          thumbColor={showDriverCarpools ? '#FFE600' : '#fff'}
          trackColor={{ false: '#767577', true: '#229ECF' }}
          value={showDriverCarpools}
          onValueChange={setShowDriverCarpools}
        />
      </View>
      <Notice />      
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : reservations.length === 0 ? (
          <Text>신청한 카풀이 없습니다.</Text>
        ) : (
          <FlatList
            data={showDriverCarpools ? driverCarpools : reservations} // showDriverCarpools 상태에 따라 데이터 변경
            keyExtractor={(item) => item.room_id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderReservation} // 동일한 렌더링 함수 사용
            contentContainerStyle={styles.flatListContent} // 여백 추가
          />
        )}
      </View>


      {/* 지도 모달 */}
      {currentCarpool && (
        <MapModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          location={currentCarpool.location}
          destinationAddress={currentCarpool.destinationDetail} // endDetail 전달
          carpoolInfo={currentCarpool.info}
          isDriver={showDriverCarpools} // showDriverCarpools를 isDriver 대신 사용
        />
      )}
    </View>
  );
}

export default function HomeScreen({ route }) {
  const [id, setId] = useState(null);
  const userid = route?.params?.userid || ''; // 전달된 사용자 ID
  const password = route?.params?.password || '';
  const email = route?.params?.email || '';

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(
          `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/getUserId?username=${userid}`
        );
        const data = await response.json();
        if (response.ok) {
          setId(data.id); // 사용자 ID 설정
        } else {
          console.error('Failed to fetch user ID:', data.message);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [userid]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'CarpoolRegister') {
            iconName = 'car-outline';
          } else if (route.name === 'CarpoolSearchScreen') {
            iconName = 'search-outline';
          } else if (route.name === 'MyPage') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: '내 카풀 예약' }}>
        {() => <HomeScreenContent id={id} />}
      </Tab.Screen>

      <Tab.Screen name="CarpoolRegister" options={{ title: '카풀 등록' }}>
        {() => <CarpoolRegisterScreen userid={userid} id={id} />}
      </Tab.Screen>

      <Tab.Screen name="CarpoolSearchScreen" options={{ title: '카풀 찾기' }}>
        {() => <CarpoolSearchScreen id={id} />}
      </Tab.Screen>

      <Tab.Screen name="MyPage" options={{ title: '마이페이지' }}>
        {() => <MyPageScreen userid={userid} id={id} password={password} email={email} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4865C0',
    marginRight: 10,
  },
  listContainer: {
    flex: 1, // 나머지 공간을 차지하도록 설정
    marginTop: 1,
  },
  flatListContent: {
    paddingBottom: 20, // 여유 공간 추가
  },
  swipeButton: {
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 10,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  listItem: {
    marginVertical: 10,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  swipeButton: {
      width: 80,
      height: '82%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
  },
  enterButton: {
      backgroundColor: '#4CAF50',
  },
  cancelButton: {
      backgroundColor: '#FF4D4D',
  },
  actionText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row', // Switch와 텍스트를 가로로 배치
    justifyContent: 'center', // 수평 방향 중앙 정렬
    alignItems: 'center', // 수직 방향 중앙 정렬
    left: 25,
  },
});
