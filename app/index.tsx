import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { 
  Button, 
  TextInput as PaperTextInput, 
  Card, 
  Text, 
  ActivityIndicator,
  Portal,
  Modal,
  IconButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUsers, addUser as addUserAction } from "@/store/userSlice";
import type { User } from "@/store/userSlice";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    city: "",
  });


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        dispatch(setUsers(data));
        setFilteredUsers(data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, search]);

  
  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const handleOpenAddModal = () => {
    setAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);

    setNewUser({
      name: "",
      email: "",
      phone: "",
      website: "",
      company: "",
      city: "",
    });
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddUser = () => {
    if (!newUser.name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }

    if (!newUser.email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }

    if (!validateEmail(newUser.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    const userToAdd: User = {
      id: Date.now(),
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim() || undefined,
      website: newUser.website.trim() || undefined,
      company: newUser.company.trim() ? { name: newUser.company.trim() } : undefined,
      address: newUser.city.trim() ? { city: newUser.city.trim() } : undefined,
    };
    
    dispatch(addUserAction(userToAdd));
    Alert.alert('Success', 'User added successfully!');
    handleCloseAddModal();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>User Management</Text>

      <PaperTextInput
        mode="outlined"
        label="Search users"
        placeholder="Search by name or email"
        value={search}
        onChangeText={handleSearch}
        left={<PaperTextInput.Icon icon="magnify" />}
        style={styles.searchInput}
      />

      <Button 
        mode="contained" 
        onPress={handleOpenAddModal}
        style={styles.addButton}
        icon="plus"
      >
        Add User
      </Button>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: "/users/[id]",
                params: { id: String(item.id), user: JSON.stringify(item) },
              });
            }}
          >
            <Card.Content>
              <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
              <Text variant="bodyMedium" style={styles.text}>{item.email}</Text>
              {item.company?.name && (
                <Text variant="bodySmall" style={styles.text}>{item.company.name}</Text>
              )}
              {item.address?.city && (
                <Text variant="bodySmall" style={styles.text}>{item.address.city}</Text>
              )}
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={handleCloseAddModal}
          contentContainerStyle={styles.modalContent}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={styles.modalTitle}>Add New User</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCloseAddModal}
                />
              </View>

              <PaperTextInput
                mode="outlined"
                label="Name *"
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                placeholder="Full name"
                style={styles.input}
              />

              <PaperTextInput
                mode="outlined"
                label="Email *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <PaperTextInput
                mode="outlined"
                label="Phone"
                value={newUser.phone}
                onChangeText={(text) => setNewUser({ ...newUser, phone: text })}
                placeholder="Phone number (optional)"
                keyboardType="phone-pad"
                style={styles.input}
              />

              <PaperTextInput
                mode="outlined"
                label="Website"
                value={newUser.website}
                onChangeText={(text) => setNewUser({ ...newUser, website: text })}
                placeholder="Website (optional)"
                autoCapitalize="none"
                style={styles.input}
              />

              <PaperTextInput
                mode="outlined"
                label="Company"
                value={newUser.company}
                onChangeText={(text) => setNewUser({ ...newUser, company: text })}
                placeholder="Company name (optional)"
                style={styles.input}
              />

              <PaperTextInput
                mode="outlined"
                label="City"
                value={newUser.city}
                onChangeText={(text) => setNewUser({ ...newUser, city: text })}
                placeholder="City (optional)"
                style={styles.input}
              />

              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={handleCloseAddModal}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleAddUser}
                  style={styles.modalButton}
                >
                  Add User
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    textAlign: "center",
    marginVertical: 16,
    fontWeight: "bold",
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  name: { 
    marginBottom: 4,
    fontWeight: "600",
  },
  text: { 
    marginTop: 2,
    opacity: 0.7,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
