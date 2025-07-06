import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Sun, Moon, Star, Filter, SortAsc, SortDesc, Plus } from 'lucide-react';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDemo-Replace-With-Your-Actual-API-Key",
  authDomain: "music-request-app.firebaseapp.com",
  projectId: "music-request-app",
  storageBucket: "music-request-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Firebase変数
let firebaseApp = null;
let db = null;

// FirebaseをCDNから動的に読み込む関数
const loadFirebaseSDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    if (window.firebase) {
      resolve(window.firebase);
      return;
    }

    const appScript = document.createElement('script');
    appScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    appScript.onload = () => {
      const firestoreScript = document.createElement('script');
      firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';
      firestoreScript.onload = () => {
        resolve(window.firebase);
      };
      firestoreScript.onerror = () => reject(new Error('Failed to load Firestore SDK'));
      document.head.appendChild(firestoreScript);
    };
    appScript.onerror = () => reject(new Error('Failed to load Firebase App SDK'));
    document.head.appendChild(appScript);
  });
};

// Firebaseの初期化関数
const initializeFirebase = async () => {
  try {
    if (firebaseApp) {
      return true;
    }

    console.log('Loading Firebase SDK...');
    const firebase = await loadFirebaseSDK();
    
    console.log('Initializing Firebase...');
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

export default function EnhancedMusicRequestApp() {
  // 状態管理
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [showPublishMessage, setShowPublishMessage] = useState(false);

  // 表示・フィルター機能
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterGenre, setFilterGenre] = useState('');
  const [showSpecialtyOnly, setShowSpecialtyOnly] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // モーダル表示状態
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageEditModal, setShowMessageEditModal] = useState(false);

  // データの初期値
  const initialSongs = [
    { 
      id: 1, 
      title: '10月無口な君を忘れる', 
      artist: 'あたらよ', 
      reading: 'じゅうがつむくちなきみをわすれる', 
      genre: 'J-POP', 
      tags: ['バラード'], 
      memo: '', 
      copyCount: 2,
      isSpecialty: false,
      createdAt: new Date('2024-01-15').toISOString(),
      lastRequested: new Date('2024-06-20').toISOString()
    },
    { 
      id: 2, 
      title: '366日', 
      artist: 'HY', 
      reading: 'さんびゃくろくじゅうろくにち', 
      genre: 'J-POP', 
      tags: ['沖縄'], 
      memo: '', 
      copyCount: 5,
      isSpecialty: true,
      createdAt: new Date('2024-01-20').toISOString(),
      lastRequested: new Date('2024-06-25').toISOString()
    },
    { 
      id: 3, 
      title: '夜に駆ける', 
      artist: 'YOASOBI', 
      reading: 'よるにかける', 
      genre: 'J-POP', 
      tags: ['ボカロ系'], 
      memo: '人気曲', 
      copyCount: 15,
      isSpecialty: true,
      createdAt: new Date('2024-02-10').toISOString(),
      lastRequested: new Date('2024-06-27').toISOString()
    }
  ];

  // Firebaseストレージ操作関数
  const saveToFirestore = async (collection, data) => {
    try {
      if (!db) {
        console.error('Firestore not available');
        return { success: false, source: 'none' };
      }
      
      console.log(`Saving to Firestore collection: ${collection}`, data);
      
      await db.collection('musicApp').doc(collection).set({
        data: data,
        updatedAt: new Date().toISOString(),
        version: 1
      });
      
      console.log(`[Firestore] Data saved to ${collection}`);
      return { success: true, source: 'firestore' };
    } catch (error) {
      console.error('Firestore save error:', error);
      return { success: false, error, source: 'error' };
    }
  };

  const loadFromFirestore = async (collection, defaultValue) => {
    try {
      if (!db) {
        console.error('Firestore not available, using default value');
        return defaultValue;
      }
      
      console.log(`Loading from Firestore collection: ${collection}`);
      
      const doc = await db.collection('musicApp').doc(collection).get();
      
      if (doc.exists) {
        const firestoreData = doc.data().data;
        console.log(`[Firestore] Data loaded from ${collection}`);
        return firestoreData;
      } else {
        console.log(`No data found in Firestore for ${collection}, saving default`);
        await saveToFirestore(collection, defaultValue);
        return defaultValue;
      }
    } catch (error) {
      console.error('Firestore load error:', error);
      return defaultValue;
    }
  };

  // 楽曲データ状態
  const [songs, setSongs] = useState(initialSongs);
  const [publishedSongs, setPublishedSongs] = useState(initialSongs);
  const [adminMessage, setAdminMessage] = useState('配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSong, setCopiedSong] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [tempAdminMessage, setTempAdminMessage] = useState('');
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    reading: '',
    genre: '',
    tags: [],
    memo: ''
  });
  const [bulkSongText, setBulkSongText] = useState('');
  const [availableGenres] = useState(['J-POP', 'アニソン', 'ロック', 'バラード', '演歌', 'クラシック', 'ボカロ', 'インスト']);

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

  // データをFirestoreに保存するヘルパー関数
  const saveSongsToStorage = async (songsData) => {
    console.log('Saving songs:', songsData);
    setSongs([...songsData]);
    
    try {
      const result = await saveToFirestore('songs', songsData);
      if (result.success) {
        console.log('Songs saved to Firestore successfully');
      } else {
        console.error('Failed to save songs to Firestore');
      }
    } catch (error) {
      console.error('Error saving songs:', error);
    }
    
    return { success: true };
  };

  const saveAdminMessageToStorage = async (message) => {
    console.log('Saving admin message:', message);
    setAdminMessage(message);
    
    try {
      const result = await saveToFirestore('adminMessage', message);
      if (result.success) {
        console.log('Admin message saved to Firestore successfully');
      } else {
        console.error('Failed to save admin message to Firestore');
      }
    } catch (error) {
      console.error('Error saving admin message:', error);
    }
    
    return { success: true };
  };

  const saveDarkModeToStorage = async (darkMode) => {
    console.log('Saving dark mode:', darkMode);
    setIsDarkMode(darkMode);
    
    try {
      const result = await saveToFirestore('isDarkMode', darkMode);
      if (result.success) {
        console.log('Dark mode saved to Firestore successfully');
      } else {
        console.error('Failed to save dark mode to Firestore');
      }
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
    
    return { success: true };
  };

  // 楽曲編集の保存処理
  const updateSong = async (updatedSong) => {
    console.log('Updating song:', updatedSong);
    const updatedSongs = songs.map(song => 
      song.id === updatedSong.id ? {...updatedSong, updatedAt: new Date().toISOString()} : song
    );
    
    const result = await saveSongsToStorage(updatedSongs);
    return result.success;
  };

  // 初期化
  useEffect(() => {
    const init = async () => {
      setLoadingFirebase(true);
      
      try {
        const firebaseInitialized = await initializeFirebase();

        const [loadedSongs, loadedPublished, loadedMessage, loadedDarkMode] = await Promise.all([
          loadFromFirestore('songs', initialSongs),
          loadFromFirestore('publishedSongs', initialSongs),
          loadFromFirestore('adminMessage', '配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪'),
          loadFromFirestore('isDarkMode', true)
        ]);

        setSongs(loadedSongs);
        setPublishedSongs(loadedPublished);
        setAdminMessage(loadedMessage);
        setIsDarkMode(loadedDarkMode);
      } catch (error) {
        console.error('Initialization error:', error);
        setSongs(initialSongs);
        setPublishedSongs(initialSongs);
      }
      
      setLoadingFirebase(false);
    };
    
    init();
  }, []);

  // 計算プロパティ
  const displayedSongs = isAdmin ? songs : publishedSongs;
  
  // 検索・フィルター・ソート機能
  const getFilteredAndSortedSongs = () => {
    let filtered = displayedSongs.filter(song => {
      if (searchTerm === '') return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      const titleMatch = song.title.toLowerCase().includes(searchLower);
      const artistMatch = song.artist.toLowerCase().includes(searchLower);
      const readingMatch = song.reading && song.reading.toLowerCase().includes(searchLower);
      const genreMatch = song.genre && song.genre.toLowerCase().includes(searchLower);
      const tagMatch = song.tags && song.tags.some(tag => 
        tag.toLowerCase().includes(searchLower)
      );
      const memoMatch = song.memo && song.memo.toLowerCase().includes(searchLower);
      
      const matchesSearch = titleMatch || artistMatch || readingMatch || genreMatch || tagMatch || memoMatch;
      const matchesGenre = filterGenre === '' || song.genre === filterGenre;
      const matchesSpecialty = !showSpecialtyOnly || song.isSpecialty;
      
      return matchesSearch && matchesGenre && matchesSpecialty;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'artist':
          aValue = a.artist.toLowerCase();
          bValue = b.artist.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const filteredSongs = getFilteredAndSortedSongs();
  
  // 検索候補を取得する関数
  const getSearchSuggestions = () => {
    if (searchTerm.length < 1) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const suggestions = new Set();
    
    displayedSongs.forEach(song => {
      if (song.title.toLowerCase().includes(searchLower)) {
        suggestions.add(song.title);
      }
      
      if (song.artist.toLowerCase().includes(searchLower)) {
        suggestions.add(song.artist);
      }
      
      if (song.reading && song.reading.toLowerCase().includes(searchLower)) {
        suggestions.add(song.reading);
      }
      
      if (song.genre && song.genre.toLowerCase().includes(searchLower)) {
        suggestions.add(song.genre);
      }
      
      if (song.tags) {
        song.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchLower)) {
            suggestions.add(tag);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };
  
  const searchSuggestions = getSearchSuggestions();

  // リクエスト機能
  const copyToClipboard = async (song) => {
    const requestText = `♪ ${song.title} - ${song.artist}`;
    try {
      await navigator.clipboard.writeText(requestText);
      setCopiedSong(song.id);
      setTimeout(() => setCopiedSong(null), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setCopiedSong(song.id);
      setTimeout(() => setCopiedSong(null), 2000);
    }
  };

  const toggleSpecialty = async (songId) => {
    console.log('Toggling specialty for song:', songId);
    const updatedSongs = songs.map(song => 
      song.id === songId ? { ...song, isSpecialty: !song.isSpecialty } : song
    );
    await saveSongsToStorage(updatedSongs);
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
    console.log('Deleting song:', songToDelete.id);
    const updatedSongs = songs.filter(song => song.id !== songToDelete.id);
    await saveSongsToStorage(updatedSongs);
    setDeleteConfirm(null);
  };

  const addSong = async () => {
    if (!newSong.title || !newSong.artist) return;
    
    try {
      console.log('Adding new song:', newSong);
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = { 
        ...newSong, 
        id, 
        copyCount: 0, 
        tags: newSong.tags || [],
        isSpecialty: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedSongs = [...songs, songToAdd];
      setSongs(updatedSongs);
      await saveToFirestore('songs', updatedSongs);
      
      setNewSong({ 
        title: '', 
        artist: '', 
        reading: '', 
        genre: '', 
        tags: [], 
        memo: ''
      });
      setShowAddModal(false);
      console.log('Song added successfully');
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const addBulkSongs = async () => {
    if (!bulkSongText.trim()) return;
    
    try {
      const lines = bulkSongText.trim().split('\n');
      const newSongs = [];
      let maxId = Math.max(...songs.map(s => s.id), 0);
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        let title, artist;
        if (trimmedLine.includes(' - ')) {
          [title, artist] = trimmedLine.split(' - ').map(s => s.trim());
        } else if (trimmedLine.includes(',')) {
          [title, artist] = trimmedLine.split(',').map(s => s.trim());
        } else {
          title = trimmedLine;
          artist = '不明';
        }
        
        if (title) {
          maxId++;
          newSongs.push({
            id: maxId,
            title,
            artist: artist || '不明',
            reading: '',
            genre: '',
            tags: [],
            memo: '',
            copyCount: 0,
            isSpecialty: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      if (newSongs.length > 0) {
        const updatedSongs = [...songs, ...newSongs];
        setSongs(updatedSongs);
        await saveToFirestore('songs', updatedSongs);
        
        setBulkSongText('');
        setShowBulkAddModal(false);
        console.log(`${newSongs.length} songs added successfully`);
      }
    } catch (error) {
      console.error('Error adding bulk songs:', error);
    }
  };

  const publishSongs = async () => {
    console.log('Publishing songs...');
    setPublishedSongs([...songs]);
    setShowPublishMessage(true);
    setTimeout(() => setShowPublishMessage(false), 3000);
    
    try {
      const result = await saveToFirestore('publishedSongs', songs);
      if (result.success) {
        console.log('Published songs saved to Firestore successfully');
      }
    } catch (error) {
      console.error('Error saving published songs:', error);
    }
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

        {/* ヘッダー */}
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
                  const newDarkMode = !isDarkMode;
                  setIsDarkMode(newDarkMode);
                  saveDarkModeToStorage(newDarkMode);
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

        {/* 配信者メッセージ */}
        <div className={`${isDarkMode ? 'bg-yellow-500/20 border-yellow-400/50' : 'bg-yellow-50 border-yellow-300'} rounded-lg p-4 mb-3 border-2`}>
          <div className="flex items-start space-x-3">
            <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} mt-0.5`} />
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-2`}>
                📢 配信者からのメッセージ
              </h3>
              <p className={`${isDarkMode ? 'text-yellow-100' : 'text-yellow-700'} text-sm`}>{adminMessage}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setTempAdminMessage(adminMessage);
                  setShowMessageEditModal(true);
                }}
                className={`p-2 ${isDarkMode ? 'bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200' : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-700'} rounded transition-colors`}
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ゲスト向け説明 */}
        {!isAdmin && (
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border-purple-300/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'} rounded-lg p-3 mb-3 border`}>
            <div className="flex items-center space-x-2 mb-2">
              <Copy className={`w-4 h-4 ${currentTheme.icon}`} />
              <div className={`${currentTheme.textSecondary} text-sm`}>
                <p className="font-medium mb-1">🎵 リクエスト方法</p>
                <p className="text-xs">
                  楽曲の「リクエスト」ボタンを押すと、楽曲名とアーティスト名がクリップボードにコピーされます。<br/>
                  コピーした内容をチャット欄やコメント欄に貼り付けてリクエストしてください！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 管理者機能 */}
        {isAdmin && (
          <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
            <div className="flex items-center justify-between">
              <h3 className={`${currentTheme.text} font-bold text-sm`}>楽曲管理</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBulkAddModal(true)}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>一括追加</span>
                </button>
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
                ✅ 楽曲リストが公開されました！ゲストに楽曲が表示されています。
              </div>
            )}
          </div>
        )}

        {/* 検索・フィルター機能 */}
        <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border space-y-3`}>
          <div className="relative">
            <Search className={`absolute left-2 top-2 w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="楽曲名、アーティスト名、読み仮名、タグで検索..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              className={`w-full pl-8 pr-3 py-2 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} focus:outline-none focus:ring-2 ${currentTheme.inputFocus} text-sm`}
            />
            
            {/* 検索候補 */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${currentTheme.card} border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto`}>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSearchSuggestions(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${currentTheme.textSecondary} hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg`}
                  >
                    <Search className="w-3 h-3 inline mr-2 opacity-50" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center space-x-2">
              <Filter className={`w-4 h-4 ${currentTheme.icon}`} />
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className={`px-2 py-1 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} text-sm`}
              >
                <option value="">全ジャンル</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              {isAdmin && (
                <button
                  onClick={() => setShowSpecialtyOnly(!showSpecialtyOnly)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${showSpecialtyOnly ? 'bg-orange-500 text-white' : 'bg-gray-500/30 text-gray-400'}`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  得意のみ
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-2 py-1 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} text-sm`}
              >
                <option value="title">楽曲名順</option>
                <option value="artist">アーティスト順</option>
                <option value="createdAt">追加日順</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`p-1 ${currentTheme.inputBg} border rounded text-sm transition-colors`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 楽曲リスト */}
        <div className={`${currentTheme.card} rounded-lg border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-50'}`}>
                  {!isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>リクエスト</th>}
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>楽曲名</th>
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>アーティスト</th>
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>ジャンル/タグ</th>
                  {isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>得意</th>}
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
                                <span>コピーしました</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>リクエスト</span>
                              </>
                            )}
                          </button>
                          {song.isSpecialty && (
                            <div className="text-orange-400 text-xs">★得意</div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className={`${currentTheme.text} font-medium`}>{song.title}</div>
                      {song.memo && (
                        <div className={`${currentTheme.textTertiary} text-xs mt-1`}>{song.memo}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`${currentTheme.textSecondary}`}>{song.artist}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {song.genre && (
                          <span className={`px-2 py-1 ${isDarkMode ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'} rounded text-xs`}>
                            {song.genre}
                          </span>
                        )}
                        {song.tags && song.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 ${isDarkMode ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-100 text-blue-800'} rounded text-xs`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleSpecialty(song.id)}
                          className={`p-1 rounded transition-colors ${song.isSpecialty ? 'text-orange-400' : 'text-gray-400'}`}
                        >
                          <Star className={`w-4 h-4 ${song.isSpecialty ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                    )}
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

        {/* パスワードモーダル */}
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

        {/* 削除確認モーダル */}
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

        {/* 楽曲追加モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
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

        {/* 一括追加モーダル */}
        {showBulkAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4">楽曲一括追加</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">楽曲リスト</label>
                  <p className="text-xs text-gray-500 mb-2">
                    1行に1曲ずつ入力してください。<br/>
                    形式: "楽曲名 - アーティスト名" または "楽曲名,アーティスト名"
                  </p>
                  <textarea
                    value={bulkSongText}
                    onChange={(e) => setBulkSongText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="例:&#10;紅蓮華 - LiSA&#10;夜に駆ける - YOASOBI"
                    rows="10"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={addBulkSongs}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium"
                  disabled={!bulkSongText.trim()}
                >
                  一括追加
                </button>
                <button
                  onClick={() => setShowBulkAddModal(false)}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* メッセージ編集モーダル */}
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
                    console.log('Saving message:', tempAdminMessage);
                    setAdminMessage(tempAdminMessage);
                    saveAdminMessageToStorage(tempAdminMessage);
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

        {/* 楽曲編集モーダル */}
        {showEditModal && editingSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
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
                    
                    console.log('Attempting to save edited song:', editingSong);
                    const success = await updateSong(editingSong);
                    
                    if (success) {
                      setShowEditModal(false);
                      setEditingSong(null);
                      console.log('Song edit completed successfully');
                    } else {
                      console.error('Failed to save song edits');
                    }
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
