import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAg3zhs9e1EduP_d3zxT5wYCZUUHp-Askc",
    authDomain: "carpool-imagestorage.firebaseapp.com",
    projectId: "carpool-imagestorage",
    storageBucket: "carpool-imagestorage.firebasestorage.app", // 올바른 설정
    messagingSenderId: "848230673093",
    appId: "1:848230673093:web:fd43a28df7fb7895c29eac"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
