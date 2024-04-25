import React, {useState, useEffect} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, Polyline, LatLng} from 'react-native-maps';
import {Svg, Circle, SvgXml} from 'react-native-svg';
import {AddLocation} from './src/Icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Coordinate {
  latitude: number;
  longitude: number;
}

const DefaultMarkers = () => {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(
    null,
  );
  const [selectedMark, setSelectedMark] = useState<Coordinate | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [addLocation, setAddLocation] = useState<Coordinate[]>([]);
  const [state, setState] = useState({
    region: {
      latitude: 1.409178,
      longitude: 125.138794,
      latitudeDelta: 8,
      longitudeDelta: 8,
    },
    koordinat1: [
      {
        latitude: 0.8997422251238258,
        longitude: 125.31373107083564,
      },
    ],
    koordinat: [
      {
        latitude: 1.123889,
        longitude: 125.551389,
      },
      {
        latitude: 1.423889,
        longitude: 125.801389,
      },
      {
        latitude: 1.823889,
        longitude: 125.801389,
      },
      {
        latitude: 2.423889,
        longitude: 125.801389,
      },
      {
        latitude: 2.2303333,
        longitude: 125.1898611,
      },
      {
        latitude: 2.6681944,
        longitude: 125.0237222,
      },
      {
        latitude: 1.7745278,
        longitude: 124.7281111,
      },
      {
        latitude: 2.8928611,
        longitude: 124.9631389,
      }
    ],
    arah: null,
  });

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
        });
      },
      error => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('Izin untuk mengakses lokasi ditolak.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Informasi lokasi tidak tersedia.');
            break;
          case error.TIMEOUT:
            console.log('Waktu permintaan lokasi habis.');
            break;
          default:
            console.log('Terjadi kesalahan tidak diketahui:', error.message);
        }
      },
    );
  };

  const handlePressMark = () => {
    try {
      const calculatedDistance = calculateDistance(
        currentLocation?.latitude,
        currentLocation?.longitude,
        selectedMark?.latitude,
        selectedMark?.longitude,
      );
      setDistance(calculatedDistance);
    } catch (error) {
      console.log('error pressmark', error);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
  };

  const handleAddLocation = (e: any) => {
    e.persist();
    Alert.alert('Apakah anda ingin menambahkan lokasi ini?', undefined, [
      {
        text: 'OK',
        onPress: () => {
          const newLocation = {
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
          };

          setAddLocation(prevLocations => [...prevLocations, newLocation]);
          // console.log(e);
          setIsAddMode(false);
        },
      },
      {
        text: 'Batal',
        onPress: () => setIsAddMode(false),
        style: 'cancel',
      },
    ]);
  };

  const handleRemoveMark = () => {
    const isRedMark = state.koordinat.some(
      coordinate =>
        coordinate.latitude === selectedMark?.latitude &&
        coordinate.longitude === selectedMark.longitude,
    );

    if(isRedMark){
      Alert.alert(
        'Gagal',
        'Anda hanya dapat menghapus titik yang anda tambahkan sendiri',
      );
    }else{
      Alert.alert('Apakah anda ingin menghapus lokasi ini?', undefined, [
        {
          text: 'OK',
          onPress: () => {
              setAddLocation(prevLocations =>
                prevLocations.filter(
                  location =>
                    location.latitude !== selectedMark?.latitude ||
                    location.longitude !== selectedMark.longitude,
                ),
              );
              // console.log(addLocation);
              setIsRemoveMode(false);
              setSelectedMark(null);
          },
        },
        {
          text: 'Batal',
          onPress: () => setIsRemoveMode(false),
          style: 'cancel',
        },
      ]);
    }
    
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('addLocation');
        if (jsonValue !== null) {
          setAddLocation(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    getLocation();
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('addLocation', JSON.stringify(addLocation));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [addLocation]);

  useEffect(() => {
    if (isRemoveMode) {
      handleRemoveMark();
    } else {
      handlePressMark();
    }
  }, [selectedMark]);

  return (
    <View style={styles.container}>
      <MapView
        style={[
          styles.map,
          {opacity: isAddMode ? 0.7 : isRemoveMode ? 0.7 : 1},
        ]}
        initialRegion={state.region}
        showsUserLocation
        loadingEnabled
        onPress={isAddMode ? handleAddLocation : undefined}>
        {state.koordinat.map((titik, index) => (
          <Marker
            key={index}
            coordinate={titik}
            onPress={() => setSelectedMark(titik)}
          />
        ))}
        {/* {currentLocation && (
          <Marker coordinate={currentLocation}>
            <Svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              opacity={0.9}
              stroke="#000000"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Circle cx="12" cy="12" r="8" fill="#188ef7" />
            </Svg>
          </Marker>
        )} */}
        {selectedMark && currentLocation ? (
          <Polyline
            key="editingPolyline"
            coordinates={[currentLocation as LatLng, selectedMark]}
            strokeColor="rgba(51,122,328,0.8)"
            fillColor="rgba(51,122,328,0.5)"
            strokeWidth={4}
          />
        ) : null}
        {addLocation &&
          addLocation.map((titik, index) => (
            <Marker
              key={index}
              coordinate={titik}
              pinColor="#15F5BA"
              onPress={() => setSelectedMark(titik)}
            />
          ))}
      </MapView>
      {selectedMark && (
        <Text style={styles.txtDistance}>
          Distance: {distance?.toFixed(2)} km
        </Text>
      )}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.icon}
          disabled={isRemoveMode}
          onPress={() => setIsAddMode(true)}>
          <SvgXml
            xml={`
              <svg fill="#15F5BA" viewBox="-1.06 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M-16.277,6.882A3.281,3.281,0,0,0-13,10.159,3.281,3.281,0,0,0-9.723,6.882,3.281,3.281,0,0,0-13,3.6,3.281,3.281,0,0,0-16.277,6.882Zm5.554,0A2.28,2.28,0,0,1-13,9.159a2.28,2.28,0,0,1-2.277-2.277A2.28,2.28,0,0,1-13,4.6,2.28,2.28,0,0,1-10.723,6.882ZM-6,13.5a.5.5,0,0,1-.5.5H-8v1.5a.5.5,0,0,1-.5.5.5.5,0,0,1-.5-.5V14h-1.5a.5.5,0,0,1-.5-.5.5.5,0,0,1,.5-.5H-9V11.5a.5.5,0,0,1,.5-.5.5.5,0,0,1,.5.5V13h1.5A.5.5,0,0,1-6,13.5Zm-5.952,1.359a.5.5,0,0,1,0,.707A1.48,1.48,0,0,1-13,16a1.48,1.48,0,0,1-1.048-.433l-3.818-3.818a6.888,6.888,0,0,1,0-9.732A6.837,6.837,0,0,1-13,0,6.837,6.837,0,0,1-8.134,2.016,6.9,6.9,0,0,1-6.35,8.626a.5.5,0,0,1-.61.358.5.5,0,0,1-.356-.61A5.906,5.906,0,0,0-8.841,2.723,5.843,5.843,0,0,0-13,1a5.843,5.843,0,0,0-4.159,1.723,5.837,5.837,0,0,0-1.723,4.158,5.84,5.84,0,0,0,1.723,4.16l3.818,3.818a.483.483,0,0,0,.682,0A.5.5,0,0,1-11.952,14.859Z" transform="translate(19.879)"/>
              </svg>
            `}
            width={30}
            height={30}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.icon}
          disabled={isAddMode}
          onPress={() => setIsRemoveMode(true)}>
          <SvgXml
            xml={`<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 469 512.42"><path fill-rule="nonzero" d="M197.53 485.87c7.56-4.8 14.91-9.92 22.02-15.28a149.47 149.47 0 0 0 13.51 18.57c-9.26 6.93-18.87 13.49-28.85 19.57-3.7 2.74-8.88 3.08-13 .48-44.87-28.52-82.58-62.92-112.28-100.19C38.05 357.7 12.26 300.79 3.44 246.01c-8.96-55.55-.56-109.03 27.07-152.51C41.4 76.35 55.34 60.72 72.37 47.15 111.36 16.08 156-.37 200.29.01c42.69.35 84.97 16.28 121.48 49.6 12.8 11.7 23.59 24.97 32.37 39.46 26.56 43.85 34.52 98.6 26.54 154.99-7.4-1.63-14.96-2.72-22.72-3.23 7.27-51.33.26-100.76-23.43-139.87-7.6-12.52-17-24.08-28.24-34.34-32.14-29.32-69.08-43.36-106.2-43.65-38.97-.32-78.53 14.37-113.42 42.18C71.78 77 59.56 90.73 49.97 105.83c-24.52 38.59-31.92 86.5-23.85 136.6 8.19 50.88 32.39 104.07 70.81 152.29 26.78 33.59 60.51 64.79 100.6 91.15zm182.68-139.18 12.48 12.49c2.94 2.93 2.94 7.83 0 10.77l-21.42 21.42 21.44 21.47c2.92 2.93 2.92 7.83 0 10.77l-12.5 12.48c-2.93 2.94-7.8 2.98-10.77 0L348 414.65l-21.47 21.46c-2.91 2.94-7.8 2.96-10.77 0l-12.48-12.48c-2.96-2.98-2.96-7.82 0-10.77l21.46-21.47-21.44-21.44c-2.98-2.97-2.98-7.82 0-10.77l12.48-12.51c2.97-2.95 7.84-2.91 10.77 0l21.47 21.45 21.42-21.43c2.95-2.97 7.86-2.91 10.77 0zM348 270.39c33.39 0 63.66 13.55 85.55 35.44l.61.65c21.53 21.84 34.84 51.85 34.84 84.91 0 33.4-13.55 63.68-35.45 85.58l-.65.61c-21.83 21.52-51.84 34.84-84.9 34.84-33.4 0-63.65-13.57-85.54-35.45-21.94-21.9-35.49-52.18-35.49-85.58 0-33.37 13.57-63.62 35.45-85.52 21.89-21.93 52.18-35.48 85.58-35.48zm69.05 51.95c-17.66-17.67-42.1-28.6-69.05-28.6-26.96 0-51.42 10.93-69.08 28.6-17.65 17.64-28.59 42.1-28.59 69.05 0 26.96 10.92 51.42 28.59 69.08 17.64 17.64 42.1 28.59 69.08 28.59 26.7 0 50.94-10.73 68.56-28.06l.49-.53c17.67-17.66 28.6-42.12 28.6-69.08 0-26.7-10.74-50.94-28.07-68.56l-.53-.49zM191.82 93.36c27.85 0 53.07 11.31 71.31 29.54 18.23 18.23 29.53 43.46 29.53 71.3 0 27.85-11.3 53.07-29.53 71.31-1.6 1.59-3.25 3.13-4.97 4.62-2.58 1.93-5.1 3.94-7.54 6.01-16.54 11.89-36.86 18.9-58.8 18.9-27.84 0-53.07-11.3-71.3-29.53-18.23-18.24-29.54-43.46-29.54-71.31 0-27.84 11.31-53.07 29.54-71.3 18.23-18.23 43.46-29.54 71.3-29.54zm55.04 45.81c-14.06-14.06-33.55-22.81-55.04-22.81-21.48 0-40.97 8.75-55.03 22.81-14.06 14.06-22.81 33.55-22.81 55.03 0 21.49 8.75 40.98 22.81 55.04 14.06 14.06 33.55 22.8 55.03 22.8 21.49 0 40.98-8.74 55.04-22.8 14.06-14.06 22.8-33.55 22.8-55.04 0-21.48-8.74-40.97-22.8-55.03z"/></svg>`}
            width={30}
            height={30}
            fill={'#eb493b'}
          />
        </TouchableOpacity>
      </View>
      {isAddMode && <Text style={styles.txtNote}>Pilih lokasi baru anda</Text>}
      {isRemoveMode && (
        <Text style={styles.txtNote}>Pilih titik yang akan dihapus</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  txtDistance: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#3C5B6F',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: '10%',
    gap: 20,
  },
  icon: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  txtNote: {
    position: 'absolute',
    fontSize: 28,
    color: 'white',
    alignSelf: 'center',
    bottom: 50,
    paddingHorizontal: 5,
    borderRadius: 10,
    opacity: 0.9,
    backgroundColor: '#3C5B6F',
  },
});

export default DefaultMarkers;
