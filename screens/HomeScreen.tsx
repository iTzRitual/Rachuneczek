import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import Svg from 'react-native-svg';
import AddReceipt from '../assets/addReceipt.svg';
import {request, PERMISSIONS} from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  getText,
  DataInputType,
  OcrEngineMode,
  OCREvent,
  useOCREventListener,
} from 'rn-ocr-lib';
import FastImage from 'react-native-fast-image';
import AddReceiptScreen from './AddReceiptScreen';
import SQLite, {ResultSetRowList} from 'react-native-sqlite-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {width, height} = useWindowDimensions();
  const [selectImage, setSelectImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [imgSrc, setImgSrc] = useState<{uri: string} | null>(null);
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uri, setUri] = useState<string>('');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  useEffect(() => {
    requestCameraPermission();
    fetchLatestReceipts();
  }, [Platform.OS]);

  useFocusEffect(
    React.useCallback(() => {
      fetchLatestReceipts();
    }, [Platform.OS]),
  );

  const fetchLatestReceipts = () => {
    const db = SQLite.openDatabase(
      {name: 'mydatabase.db', createFromLocation: 2},
      () => {},
      error => console.error('Error opening database:', error),
    );
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'DELETE FROM receipts',
    //     [],
    //     (_, results) => {
    //       console.log('Database cleared successfully');
    //       // After clearing the database, you may want to update your component's state or fetch the latest receipts
    //       fetchLatestReceipts();
    //     },
    //     (_, error) => console.error('Error clearing database:', error.message),
    //   );
    // });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM receipts ORDER BY id DESC',
        [],
        (_, results) => {
          const rows = results.rows as ResultSetRowList;
          const receiptsArray = [];
          for (let i = 0; i < rows.length; i++) {
            receiptsArray.push(rows.item(i));
          }
          setReceipts(receiptsArray);
        },
        (_, error) => console.error('Error fetching receipts:', error.message),
      );
    });
  };

  const handleImagePress = (receiptId: any) => {
    setSelectedReceiptId(receiptId);
    setReceiptVisible(true);
  };
  const handleReceiptPress = () => {
    setSelectedReceiptId(null);
    setReceiptVisible(false);
  };
  const handleCloseReceipt = () => {
    setSelectedReceiptId(null);
    setReceiptVisible(false);
  };

  const renderReceipt = (receipt: any) => {
    console.log('Receipt:', receipt);

    return (
      <TouchableOpacity
        key={receipt.id}
        style={styles.tabReceipts}
        onPress={() => handleImagePress(receipt.id)}>
        <View style={styles.placeholder}>
          <FastImage
            source={{uri: receipt.img}}
            style={{width: 50, height: 50}}
          />
        </View>
        <View style={styles.tabContainer}>
          <Text style={styles.receiptEl}>{receipt.name}</Text>
          <Text style={styles.receiptEl}>{receipt.date}</Text>
        </View>
        <Text style={styles.price}>{receipt.currency} PLN</Text>
        <Modal
          visible={receiptVisible && selectedReceiptId === receipt.id}
          transparent={true}
          onRequestClose={handleCloseReceipt}>
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={handleReceiptPress}>
            <Image source={{uri: receipt.img}} style={{...styles.modalImage}} />
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  };

  const requestCameraPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result === 'granted') {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };
  const recognizeTextFromImage = async (): Promise<void> => {
    try {
      console.log('Recognizing text from image');
      console.log('Image path:', uri);
      getText(uri.replace('file://', ''), DataInputType.file, {
        ocrEngineMode: OcrEngineMode.ACCURATE,
        lang: ['pol'],
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  useOCREventListener((event, data) => {
    switch (event) {
      case OCREvent.FINISHED:
        console.log('Finished');
        console.log('Text:', data.text);
        setText(data.text);
        toggleModal();
        // @ts-ignore
        navigation.navigate('AddReceiptScreen', {
          uri: uri,
          text: data.text,
        });
        return;
      case OCREvent.PROGRESS:
        console.log('Progress:', data.percent);
        setProgress(data.percent);
        return;
      case OCREvent.ERROR:
        console.log('Error:', data.error);
        setError(data.error);
        return;
      default:
        return;
    }
  });

  useEffect(() => {
    if (uri) {
      recognizeTextFromImage();
    }
  }, [uri]);

  const handleCameraPicker = async () => {
    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        freeStyleCropEnabled: true,
      });

      if (image) {
        console.log(image);
        setImgSrc({uri: image.path});
        setUri(image.path);
      } else {
        console.log('User cancelled camera picker');
      }
    } catch (error) {
      console.log('Error picking image from camera: ', error);
    }
  };

  const handleImagePicker = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        freeStyleCropEnabled: true,
      });

      if (image) {
        console.log(image);
        setImgSrc({uri: image.path});
        setUri(image.path);
      } else {
        console.log('User cancelled image picker');
      }
    } catch (error) {
      console.log('Error picking image from library: ', error);
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    console.log('Toggling modal');
    setModalVisible(!isModalVisible);
    setProgress(0);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                width: '100%',
                padding: 20,
              }}>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={styles.closeModalText}>x</Text>
              </TouchableOpacity>
            </View>

            {!!progress ? (
              <>
                <Text style={styles.progressTitle}>Analyzing data</Text>
                <Text style={styles.progress}>Progress: {progress} %</Text>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={{width: '100%', padding: 20, paddingTop: 0}}
                  onPress={handleCameraPicker}>
                  <Text style={styles.makePhotoButton}>Make Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 20,
                  }}
                  onPress={handleImagePicker}>
                  <Text style={styles.selectPhotoButton}>
                    Choose from library
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Latest receipts</Text>
        <View style={styles.tablist}>
          {receipts.length > 0 ? (
            <View style={styles.tablist}>
              {receipts.map(receipt => renderReceipt(receipt))}
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No receipts in the database. Add your first receipt using the
              button below
            </Text>
          )}
        </View>
      </ScrollView>
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
  noDataText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  image: {
    backgroundColor: '#eee',
  },
  textContent: {
    margin: 12,
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  errorText: {
    color: 'red',
  },
  scrollContainer: {
    padding: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    padding: 8,
    gap: 8,
  },
  progressTitle: {
    textAlign: 'center',
    width: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingTop: 50,
  },
  progress: {
    textAlign: 'center',
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingBottom: 100,
  },
  button: {
    flex: 1,
  },
  picker: {
    flex: 1,
  },

  modalBox: {
    backgroundColor: '#272727',
    width: '100%',
    height: 'auto',
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    color: '#272727',
    fontSize: 24,
    marginBottom: 20,
  },
  makePhotoButton: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    width: '100%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  selectPhotoButton: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
  modalImage: {
    resizeMode: 'contain',
    width: '90%',
    height: '90%',
  },
});

export default HomeScreen;
