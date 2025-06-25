import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Youtube, FileText, Sun, Moon, Plus, Upload, Database, Wifi, WifiOff } from 'lucide-react';

// Firebase設定とインポート（実際の運用時に使用）
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Firebase機能のモック（Claude.ai環境用）
const mockFirebase = {
  database: {
    ref: (path) => ({
      push: () => ({ key: `mock-${Date.now()}-${Math.random()}` }),
      set: (data) => Promise.resolve(data),
      update: (data) => Promise.resolve(data),
      remove: () => Promise.resolve(),
      on: (event, callback) => {
        // モックデータでコールバックを呼び出す
        setTimeout(() => {
          if (path === '.info/connected') {
            callback({ val: () => true });
          }
        }, 100);
      },
      once: (event) => Promise.resolve({ val: () => null })
    })
  },
  initializeApp: (config) => console.log('Firebase initialized with config:', config),
  connectDatabaseEmulator: (db, host, port) => console.log(`Connected to emulator at ${host}:${port}`)
};

export default function SimpleRequestApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Firebase/Database状態
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [showPublishMessage, setShowPublishMessage] = useState(false);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [songs, setSongs] = useState([
    { id: 1, title: '10月無口な君を忘れる', titleFurigana: 'じゅうがつむくちなきみをわすれる', artist: 'あたらよ', artistFurigana: 'あたらよ', genre: 'J-POP', tags: ['バラード'], youtubeUrl: 'https://www.youtube.com/watch?v=example1', memo: '', copyCount: 2 },
    { id: 2, title: '366日', titleFurigana: 'さんびゃくろくじゅうろくにち', artist: 'HY', artistFurigana: 'エイチワイ', genre: 'J-POP', tags: ['沖縄'], youtubeUrl: '', memo: '', copyCount: 5 },
    { id: 3, title: '3月9日', titleFurigana: 'さんがつここのか', artist: 'レミオロメン', artistFurigana: 'レミオロメン', genre: 'J-POP', tags: ['卒業'], youtubeUrl: 'https://www.youtube.com/watch?v=example3', memo: '', copyCount: 8 },
    { id: 4, title: '夜に駆ける', titleFurigana: 'よるにかける', artist: 'YOASOBI', artistFurigana: 'ヨアソビ', genre: 'J-POP', tags: ['ボカロ系'], youtubeUrl: '', memo: '人気曲', copyCount: 15 },
    { id: 5, title: '紅蓮華', titleFurigana: 'ぐれんげ', artist: 'LiSA', artistFurigana: 'リサ', genre: 'アニソン', tags: ['アニソン'], youtubeUrl: 'https://www.youtube.com/watch?v=example5', memo: '鬼滅の刃主題歌', copyCount: 12 },
    { id: 6, title: 'Pretender', titleFurigana: 'プリテンダー', artist: 'Official髭男dism', artistFurigana: 'オフィシャルひげだんディズム', genre: 'J-POP', tags: ['ロック'], youtubeUrl: '', memo: '', copyCount: 10 }
  ]);

  const [adminMessage, setAdminMessage] = useState('配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSong, setCopiedSong] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showMessageEditModal, setShowMessageEditModal] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [tempAdminMessage, setTempAdminMessage] = useState('');
  
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
  
  const [publishedSongs, setPublishedSongs] = useState([...songs]);
  const [availableGenres] = useState(['J-POP', 'アニソン', 'ロック', 'バラード', '演歌', 'クラシック', 'ポップス', 'フォーク']);

  // Firebase設定状態
  const [firebaseConfigData, setFirebaseConfigData] = useState({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  // データベース設定状態
  const [databaseConfigData, setDatabaseConfigData] = useState({
    type: 'firebase', // firebase, mysql, postgresql, mongodb
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });

  // テーマカラー設定
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

  // Firebase初期化
  useEffect(() => {
    initializeFirebase();
  }, []);

  const initializeFirebase = async () => {
    try {
      setLoadingFirebase(true);
      console.log('Firebase初期化開始...');
      
      // 実際の環境では以下のコードを使用
      /*
      const { initializeApp } = await import('firebase/app');
      const { getDatabase, ref, onValue, set, push, update, remove, connectDatabaseEmulator } = await import('firebase/database');
      
      const app = initializeApp(firebaseConfig);
      const database = getDatabase(app);
      
      // 開発環境でエミュレータを使用する場合
      if (process.env.NODE_ENV === 'development') {
        connectDatabaseEmulator(database, 'localhost', 9000);
      }
      */
      
      // Claude.ai環境用のモック実装
      await new Promise(resolve => setTimeout(resolve, 1000)); // 接続待機をシミュレート
      
      // 接続状態の監視をシミュレート
      setTimeout(() => {
        setFirebaseConnected(true);
        setDatabaseConnected(true);
        setLastSyncTime(new Date());
        setLoadingFirebase(false);
        console.log('Firebase接続成功（モック）');
      }, 500);

      // 楽曲データの監視をシミュレート
      // 実際の環境では onValue を使用
      /*
      const songsRef = ref(database, 'songs');
      onValue(songsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const songsArray = Object.keys(data).map(key => ({
            firebaseKey: key,
            ...data[key]
          }));
          setSongs(songsArray);
        }
      });
      */

    } catch (error) {
      console.error('Firebase初期化エラー:', error);
      setFirebaseConnected(false);
      setDatabaseConnected(false);
      setLoadingFirebase(false);
      
      // リトライ機能
      if (connectionRetries < 3) {
        setTimeout(() => {
          setConnectionRetries(prev => prev + 1);
          initializeFirebase();
        }, 2000);
      }
    }
  };

  // データベース接続関数
  const connectToDatabase = async (config) => {
    try {
      console.log(`${config.type}データベースに接続中...`);
      
      // 実際の環境では以下のようなデータベース接続を実装
      /*
      switch (config.type) {
        case 'mysql':
          // MySQL接続（mysql2ライブラリが必要）
          // npm install mysql2
          break;
          
        case 'postgresql':
          // PostgreSQL接続（pgライブラリが必要）
          // npm install pg
          break;
          
        case 'mongodb':
          // MongoDB接続（mongodbライブラリが必要）
          // npm install mongodb
          break;
      }
      */
      
      // Claude.ai環境用のモック
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDatabaseConnected(true);
      console.log(`${config.type}データベース接続成功（モック）`);
      
    } catch (error) {
      console.error('データベース接続エラー:', error);
      setDatabaseConnected(false);
    }
  };

  // 計算されたプロパティ
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

  // 楽曲をクリップボードにコピー
  const copyToClipboard = async (song) => {
    const requestText = `♪ ${song.title} - ${song.artist}`;
    try {
      await navigator.clipboard.writeText(requestText);
      setCopiedSong(song.id);
      
      // Firebaseまたはデータベースでカウントを更新
      try {
        if (firebaseConnected && song.firebaseKey) {
          // 実際の環境では Firebase の update を使用
          // await update(ref(database, `songs/${song.firebaseKey}`), { copyCount: (song.copyCount || 0) + 1 });
          console.log('Firebase更新（モック）:', song.title);
        } else if (databaseConnected) {
          // 実際の環境では SQL UPDATE文を実行
          // await executeQuery('UPDATE songs SET copy_count = copy_count + 1 WHERE id = ?', [song.id]);
          console.log('データベース更新（モック）:', song.title);
        }
        
        // ローカル状態も更新
        if (isAdmin) {
          setSongs(songs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
        } else {
          setPublishedSongs(publishedSongs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
        }
      } catch (error) {
        console.error('カウント更新エラー:', error);
        // エラーの場合はローカル状態のみ更新
        if (isAdmin) {
          setSongs(songs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
        } else {
          setPublishedSongs(publishedSongs.map(s => s.id === song.id ? {...s, copyCount: (s.copyCount || 0) + 1} : s));
        }
      }
      
      setTimeout(() => setCopiedSong(null), 2000);
    } catch (err) {
      setCopiedSong(song.id);
      setTimeout(() => setCopiedSong(null), 2000);
    }
  };

  // 管理者モード切り替え
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

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // タグ・ジャンル選択
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

  // 楽曲削除
  const deleteSong = async (songToDelete) => {
    try {
      if (firebaseConnected && songToDelete.firebaseKey) {
        // 実際の環境では Firebase の remove を使用
        // await remove(ref(database, `songs/${songToDelete.firebaseKey}`));
        console.log('Firebase削除（モック）:', songToDelete.title);
      } else if (databaseConnected) {
        // 実際の環境では SQL DELETE文を実行
        // await executeQuery('DELETE FROM songs WHERE id = ?', [songToDelete.id]);
        console.log('データベース削除（モック）:', songToDelete.title);
      }
      
      setSongs(songs.filter(song => song.id !== songToDelete.id));
    } catch (error) {
      console.error('削除エラー:', error);
      setSongs(songs.filter(song => song.id !== songToDelete.id));
    }
    setDeleteConfirm(null);
  };

  // 楽曲編集
  const openEditModal = (song) => {
    setEditingSong({
      id: song.id,
      firebaseKey: song.firebaseKey,
      title: song.title,
      titleFurigana: song.titleFurigana || '',
      artist: song.artist,
      artistFurigana: song.artistFurigana || '',
      genre: song.genre || '',
      tags: song.tags || [],
      youtubeUrl: song.youtubeUrl || '',
      memo: song.memo || '',
      copyCount: song.copyCount || 0
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSong(null);
  };

  const saveEditedSong = async () => {
    if (!editingSong.title || !editingSong.artist) return;
    
    try {
      if (firebaseConnected && editingSong.firebaseKey) {
        // 実際の環境では Firebase の update を使用
        // const { firebaseKey, ...songData } = editingSong;
        // await update(ref(database, `songs/${firebaseKey}`), songData);
        console.log('Firebase更新（モック）:', editingSong.title);
      } else if (databaseConnected) {
        // 実際の環境では SQL UPDATE文を実行
        // const query = 'UPDATE songs SET title = ?, artist = ?, genre = ?, tags = ?, youtube_url = ?, memo = ? WHERE id = ?';
        // await executeQuery(query, [editingSong.title, editingSong.artist, editingSong.genre, JSON.stringify(editingSong.tags), editingSong.youtubeUrl, editingSong.memo, editingSong.id]);
        console.log('データベース更新（モック）:', editingSong.title);
      }
      
      setSongs(songs.map(song => 
        song.id === editingSong.id 
          ? { ...song, ...editingSong, tags: editingSong.tags || [] }
          : song
      ));
    } catch (error) {
      console.error('更新エラー:', error);
      setSongs(songs.map(song => 
        song.id === editingSong.id 
          ? { ...song, ...editingSong, tags: editingSong.tags || [] }
          : song
      ));
    }
    
    closeEditModal();
  };

  // 楽曲追加
  const addSong = async () => {
    if (!newSong.title || !newSong.artist) return;
    
    try {
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = {
        ...newSong,
        id,
        copyCount: 0,
        tags: newSong.tags.length > 0 ? newSong.tags : []
      };
      
      if (firebaseConnected) {
        // 実際の環境では Firebase の push と set を使用
        // const newSongRef = push(ref(database, 'songs'));
        // await set(newSongRef, songToAdd);
        // songToAdd.firebaseKey = newSongRef.key;
        console.log('Firebase追加（モック）:', newSong.title);
      } else if (databaseConnected) {
        // 実際の環境では SQL INSERT文を実行
        // const query = 'INSERT INTO songs (title, artist, genre, tags, youtube_url, memo, copy_count) VALUES (?, ?, ?, ?, ?, ?, ?)';
        // await executeQuery(query, [songToAdd.title, songToAdd.artist, songToAdd.genre, JSON.stringify(songToAdd.tags), songToAdd.youtubeUrl, songToAdd.memo, songToAdd.copyCount]);
        console.log('データベース追加（モック）:', newSong.title);
      }
      
      setSongs([...songs, songToAdd]);
    } catch (error) {
      console.error('追加エラー:', error);
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = {
        ...newSong,
        id,
        copyCount: 0,
        tags: newSong.tags.length > 0 ? newSong.tags : []
      };
      setSongs([...songs, songToAdd]);
    }
    
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

  // 一括追加
  const addBulkSongs = async () => {
    if (!bulkAddText.trim()) return;
    
    const lines = bulkAddText.trim().split('\n');
    const newSongs = [];
    let maxId = Math.max(...songs.map(s => s.id), 0);
    
    try {
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
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
            if (firebaseConnected) {
              // 実際の環境では Firebase の push と set を使用
              // const newSongRef = push(ref(database, 'songs'));
              // await set(newSongRef, song);
              // song.firebaseKey = newSongRef.key;
            } else if (databaseConnected) {
              // 実際の環境では SQL INSERT文を実行
              // const query = 'INSERT INTO songs (title, artist, genre, tags, youtube_url, memo, copy_count) VALUES (?, ?, ?, ?, ?, ?, ?)';
              // await executeQuery(query, [song.title, song.artist, song.genre, JSON.stringify(song.tags), song.youtubeUrl, song.memo, song.copyCount]);
            }
            newSongs.push(song);
          }
        }
      }
      
      if (newSongs.length > 0) {
        setSongs([...songs, ...newSongs]);
        console.log(`一括追加成功（モック）: ${newSongs.length}曲`);
      }
    } catch (error) {
      console.error('一括追加エラー:', error);
      if (newSongs.length > 0) {
        setSongs([...songs, ...newSongs]);
      }
    }
    
    setBulkAddText('');
    setShowBulkAddModal(false);
  };

  // 楽曲公開
  const publishSongs = async () => {
    try {
      if (firebaseConnected) {
        // 実際の環境では Firebase の set を使用
        // await set(ref(database, 'publishedSongs'), null);
        // for (const song of songs) {
        //   const newPublishedRef = push(ref(database, 'publishedSongs'));
        //   const { firebaseKey, ...songData } = song;
        //   await set(newPublishedRef, songData);
        // }
        console.log('Firebase公開（モック）');
      } else if (databaseConnected) {
        // 実際の環境では SQL を使用
        // await executeQuery('UPDATE songs SET published = 1');
        console.log('データベース公開（モック）');
      }
      
      setPublishedSongs([...songs]);
      setLastSyncTime(new Date());
      setShowPublishMessage(true);
      setTimeout(() => setShowPublishMessage(false), 3000);
    } catch (error) {
      console.error('公開エラー:', error);
      setPublishedSongs([...songs]);
    }
  };

  // 管理者メッセージ編集
  const editAdminMessage = () => {
    setTempAdminMessage(adminMessage);
    setShowMessageEditModal(true);
  };

  const saveAdminMessage = async () => {
    try {
      if (firebaseConnected) {
        // 実際の環境では Firebase の set を使用
        // await set(ref(database, 'adminMessage'), tempAdminMessage);
        console.log('Firebaseメッセージ更新（モック）');
      } else if (databaseConnected) {
        // 実際の環境では SQL UPDATE文を実行
        // await executeQuery('UPDATE settings SET value = ? WHERE key = ?', [tempAdminMessage, 'admin_message']);
        console.log('データベースメッセージ更新（モック）');
      }
      
      setAdminMessage(tempAdminMessage);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('メッセージ更新エラー:', error);
      setAdminMessage(tempAdminMessage);
    }
    setShowMessageEditModal(false);
  };

  // タグの追加/削除
  const addTagToNewSong = (tag) => {
    if (!newSong.tags.includes(tag)) {
      setNewSong({...newSong, tags: [...newSong.tags, tag]});
    }
  };

  const removeTagFromNewSong = (tagToRemove) => {
    setNewSong({...newSong, tags: newSong.tags.filter(tag => tag !== tagToRemove)});
  };

  const addTagToEditingSong = (tag) => {
    if (!editingSong.tags.includes(tag)) {
      setEditingSong({...editingSong, tags: [...editingSong.tags, tag]});
    }
  };

  const removeTagFromEditingSong = (tagToRemove) => {
    setEditingSong({...editingSong, tags: editingSong.tags.filter(tag => tag !== tagToRemove)});
  };

  // Firebase設定保存
  const saveFirebaseConfig = async () => {
    try {
      // 実際の環境では設定を保存
      console.log('Firebase設定保存:', firebaseConfigData);
      setShowFirebaseConfig(false);
      
      // 新しい設定で再初期化
      await initializeFirebase();
    } catch (error) {
      console.error('Firebase設定保存エラー:', error);
    }
  };

  // データベース設定保存
  const saveDatabaseConfig = async () => {
    try {
      // 実際の環境では設定を保存
      console.log('データベース設定保存:', databaseConfigData);
      setShowDatabaseConfig(false);
      
      // 新しい設定で接続
      await connectToDatabase(databaseConfigData);
    } catch (error) {
      console.error('データベース設定保存エラー:', error);
    }
  };
