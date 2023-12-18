import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';
import {useNavigation} from '@react-navigation/native';

const {width: viewportWidth} = Dimensions.get('window');
const db = SQLite.openDatabase({name: 'mydatabase.db', createFromLocation: 2});

interface ReceiptData {
  name: string;
  date: string;
  currency: number;
  img: string;
}

interface AddReceiptScreenProps {
  saveReceipt: (receiptData: ReceiptData) => void;
}

const AddReceiptScreen: React.FC<AddReceiptScreenProps> = ({saveReceipt}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const [shopName, setShopName] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState<number>(0);
  const [currencyText, setCurrencyText] = useState('');
  const [img, setImg] = useState('');

  const navigation = useNavigation();

  const handleImagePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleModalPress = () => {
    setModalVisible(false);
  };

  const imageWidth = 0.5 * viewportWidth;
  const route = useRoute();
  const {uri, text} = route.params as {uri: string; text: string};

  const parseReceipt = (receipt: string) => {
    const shopNameRegex = /\* (.*?) \*/;
    const dateRegex = /(\d{4}—\d{2}—\d{2})/;
    const currencyRegex = /SUMA PLN (\d+,\d+)/;

    const shopNameMatch = receipt.match(shopNameRegex);
    const dateMatch = receipt.match(dateRegex);
    const currencyMatch = receipt.match(currencyRegex);

    const parsedShopName = shopNameMatch ? shopNameMatch[1] : '';
    const parsedDate = dateMatch ? dateMatch[1] : '';
    const parsedCurrency = currencyMatch ? currencyMatch[1] : '0';

    setShopName(parsedShopName);
    setDate(parsedDate);
    setCurrencyText(parsedCurrency);
    setImg(uri);
  };

  useEffect(() => {
    parseReceipt(text);
  }, []);

  const handleSave = async () => {
    const receiptData: ReceiptData = {
      name: shopName,
      date: date,
      currency: parseFloat(currencyText.replace(',', '.')),
      img: img,
    };

    saveReceipt(receiptData);

    navigation.goBack();
  };

  const handleCurrencyChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9.,]/g, '');
    setCurrencyText(cleanedText);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: 20,
          paddingBottom: 20,
        }}
        onPress={handleImagePress}>
        <Image
          source={{uri: uri}}
          style={{width: imageWidth, height: imageWidth, ...styles.image}}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={handleModalPress}>
          <Image source={{uri: uri}} style={{...styles.modalImage}} />
        </TouchableOpacity>
      </Modal>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={shopName}
        onChangeText={text => setShopName(text)}
      />

      <Text style={styles.label}>Date:</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={text => setDate(text)}
      />

      <Text style={styles.label}>Total:</Text>
      <TextInput
        style={styles.input}
        value={currencyText}
        onChangeText={handleCurrencyChange}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          borderRadius: 5,
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          marginTop: 20,
        }}
        onPress={handleSave}>
        <Text>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    padding: 20,
  },
  image: {
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#2F2F2F',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalImage: {
    resizeMode: 'contain',
    width: '90%',
    height: '90%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'grey',
  },
  input: {
    height: 40,
    backgroundColor: '#2F2F2F',
    color: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default AddReceiptScreen;
