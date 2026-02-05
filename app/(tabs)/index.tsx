import { View, Text, SectionList, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { ExpenseItem } from '../../constants/types';

export default function HomeScreen() {
  const [sections, setSections] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // โหลดข้อมูลทุกครั้งที่เข้าหน้านี้
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('travel_data');
      let data: ExpenseItem[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // 1. เรียงลำดับจาก ใหม่ -> เก่า
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 2. คำนวณยอดเงินรวม
      const sum = data.reduce((acc, item) => acc + parseFloat(item.amount || '0'), 0);
      setTotal(sum);

      // 3. จัดกลุ่มข้อมูลตามวันที่ (Group by Date)
      const grouped = data.reduce((acc: any, item) => {
        // แปลงวันที่เป็นชื่อกลุ่ม เช่น "วันนี้", "เมื่อวาน", "10 ต.ค. 66"
        const dateObj = new Date(item.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

        // เช็คว่าเป็นวันนี้หรือเมื่อวานไหม?
        if (dateObj.toDateString() === today.toDateString()) {
            dateKey = "วันนี้";
        } else if (dateObj.toDateString() === yesterday.toDateString()) {
            dateKey = "เมื่อวาน";
        }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {});

      // แปลงเป็นรูปแบบที่ SectionList ต้องการ
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

      {/* --- ส่วนหัวแสดงยอดเงิน --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>ยอดใช้จ่ายทั้งหมด 💰</Text>
          <Text style={styles.headerTotal}>฿{total.toLocaleString()}</Text>
        </View>
        <View style={styles.iconBg}>
          <FontAwesome6 name="wallet" size={24} color="#007AFF" />
        </View>
      </View>

      {/* --- รายการแสดงผล (SectionList) --- */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        stickySectionHeadersEnabled={false}
        
        // ส่วนหัวของแต่ละวัน
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}

        // การ์ดรายการแต่ละอัน
        renderItem={({ item }) => {
          const time = new Date(item.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
          
          return (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.meta}>
                  <FontAwesome6 name="clock" size={10} color="#999" style={{marginRight: 4}} />
                  <Text style={styles.time}>{time} น.</Text>
                  <Text style={styles.type}>• {item.type === 'other' ? 'อื่นๆ' : item.type}</Text>
                </View>
              </View>

              <Text style={styles.price}>-{item.amount}</Text>
            </View>
          );
        }}

        // กรณีไม่มีข้อมูล
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="clipboard-list" size={60} color="#ddd" />
            <Text style={styles.emptyText}>ยังไม่มีรายการเดินทาง</Text>
            <Text style={styles.emptySub}>กดปุ่ม "จดบันทึก" ด้านล่างได้เลย</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  
  // Header Styles
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, backgroundColor: 'white',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5
  },
  headerLabel: { fontSize: 14, color: '#888', marginBottom: 2 },
  headerTotal: { fontSize: 32, fontWeight: '800', color: '#333' },
  iconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },

  // List Styles
  sectionHeader: { marginTop: 5, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginLeft: 4 },
  
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', 
    padding: 12, borderRadius: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2
  },
  image: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0f0f0' },
  content: { flex: 1, marginLeft: 15 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  time: { fontSize: 12, color: '#999' },
  type: { fontSize: 12, color: '#aaa', marginLeft: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#FF3B30' },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#ccc' },
  emptySub: { fontSize: 14, color: '#ddd', marginTop: 5 }
});