import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AsyncStorage,
  TextInput,
} from "react-native";
import LottieView from "lottie-react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

import { authentication, verify, createInforme } from "./services/calls";

const LOCATION_TASK_NAME = "background-location-task";
const ITEM_STORAGE = "phoneObjpersist";

const Root = () => {
  const animation = useRef(null);
  const [visibleInput, setVisibleInput] = useState(true);
  const [objetctUser, setObjetctUser] = useState({});
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    animation.current.play();
    async function initialize() {
      const persist = await AsyncStorage.getItem(ITEM_STORAGE);

      if (persist) {
        const phoneObject = JSON.parse(persist);

        setObjetctUser(phoneObject.obj);
        setPhone(phoneObject.phone);
        setToken(phoneObject.token);
        setVisibleInput(false);
      }
    }

    initialize();
  }, []);

  const onPressLocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  };

  const onPressPhone = async () => {
    if (phone === "") return;

    const verifyNumber = await verify(phone);

    const veri = verifyNumber.data;

    if (veri) {
      const dataAuth = { username: `${phone}@gmail.com`, password: phone };

      const user = await authentication(dataAuth);

      if (user.data) {
        const pers = { phone, token: user.data.token, obj: user.data };

        setToken(user.data.token);
        setObjetctUser(user.data);
        await AsyncStorage.setItem(ITEM_STORAGE, JSON.stringify(pers));

        setVisibleInput(false);
      }
    }
  };

  const onPressRemove = async () => {
    const remove = await AsyncStorage.removeItem(ITEM_STORAGE);

    setObjetctUser({});
    setPhone("");
    setToken("");
    setVisibleInput(true);
  };

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      console.log("error task: \n", error);

      return;
    }
    if (data) {
      const { locations } = data;

      async function setInforme() {
        await createInforme(locations, phone, objetctUser, token);
      }
      setInforme();
    }
  });

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        style={{
          flex: 1,
          backgroundColor: "#222",
        }}
        source={require("./assets/location.json")}
      />
      {visibleInput === true ? (
        <>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={onPressPhone}>
            <Text style={styles.text}>Cadastrar numero</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={onPressLocation}>
            <Text style={styles.text}>Ativar localização de segurança</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#f75175" }]}
            onPress={onPressRemove}
          >
            <Text style={styles.text}>Trocar numero</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 20,
  },
  input: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#fff",
    height: 50,
    width: "90%",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#10c86e",
    height: 60,
    width: "90%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Root;
