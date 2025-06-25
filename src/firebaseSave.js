// firebaseSave.js
import { collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase'; // ←すでにあるfirebase.jsを読み込む

// データをFirestoreに保存する関数
export const saveToFirebase = async (path, dataArray) => {
  try {
    const colRef = collection(db, path);

    // すでにあるデータを全部消す
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));

    // 新しいデータを追加する
    await Promise.all(dataArray.map(item => addDoc(colRef, item)));

    return { success: true };
  } catch (error) {
    console.error('Firestore保存エラー:', error);
    return { success: false, error };
  }
};
