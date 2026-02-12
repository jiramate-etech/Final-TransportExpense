
import { View, Text, SectionList, Image, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { ExpenseItem } from '../constants/types'; // ตรวจสอบ path ให้ตรงกับโฟลเดอร์ของคุณ

interface ExpenseListProps {
  sections: { title: string; data: ExpenseItem[] }[];
}

export default function ExpenseList({ sections }: ExpenseListProps) {
  return (
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
                <FontAwesome6 name="clock" size={10} color="#999" style={{ marginRight: 4 }} />
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
  );
}

// ย้าย Styles ที่เกี่ยวกับ List มาไว้ที่นี่
const styles = StyleSheet.create({
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

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#ccc' },
  emptySub: { fontSize: 14, color: '#ddd', marginTop: 5 }
});