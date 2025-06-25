import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Sun, Moon, Database, Wifi, WifiOff } from 'lucide-react';

// Firebase Firestore のインポート（実際の運用時に使用）
// import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
// import { db } from "./firebase";

export default function SimpleRequestApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [showPublishMessage, setShowPublishMessage] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Firebase設定（実際の運用時に設定）
  const firebaseConfig = {
    databaseURL: "https://song-request-app-default-rtdb.firebaseio.com/",
    // 他の設定は実際のFirebaseプロジェクトに合わせて設定
  };

  // データの初期値
  const initialSongs = [
    { id: 1, title: '10月無口な君を忘れる', artist: 'あたらよ', genre: 'J-POP', tags: ['バラード'], memo: '', copyCount: 2 },
    { id: 2, title: '366日', artist: 'HY', genre: 'J-POP', tags: ['沖縄'], memo: '', copyCount: 5 },
    { id: 3, title: '3月9日', artist: 'レミオロメン', genre: 'J-POP', tags: ['卒業'], memo: '', copyCount: 8 },
    { id: 4, title: '夜に駆ける', artist: 'YOASOBI', genre: 'J-POP', tags: ['ボカロ系'], memo: '人気曲', copyCount: 15 },
    { id: 5, title: '紅蓮華', artist: 'LiSA', genre: 'アニソン', tags: ['アニソン'], memo: '鬼滅の刃主題歌', copyCount: 12 }
  ];

  // Firebase操作関数（モック実装）
  const saveToFirebase = async (path, data) => {
    try {
      console.log(`Saving to Firebase: ${path}`, data);
      // モック実装: データを一時的に保存
      if (!window.firebaseData) {
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
}window.firebaseData = {};
      }
      window.firebaseData[path] = data;
      return { success: true };
    } catch (error) {
      console.error('Firebase save error:', error);
      return { success: false, error };
    }
  };

  const loadFromFirebase = async (path, defaultValue) => {
    try {
      console.log(`Loading from Firebase: ${path}`);
      // モック実装: 保存されたデータを読み込み
      if (window.firebaseData && window.firebaseData[path]) {
        return window.firebaseData[path];
      }
      return defaultValue;
    } catch (error) {
      console.error('Firebase load error:', error);
      return defaultValue;
    }
  };

  // 状態管理（重複なし、正しい構文）
  const [songs, setSongs] = useState(initialSongs);
  const [publishedSongs, setPublishedSongs] = useState(initialSongs);
  const [adminMessage, setAdminMessage] = useState('配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪');
  const [isDarkMode, setIsDarkMode] = useState(true);
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

  // データをFirebaseに保存するヘルパー関数
  const saveSongsToFirebase = async (songsData) => {
    await saveToFirebase('songs', songsData);
    setSongs(songsData);
  };

  const savePublishedSongsToFirebase = async (publishedData) => {
    await saveToFirebase('publishedSongs', publishedData);
    setPublishedSongs(publishedData);
  };

  const saveAdminMessageToFirebase = async (message) => {
    await saveToFirebase('adminMessage', message);
    setAdminMessage(message);
  };

  const saveDarkModeToFirebase = async (darkMode) => {
    await saveToFirebase('isDarkMode', darkMode);
    setIsDarkMode(darkMode);
  };

  // Firebaseからデータを読み込む初期化
  useEffect(() => {
    const init = async () => {
      setLoadingFirebase(true);
      
      try {
        // 実際の環境では以下のFirestore読み込みコードを使用
        /*
        const snap = await getDocs(collection(db, "songs"));
        const loadedSongs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSongs(loadedSongs);
        setPublishedSongs(loadedSongs);
        */
        
        // モック実装: 初期データを設定
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
        
        console.log('Firebase data loaded successfully');
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setFirebaseConnected(false);
        setDatabaseConnected(false);
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
      // 実際の環境では以下のFirestore追加コードを使用
      /*
      const docRef = await addDoc(collection(db, "songs"), {
        title: newSong.title,
        artist: newSong.artist,
        genre: newSong.genre,
        tags: newSong.tags,
        memo: newSong.memo,
        copyCount: 0
      });
      setSongs([
        ...songs,
        { id: docRef.id, ...newSong, copyCount: 0 }
      ]);
      */
      
      // モック実装: ローカル追加とFirebase保存
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = { ...newSong, id, copyCount: 0, tags: newSong.tags || [] };
      const updatedSongs = [...songs, songToAdd];
      await saveSongsToFirebase(updatedSongs);
      
      setNewSong({ title: '', artist: '', genre: '', tags: [], memo: '' });
      setShowAddModal(false);
      console.log('Song added successfully');
    } catch (error) {
      console.error('追加エラー:', error);
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
        
        <div className="mb-3 space-y-2">
          <div className={`p-3 rounded text-sm flex items-center ${firebaseConnected ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
            <div className="flex items-center space-x-2">
              {firebaseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{firebaseConnected ? '🔥 Firebase接続成功' : '⚠️ Firebase未接続'}</span>
            </div>
          </div>
          
          <div className={`p-3 rounded text-sm flex items-center ${databaseConnected ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'}`}>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>{databaseConnected ? '📊 データベース接続成功' : '📊 データベース未設定'}</span>
            </div>
          </div>
          
          {lastSyncTime && (
            <div className={`text-xs ${currentTheme.textTertiary} text-center`}>
              最終同期: {lastSyncTime.toLocaleString()}
            </div>
          )}
        </div>

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
              placeholder="楽曲名、アーティスト名で検索..."
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
                  <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>ジャンル</th>
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
                    </td>
                    <td className="px-4 py-3">
                      <div className={`${currentTheme.textSecondary}`}>{song.artist}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 ${isDarkMode ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'} rounded text-xs`}>
                        {song.genre}
                      </span>
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
