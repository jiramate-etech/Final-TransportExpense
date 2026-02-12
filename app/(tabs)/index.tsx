
import { View, Text, StyleSheet, StatusBar } from 'react-native'; // ลบ SectionList, Image ออกจาก import เพราะย้ายไปแล้ว
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { ExpenseItem } from '../../constants/types';
import ExpenseList from '../../components/ExpenseList'; // ✅ Import Component ใหม่เข้ามา

export default function HomeScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    // ... (ส่วน Logic การดึงข้อมูล คำนวณ และ Grouping ยังคงเหมือนเดิม 100%) ...
    try {
      const jsonValue = await AsyncStorage.getItem('travel_data');
      let data: ExpenseItem[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const sum = data.reduce((acc, item) => acc + parseFloat(item.amount || '0'), 0);
      setTotal(sum);

      const grouped = data.reduce((acc: any, item) => {
        const dateObj = new Date(item.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

        if (dateObj.toDateString() === today.toDateString()) {
            dateKey = "วันนี้";
        } else if (dateObj.toDateString() === yesterday.toDateString()) {
            dateKey = "เมื่อวาน";
        }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {});

      const sectionsData = Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date]
      }));

      setSections(sectionsData);

    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- ส่วนหัวแสดงยอดเงิน (ยังอยู่ที่เดิม) --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>ยอดใช้จ่ายทั้งหมด 💰</Text>
          <Text style={styles.headerTotal}>฿{total.toLocaleString()}</Text>
        </View>
        <View style={styles.iconBg}>
          <FontAwesome6 name="wallet" size={24} color="#007AFF" />
        </View>
      </View>

      {/* --- เรียกใช้ Component ที่แยกออกไป --- */}
      <ExpenseList sections={sections} /> 

    </SafeAreaView>
  );
}

// เหลือ Styles ไว้เฉพาะส่วน Layout หลักและ Header
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, backgroundColor: 'white',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5
  },
  headerLabel: { fontSize: 14, color: '#888', marginBottom: 2 },
  headerTotal: { fontSize: 32, fontWeight: '800', color: '#333' },
  iconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
});