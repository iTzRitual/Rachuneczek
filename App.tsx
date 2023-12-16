import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import Svg from 'react-native-svg';
import AddReceipt from './assets/addReceipt.svg';

const App = () => {
  const renderReceipt = (index: number) => (
    <View key={index} style={styles.tabReceipts}>
      <View style={styles.placeholder}></View>
      <View style={styles.tabContainer}>
        <Text style={styles.receiptEl}>ROSSMAN</Text>
        <Text style={styles.receiptEl}>24.11.2000</Text>
      </View>
      <Text style={styles.price}>32,31 PLN</Text>
    </View>
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  return (
    <View style={styles.container}>
      {/* Treść strony */}
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.tab}>
          <Text style={styles.tabtext}>All receipts</Text>
          <Text style={styles.tabtext}>&gt;</Text>
        </View>
        <Text style={styles.subtitle}>Latest receipts</Text>
        <View style={styles.tablist}>
          {[...Array(7)].map((_, index) => renderReceipt(index))}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          // Zamknięcie modala, gdy użytkownik naciśnie "back" na Androidzie
          setModalVisible(!isModalVisible);
        }}>
        <View style={styles.modalContainer}>
          {/* Tutaj umieść zawartość modala */}
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Add Receipt</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeModalText}>Make Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeModalText}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeModalText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Komponent na dole ekranu */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity style={styles.fixedButton}>
          <Text style={styles.buttonText} onPress={toggleModal}>
            <AddReceipt width={20} height={20} />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: '#FFFFFF',
    width: 300,
    height: 300,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    color: '#272727',
    fontSize: 24,
    marginBottom: 20,
  },
  closeModalText: {
    color: '#272727',
    fontSize: 18,
  },
  receiptEl: {
    color: '#FFFFFF',
    paddingLeft: 10,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  placeholder: {
    width: 50,
    height: 50,
    backgroundColor: '#BFBFBF',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#272727',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 0,
    marginTop: 30,
    textTransform: 'uppercase',
    fontWeight: '300',
  },
  tab: {
    color: '#FFFFFF',
    backgroundColor: '#2F2F2F',
    fontSize: 16,
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabReceipts: {
    color: '#FFFFFF',
    backgroundColor: '#2F2F2F',
    fontSize: 16,
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tablist: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    display: 'flex',
    gap: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 100,
  },
  tabtext: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fixedButton: {
    backgroundColor: '#FFFFFF',
    width: 100,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#272727',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default App;
