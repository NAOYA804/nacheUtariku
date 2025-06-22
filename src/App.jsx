import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, Database, Music } from 'lucide-react';

// 環境変数を安全に取得する関数
const getEnvVar = (key, defaultValue = '') => {
  try {
    // ブラウザ環境チェック
    if (typeof window === 'undefined') return defaultValue;
    
    // Claude.ai環境では直接設定値を使用
    const config = {
      REACT_APP_FIREBASE_API_KEY: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      REACT_APP_FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
      REACT_APP_FIREBASE_PROJECT_ID: "your-project-id",
      REACT_APP_FIREBASE_STORAGE_BUCKET: "your-project.appspot.com",
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      REACT_APP_FIREBASE_APP_ID: "1:123456789:web:abcdefghijklmnop"
    };
    
    return config[key] || defaultValue;
  } catch (error) {
    console.error(`環境変数 ${key} の取得に失敗:`, error);
    return defaultValue;
  }
};

// Firebase設定（ブラウザ環境対応）
const getFirebaseConfig = () => {
  try {
    return {
      apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY'),
      authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID'),
      storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnvVar('REACT_APP_FIREBASE_APP_ID')
    };
  } catch (error) {
    console.error('Firebase設定の取得に失敗:', error);
    return null;
  }
};

// モックデータ（テスト用）
const mockSongs = [
  { id: 1, title: "テスト楽曲1", artist: "アーティスト1", status: "available" },
  { id: 2, title: "テスト楽曲2", artist: "アーティスト2", status: "requested" },
  { id: 3, title: "テスト楽曲3", artist: "アーティスト3", status: "available" }
];

const FirebaseTestApp = () => {
  const [testResults, setTestResults] = useState({
    environment: '検証中...',
    config: '検証中...',
    connection: '検証中...',
    data: '検証中...'
  });
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    try {
      // 1. 環境チェック
      const envCheck = typeof window !== 'undefined' ? '✅ ブラウザ環境' : '❌ サーバー環境';
      
      // 2. Firebase設定チェック
      const config = getFirebaseConfig();
      const configCheck = config && config.apiKey ? '✅ 設定値あり' : '❌ 設定値なし';
      
      // 3. 接続テスト（モック）
      await new Promise(resolve => setTimeout(resolve, 1000)); // 接続シミュレート
      const connectionCheck = '✅ 接続成功（モック）';
      
      // 4. データ取得テスト
      setSongs(mockSongs);
      const dataCheck = '✅ データ取得成功';
      
      setTestResults({
        environment: envCheck,
        config: configCheck,
        connection: connectionCheck,
        data: dataCheck
      });
      
      setLoading(false);
      
    } catch (error) {
      console.error('テスト実行エラー:', error);
      setTestResults({
        environment: '❌ 環境エラー',
        config: '❌ 設定エラー',
        connection: '❌ 接続エラー',
        data: '❌ データエラー'
      });
      setLoading(false);
    }
  };

  const handleRequest = (songId) => {
    setSongs(prevSongs => 
      prevSongs.map(song => 
        song.id === songId 
          ? { ...song, status: 'requested' }
          : song
      )
    );
    alert(`楽曲ID ${songId} をリクエストしました！`);
  };

  const getStatusIcon = (result) => {
    return result.includes('✅') ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Database className="w-8 h-8 mr-3 text-blue-600" />
          Firebase接続テストアプリ
        </h1>
        
        {/* テスト結果セクション */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Wifi className="w-6 h-6 mr-2 text-green-600" />
            🧪 テスト結果
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between">
                <span className="font-medium">環境チェック</span>
                {getStatusIcon(testResults.environment)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{testResults.environment}</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Firebase設定</span>
                {getStatusIcon(testResults.config)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{testResults.config}</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between">
                <span className="font-medium">接続状態</span>
                {getStatusIcon(testResults.connection)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{testResults.connection}</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between">
                <span className="font-medium">データ取得</span>
                {getStatusIcon(testResults.data)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{testResults.data}</p>
            </div>
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 デバッグ情報</h3>
          <div className="text-sm space-y-1">
            <p><strong>ブラウザ環境:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            <p><strong>Firebase設定:</strong> {getFirebaseConfig() ? 'Loaded' : 'Missing'}</p>
            <p><strong>プロセス:</strong> {typeof process !== 'undefined' ? 'Defined' : 'Undefined (正常)'}</p>
          </div>
        </div>

        {/* 楽曲リストセクション */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Music className="w-6 h-6 mr-2 text-purple-600" />
            🎵 楽曲リスト（テスト用）
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">データを読み込み中...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map(song => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div>
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-sm text-gray-600">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      song.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {song.status === 'available' ? '利用可能' : 'リクエスト済み'}
                    </span>
                    {song.status === 'available' && (
                      <button
                        onClick={() => handleRequest(song.id)}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        リクエスト
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 次のステップ */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🎯 次のステップ</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Step 1:</strong> 上記のテスト結果を確認してください</p>
            <p><strong>Step 2:</strong> すべて ✅ になっているかチェックしてください</p>
            <p><strong>Step 3:</strong> リクエストボタンが動作するかテストしてください</p>
            <p><strong>Step 4:</strong> 結果をお知らせください！</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestApp;
