import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddReceiptScreen from './screens/AddReceiptScreen';
import SQLite from 'react-native-sqlite-storage';

const Stack = createNativeStackNavigator();

interface ReceiptData {
  name: string;
  date: string;
  currency: number;
  img: string;
}

const App = () => {
  useEffect(() => {
    const db = SQLite.openDatabase(
      {name: 'mydatabase.db', location: 'default'},
      () => console.log('Database opened'),
      error => console.error('Error opening database', error),
    );

    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS receipts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date TEXT, currency REAL, img TEXT)',
        [],
        () => console.log('Table created successfully'),
        error => console.error('Error creating table', error),
      );
    });

    const closeDatabase = () => {
      db.close();
      console.log('Database closed');
    };

    return closeDatabase;
  }, []);
  const saveReceipt = (receiptData: ReceiptData) => {
    SQLite.openDatabase(
      {name: 'mydatabase.db', location: 'default'},
      db => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO receipts (name, date, currency, img) VALUES (?, ?, ?, ?)',
            [
              receiptData.name,
              receiptData.date,
              receiptData.currency,
              receiptData.img,
            ],
            (_, result) => {
              console.log('Receipt saved successfully', result);
            },
            error => {
              console.error('Error saving receipt', error);
            },
          );
        });
      },
      error => console.error('Error opening database', error),
    );
  };
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="AddReceiptScreen" options={{title: 'New Receipt'}}>
          {props => <AddReceiptScreen {...props} saveReceipt={saveReceipt} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
