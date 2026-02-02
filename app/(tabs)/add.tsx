import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // ตัวเลือกวันที่
import { ExpenseItem } from '../../constants/types';

export default function AddScreen() {
    // --- ตัวแปร State เก็บข้อมูล ---
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [image, setImage] = useState('');
    const [selectedType, setSelectedType] = useState('other'); // เก็บประเภทที่เลือก

    // State สำหรับวันที่
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    // ข้อมูลปุ่มเลือกด่วน (รวมปุ่ม "อื่นๆ" ที่เป็น 3 จุดตามที่ขอ)
    const quickOptions = [
        { id: 'songthaew', label: 'สองแถว', icon: 'bus', color: '#FF9F1C', defaultImg: 'https://img.icons8.com/color/96/bus.png' },
        { id: 'moto', label: 'วินมอไซต์', icon: 'motorcycle', color: '#2EC4B6', defaultImg: 'https://img.icons8.com/color/96/motorcycle.png' },
        { id: 'grab', label: 'Grab', icon: 'car', color: '#00B14F', defaultImg: 'https://img.icons8.com/color/96/taxi.png' },
        { id: 'other', label: 'อื่นๆ', icon: 'ellipsis', color: '#6c757d', defaultImg: 'https://img.icons8.com/color/96/general-ledger.png' },
    ];

    // ฟังก์ชันเลือกด่วน (ตัด Animation ออกแล้ว)
    const handleSelect = (option: any) => {
        setSelectedType(option.id);
        setTitle(option.label);
        setImage(option.defaultImg);
    };

    // ฟังก์ชันแสดงตัวเลือกวันที่/เวลา
    const showMode = (currentMode: 'date' | 'time') => {
        setShowPicker(true);
        setPickerMode(currentMode);
    };

    // ฟังก์ชันเมื่อเปลี่ยนวันที่
    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false); // Android ต้องสั่งปิดเอง
        if (date) setSelectedDate(date);
    };

    // ฟังก์ชันบันทึกข้อมูล
    const saveItem = async () => {
        if (!title || !amount) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อรายการและราคา');
            return;
        }

        // เตรียมข้อมูล
        const newItem: ExpenseItem = {
            id: Date.now().toString(),
            title: title,
            amount: amount,
            imageUrl: image || 'https://via.placeholder.com/150',
            date: selectedDate.toISOString(), // ใช้วันที่ที่เลือก
            type: selectedType
        };

        // บันทึกลงเครื่อง
        const existing = await AsyncStorage.getItem('travel_data');
        const oldData = existing ? JSON.parse(existing) : [];
        const newData = [newItem, ...oldData]; // เอาของใหม่ไว้บนสุด

        await AsyncStorage.setItem('travel_data', JSON.stringify(newData));

        // รีเซ็ตค่า (ไม่มี Animation)
        setTitle(''); setAmount(''); setImage(''); setSelectedType('other');
        setSelectedDate(new Date());

        Alert.alert('สำเร็จ', 'บันทึกเรียบร้อย', [
            { text: 'ตกลง', onPress: () => router.push('/') }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>จดบันทึกรายจ่าย 📝</Text>

                {/* --- ส่วนเลือกแบบด่วน (Grid) --- */}
                <Text style={styles.label}>เลือกประเภท</Text>
                <View style={styles.gridContainer}>
                    {quickOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[
                                styles.card,
                                selectedType === opt.id && styles.cardActive // ถ้าเลือกอยู่ให้เปลี่ยนสี
                            ]}
                            onPress={() => handleSelect(opt)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                                {/* @ts-ignore */}
                                <FontAwesome6 name={opt.icon} size={18} color="white" />
                            </View>
                            <Text style={[styles.cardText, selectedType === opt.id && { color: opt.color, fontWeight: 'bold' }]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- ฟอร์มกรอกข้อมูล --- */}
                <View style={styles.formSection}>
                    <Text style={styles.label}>ชื่อรายการ</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="เช่น ค่ารถ..." />

                    <Text style={styles.label}>ราคา (บาท)</Text>
                    <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" />

                    {/* --- เลือกวันที่และเวลา --- */}
                    <Text style={styles.label}>วันและเวลา</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => showMode('date')}>
                            <FontAwesome6 name="calendar-days" size={16} color="#007AFF" />
                            <Text style={styles.dateText}>
                                {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dateBtn} onPress={() => showMode('time')}>
                            <FontAwesome6 name="clock" size={16} color="#007AFF" />
                            <Text style={styles.dateText}>
                                {selectedDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ตัวเลือกวันที่ (แสดงเฉพาะตอนกด) */}
                    {showPicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode={pickerMode}
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={styles.label}>รูปภาพ (URL)</Text>
                    <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." />

                    {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}

                    <TouchableOpacity style={styles.btnSave} onPress={saveItem}>
                        <Text style={styles.btnText}>บันทึกข้อมูล</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    container: { padding: 20, paddingBottom: 50 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },

    // Styles สำหรับ Grid
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
    card: {
        width: '48%', backgroundColor: 'white', padding: 12, borderRadius: 12,
        alignItems: 'center', marginBottom: 10, flexDirection: 'row',
        borderWidth: 1, borderColor: '#eee'
    },
    cardActive: { backgroundColor: '#F0F9FF', borderColor: '#007AFF' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    cardText: { fontSize: 14, color: '#555' },

    // Styles สำหรับ Form
    formSection: { marginTop: 10 },
    label: { marginTop: 15, color: '#333', fontWeight: '600', fontSize: 14, marginBottom: 5 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },

    // Styles สำหรับปุ่มวันที่
    dateRow: { flexDirection: 'row', gap: 10 },
    dateBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'white', padding: 12, borderRadius: 8, gap: 8,
        borderWidth: 1, borderColor: '#ddd'
    },
    dateText: { color: '#007AFF', fontWeight: '500' },

    preview: { width: '100%', height: 150, marginTop: 15, borderRadius: 8, resizeMode: 'cover' },

    btnSave: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});