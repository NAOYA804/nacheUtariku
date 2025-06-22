import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Youtube, FileText, Sun, Moon } from 'lucide-react';

export default function SimpleRequestApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [songs, setSongs] = useState([]);
  const [realtimeListener, setRealtimeListener] = useState(null);

  const [adminMessage, setAdminMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSong, setCopiedSong] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    titleFurigana: '',
    artist: '',
    artistFurigana: '',
    genre: '',
    tags: [],
    youtubeUrl: '',
    memo: ''
  });
  const [bulkAddText, setBulkAddText] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMessageEditModal, setShowMessageEditModal] = useState(false);
  const [tempAdminMessage, setTempAdminMessage] = useState('');
  const [publishedSongs, setPublishedSongs] = useState([]);
  const [availableGenres, setAvailableGenres] = useState(['J-POP', 'アニソン', 'ロック', 'バラード', '演歌', 'クラシック']);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showPublishMessage, setShowPublishMessage] = useState(false);

  // 初期データ
  const initialSongs = [
    { id: 1, title: '10月無口な君を忘れる', titleFurigana: 'じゅうがつむくちなきみをわすれる', artist: 'あたらよ', artistFurigana: 'あたらよ', genre: 'J-POP', tags: ['バラード'], youtubeUrl: 'https://www.youtube.com/watch?v=example1', memo: '', copyCount: 2 },
    { id: 2, title: '366日', titleFurigana: 'さんびゃくろくじゅうろくにち', artist: 'HY', artistFurigana: 'エイチワイ', genre: 'J-POP', tags: ['沖縄'], youtubeUrl: '', memo: '', copyCount: 5 },
    { id: 3, title: '3月9日', titleFurigana: 'さんがつここのか', artist: 'レミオロメン', artistFurigana: 'レミオロメン', genre: 'J-POP', tags: ['卒業'], youtubeUrl: 'https://www.youtube.com/watch?v=example3', memo: '', copyCount: 8 },
    { id: 4, title: '夜に駆ける', titleFurigana: 'よるにかける', artist: 'YOASOBI', artistFurigana: 'ヨアソビ', genre: 'J-POP', tags: ['ボカロ系'], youtubeUrl: '', memo: '人気曲', copyCount: 15 },
    { id: 5, title: '紅蓮華', titleFurigana: 'ぐれんげ', artist: 'LiSA', artistFurigana: 'リサ', genre: 'アニソン', tags: ['アニソン'], youtubeUrl: 'https://www.youtube.com/watch?v=example5', memo: '鬼滅の刃主題歌', copyCount: 12 },
    { id: 6, title: 'Pretender', titleFurigana: 'プリテンダー', artist: 'Official髭男dism', artistFurigana: 'オフィシャルひげだんディズム', genre: 'J-POP', tags: ['ロック'], youtubeUrl: '', memo: '', copyCount: 10 }
  ];

  // 安全な環境変数取得
  const getFirebaseConfig = () => {
    try {
      // ブラウザ環境チェック
      if (typeof window === 'undefined') {
        console.log('Server environment - Firebase not available');
        return null;
      }

      // 環境変数またはデフォルト設定を使用
      const config = {
        apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 実際のAPIキーに置き換え
        authDomain: "your-project.firebaseapp.com", // 実際のドメインに置き換え
        projectId: "your-project-id", // 実際のプロジェクトIDに置き換え
        storageBucket: "your-project.appspot.com", // 実際のストレージバケットに置き換え
        messagingSenderId: "123456789", // 実際のSender IDに置き換え
        appId: "1:123456789:web:abcdefghijklmnop", // 実際のApp IDに置き換え
        databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/" // Realtime Database URL
      };

      // 設定値の存在確認
      if (!config.apiKey || config.apiKey.includes('xxx')) {
        console.warn('Firebase config contains placeholder values');
        return null;
      }

      return config;
    } catch (error) {
      console.error('Error getting Firebase config:', error);
      return null;
    }
  };

  // Firebase接続とデータ操作（バックグラウンド処理）+ リアルタイム同期
  const firebaseAPI = {
    // 初期化
    initialize: async () => {
      try {
        const config = getFirebaseConfig();
        if (!config) {
          return false;
        }

        // 接続処理（サイレント）
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
      }
    },

    // データ読み込み
    loadData: async () => {
      try {
        // Firebase Realtime Databaseからデータを取得
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 実際の実装では、Firebaseからデータを取得して、
        // ローカルデータとマージまたは最新データで上書き
        // ここではlocalStorageのデータを優先してFirebaseを補完として使用
        
        return null; // ローカルデータを優先するためnullを返す
      } catch (error) {
        console.error('Firebase load error:', error);
        throw error;
      }
    },

    // データ保存
    saveData: async (type, data) => {
      try {
        // Firebase Realtime Databaseにデータを保存（モック）
        await new Promise(resolve => setTimeout(resolve, 50));
        return true;
      } catch (error) {
        console.error('Firebase save error:', error);
        throw error;
      }
    },

    // リアルタイムリスナー設定
    setupRealtimeListener: (callback) => {
      try {
        // 実際の実装では以下のようになります：
        // const database = getDatabase();
        // const songsRef = ref(database, 'songs');
        // const unsubscribe = onValue(songsRef, (snapshot) => {
        //   const data = snapshot.val();
        //   if (data) callback('songs', data);
        // });
        // return unsubscribe;

        // モック実装：実際のFirebaseでは他のクライアントからの変更のみ受信
        const interval = setInterval(() => {
          // 実際の実装では、自分以外のクライアントからの変更のみ処理
          const shouldSync = Math.random() > 0.98; // 2%の確率で他のクライアントの変更をシミュレート
          if (shouldSync) {
            console.log('リアルタイム同期: 他のクライアントからの更新を受信');
            // 実際の実装では、Firebaseから受信したデータでstateを更新
            // ここでは何もしない（ローカルデータを保持）
          }
        }, 10000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Realtime listener setup error:', error);
        return null;
      }
    },

    // リアルタイムリスナー解除
    removeRealtimeListener: (unsubscribe) => {
      try {
        if (unsubscribe) {
          unsubscribe();
        }
      } catch (error) {
        console.error('Error removing realtime listener:', error);
      }
    }
  };

  // 安全なlocalStorage操作関数
  const safeLocalStorage = {
    getItem: (key, defaultValue = null) => {
      try {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return defaultValue;
        }
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error getting localStorage item ${key}:`, error);
        return defaultValue;
      }
    },
    
    setItem: (key, value) => {
      try {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return false;
        }
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Error setting localStorage item ${key}:`, error);
        return false;
      }
    }
  };

  // データ読み込み（localStorage優先、Firebase補完）+ リアルタイム同期開始
  const loadData = async () => {
    try {
      // まずlocalStorageからデータを読み込み（ページ更新時のデータ保持）
      const localData = loadFromLocalStorage();
      setSongs(localData.songs);
      setPublishedSongs(localData.publishedSongs);
      setAdminMessage(localData.adminMessage);

      // Firebase接続を試行（バックグラウンド）
      const connected = await firebaseAPI.initialize();
      
      if (connected) {
        // リアルタイム同期リスナーを設定（他のクライアントからの変更のみ受信）
        const unsubscribe = firebaseAPI.setupRealtimeListener((type, data) => {
          // 他のクライアントからの変更を受信した時のみ処理
          console.log(`リアルタイム同期: ${type}が他のクライアントで更新されました`);
          switch (type) {
            case 'songs':
              setSongs(data);
              safeLocalStorage.setItem('songs', data);
              break;
            case 'publishedSongs':
              setPublishedSongs(data);
              safeLocalStorage.setItem('publishedSongs', data);
              break;
            case 'adminMessage':
              setAdminMessage(data);
              safeLocalStorage.setItem('adminMessage', data);
              break;
          }
        });
        setRealtimeListener(unsubscribe);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // エラー時は既存のlocalStorageデータを保持、なければ初期データ
      const localData = loadFromLocalStorage();
      if (localData.songs.length === 0) {
        setSongs(initialSongs);
        setPublishedSongs(initialSongs);
        setAdminMessage('配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪');
      }
    }
  };

  // localStorageからデータを読み込む関数
  const loadFromLocalStorage = () => {
    try {
      const storedSongs = safeLocalStorage.getItem('songs', null);
      const storedPublishedSongs = safeLocalStorage.getItem('publishedSongs', null);
      const storedAdminMessage = safeLocalStorage.getItem('adminMessage', null);
      
      return {
        songs: storedSongs || initialSongs,
        publishedSongs: storedPublishedSongs || initialSongs,
        adminMessage: storedAdminMessage || '配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪'
      };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {
        songs: initialSongs,
        publishedSongs: initialSongs,
        adminMessage: '配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪'
      };
    }
  };

  // データ保存（Firebase優先、フォールバックでlocalStorage）+ リアルタイム同期
  const saveData = async (type, data) => {
    try {
      // Firebaseに保存（他のクライアントにリアルタイム同期される）
      await firebaseAPI.saveData(type, data);
    } catch (error) {
      // エラー時はlocalStorageにフォールバック
      safeLocalStorage.setItem(type, data);
    }
  };

  // 初期化時にデータを読み込み
  useEffect(() => {
    loadData();
    
    // クリーンアップ関数：コンポーネントのアンマウント時にリアルタイムリスナーを解除
    return () => {
      if (realtimeListener) {
        firebaseAPI.removeRealtimeListener(realtimeListener);
      }
    };
  }, []);

  // リアルタイムリスナーのクリーンアップ
  useEffect(() => {
    return () => {
      if (realtimeListener) {
        firebaseAPI.removeRealtimeListener(realtimeListener);
      }
    };
  }, [realtimeListener]);

  // データが変更されたときに保存
  useEffect(() => {
    if (songs.length > 0) {
      saveData('songs', songs);
    }
  }, [songs]);

  useEffect(() => {
    if (publishedSongs.length > 0) {
      saveData('publishedSongs', publishedSongs);
    }
  }, [publishedSongs]);

  useEffect(() => {
    if (adminMessage) {
      saveData('adminMessage', adminMessage);
    }
  }, [adminMessage]);

  const allTags = [...new Set(songs.flatMap(song => song.tags || []))].sort();
  const allGenres = [...new Set(songs.flatMap(song => song.genre ? [song.genre] : []))].sort();
  const displayedSongs = isAdmin ? songs : publishedSongs;
  const topSongs = displayedSongs.filter(song => song.copyCount > 0).sort((a, b) => b.copyCount - a.copyCount).slice(0, 3);
  const filteredSongs = displayedSongs.filter(song => {
    const matchesSearch = searchTerm === '' || 
           song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
           song.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (song.titleFurigana && song.titleFurigana.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (song.artistFurigana && song.artistFurigana.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (song.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (song.memo && song.memo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => (song.tags || []).includes(tag));
    const matchesGenres = selectedGenres.length === 0 || selectedGenres.includes(song.genre);
    return matchesSearch && matchesTags && matchesGenres;
  });

  const copyToClipboard = async (song) => {
    const requestText = `♪ ${song.title} - ${song.artist}`;
    try {
      await navigator.clipboard.writeText(requestText);
      setCopiedSong(song.id);
      if (isAdmin) {
        setSongs(songs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
      } else {
        setPublishedSongs(publishedSongs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
      }
      setTimeout(() => setCopiedSong(null), 2000);
    } catch (err) {
      setCopiedSong(song.id);
      if (isAdmin) {
        setSongs(songs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
      } else {
        setPublishedSongs(publishedSongs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
      }
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
    const correctPassword = 'admin123';
    if (password === correctPassword) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('パスワードが正しくありません');
      setPassword('');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const deleteSong = (id) => {
    setSongs(songs.filter(song => song.id !== id));
    setDeleteConfirm(null);
  };

  const openEditModal = (song) => {
    setEditingSong({
      id: song.id,
      title: song.title,
      titleFurigana: song.titleFurigana || '',
      artist: song.artist,
      artistFurigana: song.artistFurigana || '',
      genre: song.genre || '',
      tags: song.tags || [],
      youtubeUrl: song.youtubeUrl || '',
      memo: song.memo || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSong(null);
  };

  const saveEditedSong = () => {
    if (!editingSong.title || !editingSong.artist) return;
    
    setSongs(songs.map(song => 
      song.id === editingSong.id 
        ? { ...song, ...editingSong, tags: editingSong.tags || [] }
        : song
    ));
    closeEditModal();
  };

  const addSong = () => {
    if (!newSong.title || !newSong.artist) return;
    
    const id = Math.max(...songs.map(s => s.id), 0) + 1;
    const songToAdd = {
      ...newSong,
      id,
      copyCount: 0,
      tags: newSong.tags.length > 0 ? newSong.tags : []
    };
    
    setSongs([...songs, songToAdd]);
    setNewSong({
      title: '',
      titleFurigana: '',
      artist: '',
      artistFurigana: '',
      genre: '',
      tags: [],
      youtubeUrl: '',
      memo: ''
    });
    setShowAddModal(false);
  };

  const addBulkSongs = () => {
    if (!bulkAddText.trim()) return;
    
    const lines = bulkAddText.trim().split('\n');
    const newSongs = [];
    let maxId = Math.max(...songs.map(s => s.id), 0);
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      const parts = trimmedLine.includes(',') ? trimmedLine.split(',') : [trimmedLine, ''];
      
      if (parts.length >= 1 && parts[0].trim()) {
        maxId++;
        const song = {
          id: maxId,
          title: parts[0]?.trim() || '',
          artist: parts[1]?.trim() || '不明',
          titleFurigana: '',
          artistFurigana: '',
          genre: 'J-POP',
          tags: [],
          youtubeUrl: '',
          memo: '',
          copyCount: 0
        };
        
        if (song.title) {
          newSongs.push(song);
        }
      }
    });
    
    if (newSongs.length > 0) {
      setSongs([...songs, ...newSongs]);
      setBulkAddText('');
      setShowBulkAddModal(false);
    }
  };

  const publishSongs = () => {
    setPublishedSongs([...songs]);
    setShowPublishMessage(true);
    setTimeout(() => setShowPublishMessage(false), 3000);
  };

  const editAdminMessage = () => {
    setTempAdminMessage(adminMessage);
    setShowMessageEditModal(true);
  };

  const saveAdminMessage = () => {
    setAdminMessage(tempAdminMessage);
    setShowMessageEditModal(false);
  };

  const addGenre = (newGenre) => {
    if (newGenre && !availableGenres.includes(newGenre)) {
      setAvailableGenres([...availableGenres, newGenre].sort());
    }
  };

  const themeColors = {
    dark: {
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
    },
    light: {
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
    }
  };

  const currentTheme = themeColors[isDarkMode ? 'dark' : 'light'];

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <div className="container mx-auto px-3 py-3 max-w-7xl">
        
        {showMessageEditModal ? (
          <div className={`${currentTheme.card} rounded-lg p-4 border mb-3`}>
            <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>配信者メッセージ編集</h3>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>メッセージ</label>
              <textarea
                value={tempAdminMessage}
                onChange={(e) => setTempAdminMessage(e.target.value)}
                className={`w-full px-3 py-2 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} focus:outline-none focus:ring-2 ${currentTheme.inputFocus} text-sm`}
                placeholder="配信者からのメッセージを入力"
                rows="4"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={saveAdminMessage}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
              >
                保存
              </button>
              <button
                onClick={() => setShowMessageEditModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className={`w-5 h-5 ${currentTheme.icon}`} />
                  <div>
                    <h1 className={`text-lg font-bold ${currentTheme.text} leading-tight`}>
                      リクエスト
                    </h1>
                    <h2 className={`text-lg font-bold ${currentTheme.text} leading-tight`}>
                      楽曲一覧
                    </h2>
                    {isAdmin && <span className={`text-sm ${currentTheme.textTertiary}`}>管理者モード</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 ${isDarkMode ? 'bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300' : 'bg-gray-500/30 hover:bg-gray-500/50 text-gray-600'} rounded transition-colors`}
                    title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <span className={`${currentTheme.textTertiary} text-sm`}>ゲスト</span>
                  <button
                    onClick={handleAdminToggle}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      isAdmin ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                        isAdmin ? 'transform translate-x-4' : 'transform translate-x-0.5'
                      }`}
                    />
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
                    onClick={editAdminMessage}
                    className="p-1 bg-blue-500/30 hover:bg-blue-500/50 rounded text-blue-300 transition-colors"
                    title="メッセージを編集"
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
                    楽曲の「リクエスト」ボタンを押すとクリップボードにコピーされます。配信のコメント欄に貼り付けてリクエストしてください！
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
                      1曲追加
                    </button>
                    <button
                      onClick={() => setShowBulkAddModal(true)}
                      className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium"
                    >
                      一括追加
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
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className={`absolute left-2 top-2 w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="楽曲名、アーティスト名、ヨミガナ、ジャンル、タグ、メモで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} focus:outline-none focus:ring-2 ${currentTheme.inputFocus} text-sm`}
                  />
                </div>

                {allTags.length > 0 && (
                  <div>
                    <p className={`${currentTheme.text} text-xs font-bold mb-1`}>タグで絞り込み:</p>
                    <div className="flex flex-wrap gap-1">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-purple-500 text-white'
                              : `${isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {selectedTags.length > 0 && (
                        <button
                          onClick={() => setSelectedTags([])}
                          className={`px-2 py-1 rounded text-xs bg-red-500/30 ${currentTheme.text} hover:bg-red-500/50`}
                        >
                          タグクリア
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {allGenres.length > 0 && (
                  <div>
                    <p className={`${currentTheme.text} text-xs font-bold mb-1`}>ジャンルで絞り込み:</p>
                    <div className="flex flex-wrap gap-1">
                      {allGenres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            selectedGenres.includes(genre)
                              ? 'bg-blue-500 text-white'
                              : `${isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                      {selectedGenres.length > 0 && (
                        <button
                          onClick={() => setSelectedGenres([])}
                          className={`px-2 py-1 rounded text-xs bg-red-500/30 ${currentTheme.text} hover:bg-red-500/50`}
                        >
                          ジャンルクリア
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`${currentTheme.card} rounded-lg border overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1600px]">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-50'}`}>
                      {!isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold w-32`}>リクエスト</th>}
                      <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold w-80`}>楽曲名</th>
                      <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold w-56`}>アーティスト</th>
                      <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold w-24`}>ジャンル</th>
                      <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold w-56`}>タグ</th>
                      <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold w-64`}>メモ</th>
                      {isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold w-28`}>YouTube</th>}
                      {isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold w-32`}>管理</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSongs.map((song, index) => (
                      <tr 
                        key={song.id} 
                        className={`border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} ${currentTheme.cardHover} ${
                          index % 2 === 0 ? currentTheme.cardEven : ''
                        }`}
                      >
                        {!isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => copyToClipboard(song)}
                                className={`flex items-center space-x-1 px-3 py-1 rounded text-xs whitespace-nowrap ${
                                  copiedSong === song.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                }`}
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
                          <div className={`${currentTheme.text} font-medium truncate max-w-xs`} title={song.title}>
                            {song.title}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`${currentTheme.textSecondary} truncate max-w-xs`} title={song.artist}>
                            {song.artist}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 ${isDarkMode ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'} rounded text-xs whitespace-nowrap`}>
                            {song.genre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {song.tags && song.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {song.tags.map(tag => (
                                <span key={tag} className={`px-2 py-0.5 ${isDarkMode ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-50 text-purple-700'} rounded text-xs whitespace-nowrap`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className={`${currentTheme.textTertiary} text-xs`}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {song.memo ? (
                            <div className="flex items-center space-x-2 max-w-xs">
                              <FileText className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              <span className={`text-xs truncate ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`} title={song.memo}>
                                {song.memo}
                              </span>
                            </div>
                          ) : (
                            <span className={`${currentTheme.textTertiary} text-xs`}>-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center space-y-1">
                              {song.youtubeUrl ? (
                                <a
                                  href={song.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded text-red-300 transition-colors"
                                  title="YouTubeで開く"
                                >
                                  <Youtube className="w-4 h-4" />
                                </a>
                              ) : (
                                <div className="p-2 bg-gray-500/30 rounded text-gray-400" title="YouTubeリンクなし">
                                  <Youtube className="w-4 h-4" />
                                </div>
                              )}
                              <span className="text-xs text-center">
                                {song.youtubeUrl ? (
                                  <span className={currentTheme.textSecondary}>リンクあり</span>
                                ) : (
                                  <span className={currentTheme.textTertiary}>リンクなし</span>
                                )}
                              </span>
                            </div>
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => openEditModal(song)}
                                className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded text-blue-300 transition-colors"
                                title="編集"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(song)}
                                className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded text-red-300 transition-colors"
                                title="削除"
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
              
              <div className={`text-center py-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} ${currentTheme.textTertiary}`}>
                <p className="text-xs">← 左右にスワイプ/スクロールできます →</p>
              </div>
            </div>

            <div className={`text-center py-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'} ${currentTheme.textTertiary}`}>
              <button
                onClick={() => setShowPrivacy(true)}
                className={`text-xs ${currentTheme.textTertiary} hover:${currentTheme.textSecondary} underline`}
              >
                利用規約・プライバシーポリシー
              </button>
            </div>
          </>
        )}

        {!showMessageEditModal && showPrivacy && (
          <div className={`${currentTheme.card} rounded-lg p-6 border`}>
            <div className="mb-4">
              <button
                onClick={() => setShowPrivacy(false)}
                className={`flex items-center space-x-2 ${currentTheme.textSecondary} hover:${currentTheme.text} text-sm`}
              >
                <span>←</span>
                <span>戻る</span>
              </button>
            </div>
            
            <div className={`${currentTheme.text} space-y-6`}>
              <h2 className="text-xl font-bold">楽曲リクエストアプリ 利用規約・プライバシーポリシー</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">利用規約</h3>
                <div>
                  <h4 className="font-semibold mb-2">第1条（適用）</h4>
                  <p className="text-sm">本規約は、楽曲リクエストアプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg border border-white/20 shadow-lg w-full max-w-sm p-4">
              <h4 className="text-gray-800 font-bold mb-3 text-center">🔒 管理者認証</h4>
              <p className="text-gray-600 text-sm mb-4 text-center">
                管理者モードに切り替えるには<br/>パスワードを入力してください
              </p>
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
                  onClick={handlePasswordCancel}
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
                  onClick={() => deleteSong(deleteConfirm.id)}
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

        {showEditModal && editingSong && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">楽曲名（ふりがな）</label>
                  <input
                    type="text"
                    value={editingSong.titleFurigana}
                    onChange={(e) => setEditingSong({...editingSong, titleFurigana: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="がくきょくめい"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト名（ふりがな）</label>
                  <input
                    type="text"
                    value={editingSong.artistFurigana}
                    onChange={(e) => setEditingSong({...editingSong, artistFurigana: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="あーてぃすとめい"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                  <div className="flex space-x-2">
                    <select
                      value={editingSong.genre}
                      onChange={(e) => setEditingSong({...editingSong, genre: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">ジャンルを選択</option>
                      {availableGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="新しいジャンル"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addGenre(e.target.value.trim());
                          setEditingSong({...editingSong, genre: e.target.value.trim()});
                          e.target.value = '';
                        }
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タグ（スペース区切り）</label>
                  <input
                    type="text"
                    value={editingSong.tags.join(' ')}
                    onChange={(e) => setEditingSong({...editingSong, tags: e.target.value.split(' ').filter(tag => tag.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="バラード ロック"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={editingSong.youtubeUrl}
                    onChange={(e) => setEditingSong({...editingSong, youtubeUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={editingSong.memo}
                    onChange={(e) => setEditingSong({...editingSong, memo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="メモがあれば入力"
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={saveEditedSong}
                  disabled={!editingSong.title || !editingSong.artist}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-sm font-medium"
                >
                  保存
                </button>
                <button
                  onClick={closeEditModal}
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
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">楽曲名（ふりがな）</label>
                  <input
                    type="text"
                    value={newSong.titleFurigana}
                    onChange={(e) => setNewSong({...newSong, titleFurigana: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="がくきょくめい"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">アーティスト名（ふりがな）</label>
                  <input
                    type="text"
                    value={newSong.artistFurigana}
                    onChange={(e) => setNewSong({...newSong, artistFurigana: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="あーてぃすとめい"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                  <div className="flex space-x-2">
                    <select
                      value={newSong.genre}
                      onChange={(e) => setNewSong({...newSong, genre: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">ジャンルを選択</option>
                      {availableGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="新しいジャンル"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addGenre(e.target.value.trim());
                          setNewSong({...newSong, genre: e.target.value.trim()});
                          e.target.value = '';
                        }
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タグ（スペース区切り）</label>
                  <input
                    type="text"
                    value={newSong.tags.join(' ')}
                    onChange={(e) => setNewSong({...newSong, tags: e.target.value.split(' ').filter(tag => tag.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="バラード ロック"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={newSong.youtubeUrl}
                    onChange={(e) => setNewSong({...newSong, youtubeUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={newSong.memo}
                    onChange={(e) => setNewSong({...newSong, memo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="メモがあれば入力"
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={addSong}
                  disabled={!newSong.title || !newSong.artist}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-sm font-medium"
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

        {showBulkAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4">楽曲一括追加</h3>
              
              <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
                <p className="font-medium mb-2">入力形式：</p>
                <p className="mb-1">1行に1曲、楽曲名のみ、または「楽曲名, アーティスト名」で入力してください。</p>
                <p className="text-xs text-gray-600 mt-2">
                  ※アーティスト名を省略した場合は「不明」として登録されます。詳細は編集ボタンで後から設定できます。
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">楽曲データ</label>
                <textarea
                  value={bulkAddText}
                  onChange={(e) => setBulkAddText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  placeholder="例：夜に駆ける, YOASOBI&#10;香水, 瑛人&#10;残酷な天使のテーゼ, 高橋洋子"
                  rows="8"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addBulkSongs}
                  disabled={!bulkAddText.trim()}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded text-sm font-medium"
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
      </div>
    </div>
  );
}
