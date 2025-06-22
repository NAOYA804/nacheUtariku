import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

export default function SimpleFirebaseTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState('初期化中...');

  // 初期楽曲データ
  const initialSongs = [
    { id: 1, title: '10月無口な君を忘れる', artist: 'あたらよ', copyCount: 2 },
    { id: 2, title: '366日', artist: 'HY', copyCount: 5 },
    { id: 3, title: '3月9日', artist: 'レミオロメン', copyCount: 8 }
  ];

  // 環境変数を安全に取得する関数
  const getEnvVar = (name) => {
    if (typeof window !== 'undefined') {
      // ブラウザ環境では直接値を使用
      const envVars = {
        'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyBh_pDbdemJiEGBDGAu3JfMn1qsUZBBTeI',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'song-request-app-a590c.firebaseapp.com',
        'NEXT_PUBLIC_FIREBASE_DATABASE_URL': 'https://song-request-app-a590c-default-rtdb.asia-southeast1.firebasedatabase.app/',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'song-request-app-a590c',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'song-request-app-a590c.firebasestorage.app',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '283864238586',
        'NEXT_PUBLIC_FIREBASE_APP_ID': '1:283864238586:web:eec63960138b8ff5ebfc43'
      };
      return envVars[name];
    }
    return undefined;
  };

  // Firebase初期化テスト
  useEffect(() => {
    const testFirebase = async () => {
      try {
        setFirebaseStatus('Firebase初期化中...');
        
        // 環境変数取得
        const config = {
          apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
          authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
          databaseURL: getEnvVar('NEXT_PUBLIC_FIREBASE_DATABASE_URL'),
          projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
          storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
          messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
          appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID')
        };

        console.log('Firebase設定:', config);

        // 設定値チェック
        if (!config.apiKey || !config.databaseURL) {
          throw new Error('Firebase設定が不完全です');
        }

        setFirebaseStatus('Firebaseライブラリ読み込み中...');
        
        // Firebase動的インポート
        const { initializeApp, getApps } = await import('firebase/app');
        const { getDatabase, ref, set, onValue } = await import('firebase/database');

        setFirebaseStatus('Firebaseアプリ初期化中...');

        // アプリ初期化
        let app;
        if (getApps().length === 0) {
          app = initializeApp(config);
        } else {
          app = getApps()[0];
        }

        setFirebaseStatus('データベース接続中...');

        // データベース接続
        const database = getDatabase(app);
        const songsRef = ref(database, 'songs');

        setFirebaseStatus('データ監視開始...');

        // データ監視
        onValue(songsRef, (snapshot) => {
          const data = snapshot.val();
          console.log('Firebaseからのデータ:', data);
          
          if (data && Array.isArray(data)) {
            setSongs(data);
            setFirebaseStatus('Firebase接続成功！');
          } else {
            // 初期データを設定
            setSongs(initialSongs);
            set(songsRef, initialSongs);
            setFirebaseStatus('初期データを設定しました');
          }
          setIsConnected(true);
        });

      } catch (err) {
        console.error('Firebase エラー:', err);
        setError(err.message);
        setFirebaseStatus('Firebase接続失敗');
        
        // ローカルデータを使用
        setSongs(initialSongs);
      }
    };

    testFirebase();
  }, []);

  const handleRequest = (songId) => {
    const updatedSongs = songs.map(song =>
      song.id === songId
        ? { ...song, copyCount: (song.copyCount || 0) + 1 }
        : song
    );
    setSongs(updatedSongs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Firebase接続テスト</h1>
          </div>
          
          {/* 接続状態 */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-lg">{firebaseStatus}</span>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-500/20 rounded text-red-300 text-sm">
                <strong>エラー:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* 環境変数表示 */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-3">Firebase設定チェック</h2>
          <div className="space-y-2 text-sm">
            <div>API Key: {getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>Auth Domain: {getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>Database URL: {getEnvVar('NEXT_PUBLIC_FIREBASE_DATABASE_URL') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>Project ID: {getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>Storage Bucket: {getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>Messaging Sender ID: {getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') ? '✅ 設定済み' : '❌ 未設定'}</div>
            <div>App ID: {getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID') ? '✅ 設定済み' : '❌ 未設定'}</div>
          </div>
        </div>

        {/* 楽曲リスト */}
        <div className="bg-white/5 rounded-lg overflow-hidden">
          <div className="p-4 bg-white/10">
            <h2 className="text-xl font-bold">楽曲リスト ({songs.length}曲)</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {songs.map((song) => (
              <div key={song.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                <div>
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm opacity-70">{song.artist}</div>
                </div>
                <button
                  onClick={() => handleRequest(song.id)}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg font-medium transition-colors"
                >
                  リクエスト ({song.copyCount || 0}回)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="mt-6 bg-white/5 rounded-lg p-4">
          <h3 className="font-bold mb-2">デバッグ情報</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              isConnected,
              songsCount: songs.length,
              hasApiKey: !!getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
              hasDatabaseURL: !!getEnvVar('NEXT_PUBLIC_FIREBASE_DATABASE_URL'),
              error: error || 'なし',
              environment: typeof window !== 'undefined' ? 'ブラウザ' : 'サーバー'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
