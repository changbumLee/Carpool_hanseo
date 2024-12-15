import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Dimensions, RefreshControl, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { stations, regions } from './CarpoolRegisterReigon';

// 박스 데이터
const BoxWithLine = ({ startRegion, endRegion, startTime, startDetail, endDetail, CurrentPassengers , max_passengers, onApplyPress }) => {
  const formatDate = (dateString) => {
    if (!dateString) return (
      <View style={styles.rowCenter}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.dateText}> 출발 예정 시간 없음</Text>
      </View>
    );

    const date = new Date(dateString);

    // 날짜와 시간 포맷팅
    const month = date.getUTCMonth() + 1; // 월 (0부터 시작하므로 +1)
    const day = date.getUTCDate(); // 일
    const hours = date.getUTCHours().toString().padStart(2, "0"); // 시 (2자리로 포맷팅)
    const minutes = date.getUTCMinutes().toString().padStart(2, "0"); // 분 (2자리로 포맷팅)

    return (
      <View style={styles.rowCenter}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.dateText}>
          {`${month}/${day}일 ${hours}시 ${minutes}분 예정`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.box}>
      {/* 날짜 및 모집 정보 */}
      <View style={styles.rowBetween}>
        {formatDate(startTime)}
        <View style={styles.rowCenter}>
          <Ionicons name="car-outline" size={16} color="#555" />
          <Text style={styles.peopleText}> {CurrentPassengers+1 } / {max_passengers || 0}명</Text>
        </View>
      </View>

      {/* 출발지 */}
      <View style={styles.row}>
        <View style={styles.whiteCircle} />
        <View>
          <Text style={styles.locationText}>{startRegion}</Text>
          <Text style={styles.detailText}>{startDetail}</Text>
        </View>
      </View>
      <View style={styles.line} />

      {/* 도착지 */}
      <View style={styles.row}>
        <View style={styles.filledCircle} />
        <View>
          <Text style={styles.locationText}>{endRegion}</Text>
          <Text style={styles.detailText}>{endDetail}</Text>
        </View>
      </View>
      {/* 신청 버튼 */}
      <TouchableOpacity style={styles.applyButton} onPress={onApplyPress}>
        <Text style={styles.applyButtonText}>신청</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CarpoolSearchScreen({ id }) {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [searchText, setSearchText] = useState("");
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [isSelectingPath, setIsSelectingPath] = useState(false);
  const [carpoolData, setCarpoolData] = useState([]);
  const [carpoolEtcData, setCarpoolEtcData] = useState({});
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [isAscending, setIsAscending] = useState(true); // 정렬 순서를 관리 (true: 작은 순, false: 큰 순)
  // 모달 상태 관리
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCarpool, setSelectedCarpool] = useState(null);

  const isFocused = useIsFocused(); // 화면 포커스 상태 가져오기
  const fetchData = () => {
    setRefreshing(true); // 새로고침 시작
    axios.post('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/carpool_all')
      .then((response) => {
        const updatedData = response.data.map((item) => {
          return {
            ...item,
            start_region: item.start_region || '출발지 미정',
            end_region: item.end_region || '도착지 미정',
          };
        });
        setCarpoolData(updatedData);
        console.log(response.data);
        const roomIds = updatedData.map(item => item.room_id);
        return axios.post('https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/carpool_etc', { roomIds });
      })
      .then((response) => {
        const etcData = {};
        response.data.forEach(item => {
          etcData[item.room_id] = item.details;
        });
        setCarpoolEtcData(etcData);
        setRefreshing(false); // 새로고침 완료
      })
      .catch((error) => {
        console.log(error);
        setRefreshing(false); // 에러 발생 시 새로고침 상태 해제
      });
  };

  useEffect(() => {
    if (isFocused) {
      fetchData(); // 화면에 포커스될 때 데이터 새로고침
    }
  }, [isFocused]);
  

  const onRefresh = () => {
    fetchData(); // 새로고침할 때 데이터 다시 로드
  };
  const handlePathSelect = () => {
    setIsSelectingPath(!isSelectingPath);
  };
  
  const handleApply = (carpool) => {
    console.log('선택한 카풀:', carpool.driver); // 디버깅 로그 추가
    if(carpool.driver == id){
      // 운전자랑 신청자의 id같으면 오류 발생
      Alert.alert('실패!', '당신은 운전자입니다.')
      return;
    }
    setSelectedCarpool(carpool);
    setModalVisible(true);
  };

  // 출발지와 도착지 조건에 맞는 데이터를 필터링
  const filteredCarpoolData = carpoolData.filter((item) => {
    const startMatches = !selectedStart || item.start_region.includes(selectedStart);
    const endMatches = !selectedEnd || item.end_region.includes(selectedEnd);
    return startMatches && endMatches;
  });

  const confirmApplication = () => {
    if (!id || !selectedCarpool?.room_id) {
      console.error("ID 또는 Room ID가 누락되었습니다.");
      Alert.alert('실패!', 'ID 또는 Room ID가 누락되었습니다. 다시 시도해주세요.');
      return;
    }

    axios
      .post("https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/update_passengers", {
        id,
        roomId: selectedCarpool.room_id,
      })
      .then((response) => {
        if (response.status === 200) {
          Alert.alert('성공!', '신청이 완료되었습니다!');
          fetchData(); // 데이터 새로고침
        } else {
          Alert.alert('실패', '신청 중 문제가 발생했습니다.');
        }
      })
      .catch((error) => {
        // 서버에서 반환한 오류 메시지를 추출
        const errorMessage = error.response?.data?.message || "알 수 없는 오류가 발생했습니다.";
        console.error("신청 중 오류 발생:", errorMessage);
        Alert.alert('실패!', errorMessage); // 사용자에게 알림
      })
      .finally(() => {
        setModalVisible(false);
      });
  };

  const cancelApplication = () => {
    console.log("신청 취소");
    setModalVisible(false);
  };

  const filteredStations = stations.filter(
    (station) =>
      (selectedRegion === "전체" || station.region === selectedRegion) &&
      station.name.includes(searchText)
  );

  const filteredEndStations = filteredStations.filter(
    (station) => station.name !== selectedStart
  );

  const handleResetPath = () => {
    setSelectedStart(null); // 출발지 초기화
    setSelectedEnd(null);   // 도착지 초기화
    setIsSelectingPath(false); // 선택창 닫기
  };


  const displayPath = selectedStart && selectedEnd
    ? `${selectedStart} -> ${selectedEnd}`
    : "경로를 선택하세요";

  const handleSortByTime = () => {
    const sortedData = [...carpoolData].sort((a, b) => {
      return isAscending
        ? new Date(a.start_time) - new Date(b.start_time) // 작은 순 정렬
        : new Date(b.start_time) - new Date(a.start_time); // 큰 순 정렬
    });
    setCarpoolData(sortedData);
    setIsAscending(!isAscending); // 정렬 순서를 토글
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.pathSelectButton}
          onPress={handlePathSelect}
        >
          <Text style={styles.pathSelectText}>{displayPath}</Text>
          <Ionicons name="search" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={handleSortByTime}>
          <Text style={styles.sortText}>
            {isAscending ? '시간순 (작은 → 큰)' : '시간순 (큰 → 작은)'}
          </Text>
        </TouchableOpacity>
      </View>

      {isSelectingPath && (
        <View style={styles.pathSelectionContainer}>
          <View style={styles.navBar}>
            <Text style={styles.navTitle}>경로 선택</Text>
          </View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedStart(null)}>
              <Text style={styles.headerButton}>{selectedStart || "출발지 선택"}</Text>
            </TouchableOpacity>
            <Text style={styles.swapIcon}>↔</Text>
            <TouchableOpacity onPress={() => setSelectedEnd(null)}>
              <Text style={styles.headerButton}>{selectedEnd || "도착지 선택"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetButton} // 새 스타일 추가
              onPress={handleResetPath} // 초기화 함수 연결
            >
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="지역을 선택해주세요."
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.contentContainer}>
            <ScrollView style={styles.categoryContainer} contentContainerStyle={styles.categoryContent}>
              {regions.map((region) => (
                <TouchableOpacity key={region} onPress={() => setSelectedRegion(region)}>
                  <Text style={[styles.category, selectedRegion === region && styles.selectedCategory]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FlatList
              style={styles.stationList}
              data={filteredStations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (!selectedStart) {
                      setSelectedStart(item.name);
                    } else {
                      setSelectedEnd(item.name);
                      setIsSelectingPath(false);
                    }
                  }}
                >
                  <View style={styles.stationItem}>
                    <Text style={styles.stationName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}

      {!isSelectingPath && (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredCarpoolData.map((item, index) => (
            <BoxWithLine
              key={index}
              startRegion={item.start_region}
              endRegion={item.end_region}
              startTime={item.start_time}
              startDetail={carpoolEtcData[item.room_id]?.split(';')[0] || ''}
              endDetail={carpoolEtcData[item.room_id]?.split(';')[1] || ''}
              max_passengers={item.max_passengers || 0}
              CurrentPassengers = {item.current_passengers}
              Driver = {item.driver}
              onApplyPress={() => handleApply(item)}
            />
          ))}
        </ScrollView>
      )}

      {/* 신청 확인 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>신청 확인</Text>
            {selectedCarpool && (
              <>
                <Text style={styles.modalText}>
                  출발일: {selectedCarpool.start_time ? new Date(selectedCarpool.start_time).toLocaleString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                    : '출발 시간 없음'}
                </Text>
                <Text style={styles.modalText}>
                  {selectedCarpool.start_region || '출발지 없음'} → {selectedCarpool.end_region || '도착지 없음'}
                </Text>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmApplication}>
                <Text style={styles.confirmButtonText}>신청</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelApplication}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  searchContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  pathSelectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 20,
  },
  pathSelectText: {
    color: '#555',
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  sortButton: {
    marginLeft: 10,
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sortText: { color: '#555' },
  pathSelectionContainer: { flex: 1, backgroundColor: '#f8f8f8', padding: 10 },
  navBar: { height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  navTitle: { fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  headerButton: { fontSize: 16, fontWeight: 'bold', color: '#6200ee' },
  swapIcon: { marginHorizontal: 10, fontSize: 18, color: '#6200ee' },
  searchInput: { height: 40, backgroundColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 15, margin: 10 },
  contentContainer: { flex: 1, flexDirection: 'row' },
  categoryContainer: { width: '30%', backgroundColor: '#fff', paddingVertical: 10 },
  categoryContent: { alignItems: 'center' },
  category: { fontSize: 14, color: 'gray', paddingVertical: 8 },
  selectedCategory: { color: '#6200ee', fontWeight: 'bold' },
  stationList: { width: '70%', paddingLeft: 10 },
  stationItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  stationName: { fontSize: 16 },
  confirmButton: {
    marginLeft: 10,
    backgroundColor: '#6200ee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  confirmButtonText: { color: '#fff', fontSize: 14 },
  resetButton: {  // 초기화 버튼 
    marginLeft: 10,
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: { alignItems: 'center' },
  box: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  whiteCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#888',
    backgroundColor: 'white',
    marginRight: 10,
  },
  filledCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007bff',
    marginRight: 10,
  },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 5,
  },
  line: { height: 1, backgroundColor: '#ddd', marginTop: 0, marginVertical: 5 },
  detailText: { fontSize: 13, color: '#666', marginBottom: 0 },
  peopleText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 5,
  },
  applyButton: {
    marginTop: 1,
    backgroundColor: '#3B5998',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#3B5998',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

