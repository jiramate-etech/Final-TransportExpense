
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
    const [greeting, setGreeting] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadData();
            updateGreeting();
        }, [])
    );

    const updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('สวัสดีตอนเช้า ☀️');
        else if (hour < 18) setGreeting('สวัสดีตอนบ่าย 🌤️');
        else setGreeting('สวัสดีตอนค่ำ 🌙');
    };

    const loadData = async () => {
        const jsonValue = await AsyncStorage.getItem('travel_data');
        const data: ExpenseItem[] = jsonValue != null ? JSON.parse(jsonValue) : [];

        // คำนวณยอดรวม
        const sum = data.reduce((acc, item) => acc + parseFloat(item.amount || '0'), 0);
        setTotal(sum);

        // จัดกลุ่มข้อมูล (Group by Date) - ลูกเล่นสำคัญ
        const grouped = data.reduce((acc: any, item) => {
            // แปลงวันที่เป็น "วว/ดด/ปปปป" เพื่อใช้เป็นหัวข้อ
            const dateObj = item.date ? new Date(item.date) : new Date();
            const dateKey = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' });

            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(item);
            return acc;
        }, {});

        // แปลงเป็น format ที่ SectionList ต้องการ
        const sectionsData = Object.keys(grouped).map(date => ({
            title: date,
            data: grouped[date]
        }));

        setSections(sectionsData);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* --- Header แบบ Passbook --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.subGreeting}>วันนี้เดินทางไปไหนมาบ้าง?</Text>
                </View>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
                    <Text style={styles.totalText}>฿{total.toLocaleString()}</Text>
                </View>
            </View>

            {/* --- รายการแบบแยกวันที่ (SectionList) --- */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
                stickySectionHeadersEnabled={false} // ให้หัวข้อเลื่อนตามไปเลย ไม่ติดข้างบน

                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                )}

                renderItem={({ item }) => {
                    const time = item.date
                        ? new Date(item.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                        : '--:--';

                    return (
                        <View style={styles.card}>
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />

                            <View style={styles.cardContent}>
                                <Text style={styles.title}>{item.title}</Text>
                                <View style={styles.metaRow}>
                                    {/* แสดงเวลาตรงนี้ */}
                                    <View style={styles.timeTag}>
                                        <FontAwesome6 name="clock" size={10} color="#888" />
                                        <Text style={styles.timeText}>{time}</Text>
                                    </View>
                                    <Text style={styles.typeText}>{item.type || 'ทั่วไป'}</Text>
                                </View>
                            </View>

                            <Text style={styles.price}>-{item.amount}</Text>
                        </View>
                    );
                }}

                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome6 name="clipboard" size={50} color="#ddd" />
                        <Text style={styles.emptyText}>ยังไม่มีบันทึกการเดินทาง</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        padding: 24, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, zIndex: 1
    },
    greeting: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subGreeting: { fontSize: 12, color: '#888', marginTop: 2 },
    totalBadge: { alignItems: 'flex-end' },
    totalLabel: { fontSize: 10, color: '#aaa', textTransform: 'uppercase' },
    totalText: { fontSize: 24, fontWeight: '800', color: '#007AFF' },

    sectionHeader: { marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', paddingHorizontal: 10 },

    card: {
        flexDirection: 'row', backgroundColor: 'white', padding: 12, marginBottom: 10, borderRadius: 16, alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1
    },
    image: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f0f0f0' },
    cardContent: { marginLeft: 15, flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#333' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
    timeText: { fontSize: 10, color: '#666', marginLeft: 4 },
    typeText: { fontSize: 10, color: '#aaa' },
    price: { fontSize: 16, fontWeight: 'bold', color: '#FF3B30' },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 15, color: '#aaa' }
});