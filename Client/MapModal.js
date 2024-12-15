import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function SeparateMapModal({
  visible,
  onClose,
  location,
  destinationAddress,
  carpoolInfo,
  isDriver,
}) {
  
  const [currentLocation, setCurrentLocation] = useState(location);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [rating, setRating] = useState(0);
  const socketRef = useRef(null); // WebSocket을 useRef로 관리

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log("도착지 좌표:", { lat, lng });
        return { latitude: lat, longitude: lng };
      } else {
        console.error("주소를 좌표로 변환할 수 없습니다:", data.status);
        return null;
      }
    } catch (error) {
      console.error("좌표 가져오기 실패:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchLocationAndConnectSocket = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("위치 권한 오류", "위치 권한이 거부되었습니다.");
          return;
        }
  
        const initialLocation = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        });
  
        const coords = await getCoordinates(destinationAddress);
        if (coords) {
          setDestinationCoords(coords);
        }
  
        // WebSocket 연결
        socketRef.current = new WebSocket(
          "wss://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app"
        );
  
        socketRef.current.onopen = () => {
          console.log("WebSocket 연결 성공");
          socketRef.current.send(
            JSON.stringify({
              type: "LOCATION_UPDATE",
              latitude: initialLocation.coords.latitude,
              longitude: initialLocation.coords.longitude,
            })
          );
        };
  
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.latitude && data.longitude) {
            setCurrentLocation({
              latitude: data.latitude,
              longitude: data.longitude,
            });
  
            // 도착지와 현재 위치 비교
            if (destinationCoords) {
              const distance = calculateDistance(
                data.latitude,
                data.longitude,
                destinationCoords.latitude,
                destinationCoords.longitude
              );
  
              if (distance <= 1) {
                setShowRatingModal(true);
              }
            }
          }
        };
  
        socketRef.current.onerror = (error) => {
          console.error("WebSocket 에러:", error);
        };
  
        socketRef.current.onclose = () => {
          console.log("WebSocket 연결 종료");
        };
      } catch (error) {
        console.error("GPS 데이터 처리 중 오류:", error);
      }
    };
  
    if (visible) {
      fetchLocationAndConnectSocket();
    }
  
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setDestinationCoords(null); // 도착지 초기화
      setShowRatingModal(false); // 모달 닫을 때 초기화
    };
  }, [visible, destinationAddress]); // destinationAddress 추가
  
  // 도착지 좌표가 변경될 때 거리 계산 및 별점 모달 처리
  useEffect(() => {
    if (currentLocation && destinationCoords) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude
      );
      if (distance <= 1) {
        setShowRatingModal(true);
      } else {
        setShowRatingModal(false);
      }
    }
  }, [currentLocation, destinationCoords]); // currentLocation과 destinationCoords를 의존성으로 추가
  useEffect(() => {
    if (!visible) {
      setDestinationCoords(null);
      setShowRatingModal(false); // 별점 모달 초기화
    }
  }, [visible]);
  

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRatingSubmit = async () => {
    try {
      const data = isDriver
      ? {
          driver_id: carpoolInfo.driver,
          user_id: carpoolInfo.user,
          room_id: carpoolInfo.room,
          ride_temperature: rating,
          drive_temperature: undefined,
        }
      : {
          driver_id: carpoolInfo.driver,
          user_id: carpoolInfo.user,
          room_id: carpoolInfo.room,
          ride_temperature: undefined,
          drive_temperature: rating,
        };

      console.log(data)
      // API 요청
      const response = await fetch("https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/api/point-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      console.log("서버 응답:", responseData);
  
      if (response.ok) {
        Alert.alert("감사합니다!", `별점 ${rating}점을 남겨주셨습니다.`);
      } else {
        // 서버에서 반환된 메시지를 Alert로 보여줌
        Alert.alert("오류", responseData.message || "별점을 저장하지 못했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("별점 저장 실패:", error);
      Alert.alert("오류", "서버와의 통신에 실패했습니다.");
    }
  
    // 상태 초기화
    setRating(0); // 별점 초기화
    setShowRatingModal(false);
    setDestinationCoords(null); // 도착지 상태 초기화
    onClose();
  };
  

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="현재 위치"
                  description="실시간 위치입니다."
                />
              )}
              {destinationCoords && (
                <Marker
                  coordinate={destinationCoords}
                  title="도착지"
                  description="입력된 도착지입니다."
                />
              )}
            </MapView>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>카풀 정보</Text>
            <Text style={styles.infoText}>출발지: {carpoolInfo.startRegion}</Text>
            <Text style={styles.infoText}>도착지: {carpoolInfo.endRegion}</Text>
            <Text style={styles.infoText}>일시: {carpoolInfo.time}</Text>
            <Text style={styles.infoText}>운전자: {carpoolInfo.driver}</Text>
            <Text style={styles.infoText}>요금: {carpoolInfo.fee}원</Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showRatingModal} animationType="slide" transparent={true}>
          <View style={styles.overlay}>
            <View style={styles.ratingContainer}>
              <Text style={styles.infoTitle}>도착했습니다!</Text>
              <Text style={styles.infoText}>별점을 남겨주세요.</Text>
              <TextInput
                style={styles.ratingInput}
                placeholder="별점 입력 (1~5)"
                keyboardType="numeric"
                onChangeText={(text) => setRating(Number(text))}
                value={rating.toString()}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleRatingSubmit}>
                <Text style={styles.submitButtonText}>제출</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  mapContainer: {
    height: 200,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  ratingContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginVertical: 10,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
