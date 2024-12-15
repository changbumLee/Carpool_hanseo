import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';

export default function HistoryListScreen({ route }) {
  const { id, permission } = route.params; // 사용자 ID와 권한 전달받음
  const [driverHistory, setDriverHistory] = useState([]); // 운전 내역
  const [passengerHistory, setPassengerHistory] = useState([]); // 탑승 내역
  const [loading, setLoading] = useState(true);

  console.log('프리' ,permission);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // 탑승 내역 조회
        const passengerResponse = await fetch(
          `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/get-passenger-history`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
          }
        );
        const passengerData = await passengerResponse.json();

        if (passengerResponse.ok) {
          setPassengerHistory(passengerData.history || []);
        } else {
          console.error('Failed to fetch passenger history:', passengerData.message);
          Alert.alert('오류', passengerData.message || '탑승 내역을 불러오는 중 문제가 발생했습니다.');
        }

        // 운전자 권한이 있는 경우 운전 내역 조회
        if (permission === '운전자') {
          const driverResponse = await fetch(
            `https://port-0-car-project-m36t9oitd12e09cb.sel4.cloudtype.app/get-driver-history`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id }),
            }
          );
          const driverData = await driverResponse.json();

          if (driverResponse.ok) {
            setDriverHistory(driverData.history || []);
          } else {
            console.error('Failed to fetch driver history:', driverData.message);
            Alert.alert('오류', driverData.message || '운전 내역을 불러오는 중 문제가 발생했습니다.');
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        Alert.alert('오류', '이용 내역을 불러오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, permission]);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.details}>
        {item.start_region} → {item.end_region}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>불러오는 중...</Text>
      ) : (
        <>
          {permission === '운전자' && (
            <>
              <Text style={styles.sectionTitle}>운전한 카풀 내역</Text>
              {driverHistory.length > 0 ? (
                <FlatList
                  data={driverHistory}
                  keyExtractor={(item) => item.room_id.toString()}
                  renderItem={renderHistoryItem}
                />
              ) : (
                <Text style={styles.emptyText}>운전한 카풀이 없습니다.</Text>
              )}
            </>
          )}

          <Text style={styles.sectionTitle}>탑승한 카풀 내역</Text>
          {passengerHistory.length > 0 ? (
            <FlatList
              data={passengerHistory}
              keyExtractor={(item) => item.room_id.toString()}
              renderItem={renderHistoryItem}
            />
          ) : (
            <Text style={styles.emptyText}>탑승한 카풀이 없습니다.</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
});
