import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Sun, Moon, Database, Wifi, WifiOff } from 'lucide-react';

// Firebase Firestore のインポート（実際の運用時に使用）
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Firebase設定（実際のプロジェクト設定に置き換えてください）
const firebaseConfig = {
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "your-app-id"
};

// Firebase初期化（実際の運用時に使用）
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

export default function SimpleRequestApp() {
  // 状態管理（重複なし）
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [showPublishMessage, setShowPublishMessage] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // データの初期値
  const initialSongs = [
    { id: 1, title: '10月無口な君を忘れる', artist: 'あたらよ', reading: 'じゅうがつむくちなきみをわすれる', genre: 'J-POP', tags: ['バラード'], memo: '', copyCount: 2 },
    { id: 2, title: '366日', artist: 'HY', reading: 'さんびゃくろくじゅうろくにち', genre: 'J-POP', tags: ['沖縄'], memo: '', copyCount: 5 },
    { id: 3, title: '3月9日', artist: 'レミオロメン', reading: 'さんがつここのか', genre: 'J-POP', tags: ['卒業'], memo: '', copyCount: 8 },
    { id: 4, title: '夜に駆ける', artist: 'YOASOBI', reading: 'よるにかける', genre: 'J-POP', tags: ['ボカロ系'], memo: '人気曲', copyCount: 15 },
    { id: 5, title: '紅蓮華', artist: 'LiSA', reading: 'ぐれんげ', genre: 'アニソン', tags: ['アニソン'], memo: '鬼滅の刃主題歌', copyCount: 12 }
  ];

  // Firebase Firestore操作関数（実際のFirebase実装）
  const saveToFirebase = async (path, data) => {
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = doc(db, 'app-data', path);
      await setDoc(docRef, { data: data, updatedAt: new Date() });
      console.log(`Data saved to Firestore: ${path}`, data);
      */
      
      // 開発環境用のモック実装
      if (!window.firebaseData) {
        window.firebaseData = {};
      }
      window.firebaseData[path] = data;
      
      // 実際のFirebase環境では以下のようなログが出力されます
      console.log(`[Firebase] Document written to ${path}:`, data);
      return { success: true };
    } catch (error) {
      console.error('Firebase save error:', error);
      return { success: false, error };
    }
  };

  const loadFromFirebase = async (path, defaultValue) => {
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = doc(db, 'app-data', path);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data().data;
        console.log(`Data loaded from Firestore: ${path}`, data);
        return data;
      } else {
        console.log(`No document found for ${path}, using default`);
        return defaultValue;
      }
      */
      
      // 開発環境用のモック実装
      if (window.firebaseData && window.firebaseData[path]) {
        console.log(`[Firebase] Document read from ${path}:`, window.firebaseData[path]);
        return window.firebaseData[path];
      }
      
      console.log(`[Firebase] No document found for ${path}, using default:`, defaultValue);
      return defaultValue;
    } catch (error) {
      console.error('Firebase load error:', error);
      return defaultValue;
    }
  };

  const addSongToFirestore = async (songData) => {
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = await addDoc(collection(db, 'songs'), {
        ...songData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Song added to Firestore with ID: ', docRef.id);
      return docRef.id;
      */
      
      // 開発環境用のモック実装
      const id = Date.now().toString();
      console.log(`[Firebase] Song added to collection with ID: ${id}`, songData);
      return id;
    } catch (error) {
      console.error('Error adding song to Firestore:', error);
      throw error;
    }
  };

  const updateSongInFirestore = async (songId, songData) => {
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = doc(db, 'songs', songId);
      await updateDoc(docRef, {
        ...songData,
        updatedAt: new Date()
      });
      console.log('Song updated in Firestore:', songId);
      */
      
      // 開発環境用のモック実装
      console.log(`[Firebase] Song updated in collection: ${songId}`, songData);
    } catch (error) {
      console.error('Error updating song in Firestore:', error);
      throw error;
    }
  };

  const deleteSongFromFirestore = async (songId) => {
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = doc(db, 'songs', songId);
      await deleteDoc(docRef);
      console.log('Song deleted from Firestore:', songId);
      */
      
      // 開発環境用のモック実装
      console.log(`[Firebase] Song deleted from collection: ${songId}`);
    } catch (error) {
      console.error('Error deleting song from Firestore:', error);
      throw error;
    }
  };

  // 楽曲データ状態
  const [songs, setSongs] = useState(initialSongs);
  const [publishedSongs, setPublishedSongs] = useState(initialSongs);
  const [adminMessage, setAdminMessage] = useState('配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSong, setCopiedSong] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showMessageEditModal, setShowMessageEditModal] = useState(false);
  const [tempAdminMessage, setTempAdminMessage] = useState('');
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    reading: '',
    genre: '',
    tags: [],
    memo: ''
  });
  const [availableGenres] = useState(['J-POP', 'アニソン', 'ロック', 'バラード', '演歌', 'クラシック']);

  // テーマ設定
  const currentTheme = isDarkMode ? {
    background: 'bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900',
    card: 'bg-white/10 backdrop-blur-md border-white/20',
    cardHover: 'hover:bg-white/5',
    cardEven: 'bg-white/5',
    text: 'text-white',
    textSecondary: 'text-white/80',
    textTertiary: 'text-white/70',
    icon: 'text-purple-300',
    inputBg: 'bg-white/10 border-white/20',
    inputText: 'text-white placeholder-gray-500',
    inputFocus: 'focus:ring-purple-500'
  } : {
    background: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
    card: 'bg-white/80 backdrop-blur-md border-gray-200',
    cardHover: 'hover:bg-gray-50',
    cardEven: 'bg-gray-50/50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textTertiary: 'text-gray-600',
    icon: 'text-purple-600',
    inputBg: 'bg-white border-gray-300',
    inputText: 'text-gray-900 placeholder-gray-400',
    inputFocus: 'focus:ring-purple-500'
  };

  // データをFirebaseに保存するヘルパー関数（強化版）
  const saveSongsToFirebase = async (songsData) => {
    try {
      await saveToFirebase('songs', songsData);
      setSongs(songsData);
      console.log('Songs saved and state updated:', songsData);
    } catch (error) {
      console.error('Error saving songs:', error);
    }
  };

  const savePublishedSongsToFirebase = async (publishedData) => {
    try {
      await saveToFirebase('publishedSongs', publishedData);
      setPublishedSongs(publishedData);
      console.log('Published songs saved and state updated:', publishedData);
    } catch (error) {
      console.error('Error saving published songs:', error);
    }
  };

  const saveAdminMessageToFirebase = async (message) => {
    try {
      await saveToFirebase('adminMessage', message);
      setAdminMessage(message);
      console.log('Admin message saved:', message);
    } catch (error) {
      console.error('Error saving admin message:', error);
    }
  };

  const saveDarkModeToFirebase = async (darkMode) => {
    try {
      await saveToFirebase('isDarkMode', darkMode);
      setIsDarkMode(darkMode);
      console.log('Dark mode saved:', darkMode);
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
  };

  // 初期化（実際のFirestore接続）
  useEffect(() => {
    const init = async () => {
      setLoadingFirebase(true);
      
      try {
        // 実際のFirestore実装（運用時に有効化）
        /*
        // Firestoreからすべてのデータを読み込み
        const [songsSnapshot, publishedSnapshot] = await Promise.all([
          getDocs(collection(db, 'songs')),
          getDocs(collection(db, 'published-songs'))
        ]);
        
        const loadedSongs = songsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const loadedPublished = publishedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSongs(loadedSongs.length > 0 ? loadedSongs : initialSongs);
        setPublishedSongs(loadedPublished.length > 0 ? loadedPublished : initialSongs);
        */
        
        // 開発環境用の実装
        const [loadedSongs, loadedPublished, loadedMessage, loadedDarkMode] = await Promise.all([
          loadFromFirebase('songs', initialSongs),
          loadFromFirebase('publishedSongs', initialSongs),
          loadFromFirebase('adminMessage', '配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪'),
          loadFromFirebase('isDarkMode', true)
        ]);

        setSongs(loadedSongs);
        setPublishedSongs(loadedPublished);
        setAdminMessage(loadedMessage);
        setIsDarkMode(loadedDarkMode);

        setFirebaseConnected(true);
        setDatabaseConnected(true);
        setLastSyncTime(new Date());
        
        console.log('[Firebase] Initialization completed successfully');
      } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        setFirebaseConnected(false);
        setDatabaseConnected(false);
        
        // エラーの場合は初期データを使用
        setSongs(initialSongs);
        setPublishedSongs(initialSongs);
      }
      
      setLoadingFirebase(false);
    };
    
    init();
  }, []);

  // 計算プロパティ
  const displayedSongs = isAdmin ? songs : publishedSongs;
  const topSongs = displayedSongs.filter(song => song.copyCount > 0).sort((a, b) => b.copyCount - a.copyCount).slice(0, 3);
  
  const filteredSongs = displayedSongs.filter(song => {
    const matchesSearch = searchTerm === '' || 
           song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
           song.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (song.reading && song.reading.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (song.tags && song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
           (song.memo && song.memo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // イベントハンドラー
  const copyToClipboard = async (song) => {
    const requestText = `♪ ${song.title} - ${song.artist}`;
    try {
      await navigator.clipboard.writeText(requestText);
      setCopiedSong(song.id);
      
      if (isAdmin) {
        const updatedSongs = songs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s);
        await saveSongsToFirebase(updatedSongs);
      } else {
        const updatedPublished = publishedSongs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s);
        await savePublishedSongsToFirebase(updatedPublished);
      }
      
      setTimeout(() => setCopiedSong(null), 2000);
    } catch (err) {
      setCopiedSong(song.id);
      setTimeout(() => setCopiedSong(null), 2000);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('パスワードが正しくありません');
      setPassword('');
    }
  };

  const deleteSong = async (songToDelete) => {
    const updatedSongs = songs.filter(song => song.id !== songToDelete.id);
    await saveSongsToFirebase(updatedSongs);
    setDeleteConfirm(null);
  };

  const addSong = async () => {
    if (!newSong.title || !newSong.artist) return;
    
    try {
      // 実際のFirestore実装（運用時に有効化）
      /*
      const docRef = await addDoc(collection(db, 'songs'), {
        title: newSong.title,
        artist: newSong.artist,
        genre: newSong.genre,
        tags: newSong.tags || [],
        memo: newSong.memo || '',
        copyCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newSongWithId = {
        id: docRef.id,
        ...newSong,
        copyCount: 0,
        tags: newSong.tags || []
      };
      
      setSongs(prevSongs => [...prevSongs, newSongWithId]);
      console.log('[Firestore] Song added with ID:', docRef.id);
      */
      
      // 開発環境用の実装
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = { 
        ...newSong, 
        id, 
        copyCount: 0, 
        tags: newSong.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedSongs = [...songs, songToAdd];
      await saveSongsToFirebase(updatedSongs);
      
      setNewSong({ title: '', artist: '', reading: '', genre: '', tags: [], memo: '' });
      setShowAddModal(false);
      console.log('[Firebase] Song added successfully:', songToAdd);
    } catch (error) {
      console.error('[Firebase] Error adding song:', error);
    }
  };

  const publishSongs = async () => {
    await savePublishedSongsToFirebase([...songs]);
    setLastSyncTime(new Date());
    setShowPublishMessage(true);
    setTimeout(() => setShowPublishMessage(false), 3000);
  };

  if (loadingFirebase) {
    return (
      <div className={`min-h-screen ${currentTheme.background} flex items-center justify-center`}>
        <div className={`${currentTheme.text} text-center`}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg">システム初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="container mx-auto px-3 py-3 max-w-7xl">

        <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className={`w-5 h-5 ${currentTheme.icon}`} />
              <div>
                <h1 className={`text-lg font-bold ${currentTheme.text}`}>リクエスト楽曲一覧</h1>
                {isAdmin && <span className={`text-sm ${currentTheme.textTertiary}`}>管理者モード</span>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  saveDarkModeToFirebase(!isDarkMode);
                }}
                className={`p-2 ${isDarkMode ? 'bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300' : 'bg-gray-500/30 hover:bg-gray-500/50 text-gray-600'} rounded transition-colors`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <span className={`${currentTheme.textTertiary} text-sm`}>ゲスト</span>
              <button
                onClick={handleAdminToggle}
                className={`relative w-8 h-4 rounded-full transition-colors ${isAdmin ? 'bg-purple-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isAdmin ? 'transform translate-x-4' : 'transform translate-x-0.5'}`} />
              </button>
              <span className={`${currentTheme.textTertiary} text-sm`}>管理者</span>
            </div>
          </div>
        </div>

        <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
          <div className="flex items-start space-x-2">
            <MessageSquare className={`w-4 h-4 ${currentTheme.icon} mt-0.5`} />
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${currentTheme.text} mb-1`}>配信者からのメッセージ</h3>
              <p className={`${currentTheme.textSecondary} text-sm`}>{adminMessage}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setTempAdminMessage(adminMessage);
                  setShowMessageEditModal(true);
                }}
                className="p-1 bg-blue-500/30 hover:bg-blue-500/50 rounded text-blue-300 transition-colors"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'} rounded-lg p-3 mb-3 border`}>
            <div className="flex items-center space-x-2 mb-2">
              <Copy className={`w-4 h-4 ${currentTheme.icon}`} />
              <p className={`${currentTheme.textSecondary} text-xs`}>
                楽曲の「リクエスト」ボタンを押すとクリップボードにコピーされます！
              </p>
            </div>
            {topSongs.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
                <p className={`${currentTheme.text} text-xs font-bold mb-1`}>🏆 人気楽曲 TOP3</p>
                <div className="space-y-1">
                  {topSongs.map((song, index) => (
                    <div key={song.id} className={`${currentTheme.textSecondary} text-xs flex items-center justify-between`}>
                      <span>{index + 1}. {song.title} - {song.artist}</span>
                      <span className={`${currentTheme.icon} text-xs`}>{song.copyCount}回</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
            <div className="flex items-center justify-between">
              <h3 className={`${currentTheme.text} font-bold text-sm`}>楽曲管理</h3>
              <div className="flex space-x-2">
                <button
                  onClick={publishSongs}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium"
                >
                  公開
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                >
                  楽曲追加
                </button>
              </div>
            </div>
            {showPublishMessage && (
              <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-sm text-center">
                ✅ 楽曲リストが公開されました
              </div>
            )}
          </div>
        )}

        <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
          <div className="relative">
            <Search className={`absolute left-2 top-2 w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="楽曲名、アーティスト名、読み仮名、タグで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} focus:outline-none focus:ring-2 ${currentTheme.inputFocus} text-sm`}
            />
          </div>
        </div>

        <div className={`${currentTheme.card} rounded-lg border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-50'}`}>
                  {!isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>リクエスト</th>}
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>楽曲名</th>
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>アーティスト</th>
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>ジャンル/タグ</th>
                  {isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>管理</th>}
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, index) => (
                  <tr key={song.id} className={`border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} ${currentTheme.cardHover} ${index % 2 === 0 ? currentTheme.cardEven : ''}`}>
                    {!isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => copyToClipboard(song)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded text-xs ${copiedSong === song.id ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}
                          >
                            {copiedSong === song.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>済</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>リクエスト</span>
                              </>
                            )}
                          </button>
                          {song.copyCount > 0 && (
                            <div className={`${currentTheme.textTertiary} text-xs`}>
                              {song.copyCount}回
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className={`${currentTheme.text} font-medium`}>{song.title}</div>
                      {song.reading && (
                        <div className={`${currentTheme.textTertiary} text-xs mt-1`}>{song.reading}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`${currentTheme.textSecondary}`}>{song.artist}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 ${isDarkMode ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'} rounded text-xs`}>
                          {song.genre}
                        </span>
                        {song.tags && song.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 ${isDarkMode ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-100 text-blue-800'} rounded text-xs`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingSong(song);
                              setShowEditModal(true);
                            }}
                            className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded text-blue-300 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(song)}
                            className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSongs.length === 0 && (
            <div className={`text-center py-8 ${currentTheme.textTertiary}`}>
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">該当する楽曲が見つかりませんでした</p>
            </div>
          )}
        </div>

        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-sm">
              <h4 className="text-gray-800 font-bold mb-3 text-center">🔒 管理者認証</h4>
              <p className="text-gray-600 text-sm mb-4 text-center">パスワードを入力してください</p>
              <input
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-xs mb-3 text-center">{passwordError}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                >
                  認証
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-3">削除確認</h3>
              <p className="text-gray-700 mb-2">以下の楽曲を削除しますか？</p>
              <div className="bg-gray-100 rounded p-2 mb-4">
                <p className="font-medium text-gray-800">{deleteConfirm.title}</p>
                <p className="text-gray-600 text-sm">{deleteConfirm.artist}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => deleteSong(deleteConfirm)}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                >
                  削除する
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">楽曲追加</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">楽曲名 *</label>
                  <input
                    type="text"
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="楽曲名を入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">読み仮名</label>
                  <input
                    type="text"
                    value={newSong.reading || ''}
                    onChange={(e) => setNewSong({...newSong, reading: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="よみがなを入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト名 *</label>
                  <input
                    type="text"
                    value={newSong.artist}
                    onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="アーティスト名を入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                  <select
                    value={newSong.genre}
                    onChange={(e) => setNewSong({...newSong, genre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">ジャンルを選択</option>
                    {availableGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                  <input
                    type="text"
                    value={Array.isArray(newSong.tags) ? newSong.tags.join(', ') : ''}
                    onChange={(e) => setNewSong({...newSong, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="タグをカンマ区切りで入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={newSong.memo || ''}
                    onChange={(e) => setNewSong({...newSong, memo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="メモを入力"
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={addSong}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                  disabled={!newSong.title || !newSong.artist}
                >
                  追加
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={addSong}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                  disabled={!newSong.title || !newSong.artist}
                >
                  追加
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {showMessageEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">メッセージ編集</h3>
              
              <textarea
                value={tempAdminMessage}
                onChange={(e) => setTempAdminMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="配信者からのメッセージを入力"
                rows="4"
              />
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    saveAdminMessageToFirebase(tempAdminMessage);
                    setShowMessageEditModal(false);
                  }}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowMessageEditModal(false)}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">楽曲編集</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">楽曲名 *</label>
                  <input
                    type="text"
                    value={editingSong.title}
                    onChange={(e) => setEditingSong({...editingSong, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="楽曲名を入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">読み仮名</label>
                  <input
                    type="text"
                    value={editingSong.reading || ''}
                    onChange={(e) => setEditingSong({...editingSong, reading: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="よみがなを入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト名 *</label>
                  <input
                    type="text"
                    value={editingSong.artist}
                    onChange={(e) => setEditingSong({...editingSong, artist: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="アーティスト名を入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                  <select
                    value={editingSong.genre}
                    onChange={(e) => setEditingSong({...editingSong, genre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">ジャンルを選択</option>
                    {availableGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                  <input
                    type="text"
                    value={Array.isArray(editingSong.tags) ? editingSong.tags.join(', ') : ''}
                    onChange={(e) => setEditingSong({...editingSong, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="タグをカンマ区切りで入力"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={editingSong.memo || ''}
                    onChange={(e) => setEditingSong({...editingSong, memo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="メモを入力"
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={async () => {
                    if (!editingSong.title || !editingSong.artist) return;
                    const updatedSongs = songs.map(song => song.id === editingSong.id ? {...song, ...editingSong} : song);
                    await saveSongsToFirebase(updatedSongs);
                    setShowEditModal(false);
                    setEditingSong(null);
                  }}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                  disabled={!editingSong.title || !editingSong.artist}
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSong(null);
                  }}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
