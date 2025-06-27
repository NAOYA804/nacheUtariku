import React, { useState, useEffect } from 'react';
import { Music, Search, Edit, Trash2, Copy, MessageSquare, Check, Sun, Moon, Database, Wifi, WifiOff, Star, StarOff, BarChart3, Download, Upload, Filter, SortAsc, SortDesc, Heart, Clock, TrendingUp, PieChart, Calendar, Users } from 'lucide-react';

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

export default function EnhancedMusicRequestApp() {
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

  // 新機能：表示モード
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card' | 'stats'
  const [sortBy, setSortBy] = useState('title'); // 'title' | 'artist' | 'copyCount' | 'rating' | 'createdAt'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [filterGenre, setFilterGenre] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 新機能：統計とプレイリスト
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([
    { id: 1, name: '人気楽曲', songs: [], description: '最もリクエストされた楽曲' },
    { id: 2, name: 'バラード集', songs: [], description: 'しっとりとしたバラード楽曲' }
  ]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  // データの初期値（強化版：お気に入り、評価、キー情報、プレイリスト対応）
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
      isFavorite: false,
      rating: 4,
      key: 'C',
      difficulty: 3,
      duration: '4:15',
      createdAt: new Date('2024-01-15'),
      lastRequested: new Date('2024-06-20')
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
      isFavorite: true,
      rating: 5,
      key: 'G',
      difficulty: 2,
      duration: '5:22',
      createdAt: new Date('2024-01-20'),
      lastRequested: new Date('2024-06-25')
    },
    { 
      id: 3, 
      title: '3月9日', 
      artist: 'レミオロメン', 
      reading: 'さんがつここのか', 
      genre: 'J-POP', 
      tags: ['卒業'], 
      memo: '', 
      copyCount: 8,
      isFavorite: false,
      rating: 4,
      key: 'D',
      difficulty: 2,
      duration: '5:03',
      createdAt: new Date('2024-02-01'),
      lastRequested: new Date('2024-06-27')
    },
    { 
      id: 4, 
      title: '夜に駆ける', 
      artist: 'YOASOBI', 
      reading: 'よるにかける', 
      genre: 'J-POP', 
      tags: ['ボカロ系'], 
      memo: '人気曲', 
      copyCount: 15,
      isFavorite: true,
      rating: 5,
      key: 'Am',
      difficulty: 4,
      duration: '4:23',
      createdAt: new Date('2024-02-10'),
      lastRequested: new Date('2024-06-27')
    },
    { 
      id: 5, 
      title: '紅蓮華', 
      artist: 'LiSA', 
      reading: 'ぐれんげ', 
      genre: 'アニソン', 
      tags: ['アニソン'], 
      memo: '鬼滅の刃主題歌', 
      copyCount: 12,
      isFavorite: false,
      rating: 5,
      key: 'Em',
      difficulty: 5,
      duration: '4:04',
      createdAt: new Date('2024-02-15'),
      lastRequested: new Date('2024-06-26')
    }
  ];

  // Firebase Firestore操作関数（既存機能保持）
  const saveToFirebase = async (path, data) => {
    try {
      if (!window.firebaseData) {
        window.firebaseData = {};
      }
      window.firebaseData[path] = data;
      console.log(`[Firebase] Document written to ${path}:`, data);
      return { success: true };
    } catch (error) {
      console.error('Firebase save error:', error);
      return { success: false, error };
    }
  };

  const loadFromFirebase = async (path, defaultValue) => {
    try {
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

  // 楽曲データ状態（既存機能保持）
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
    memo: '',
    key: '',
    difficulty: 1,
    duration: '',
    rating: 0
  });
  const [availableGenres] = useState(['J-POP', 'アニソン', 'ロック', 'バラード', '演歌', 'クラシック', 'ボカロ', 'インスト']);

  // テーマ設定（既存機能保持）
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

  // データをFirebaseに保存するヘルパー関数（既存機能保持）
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

  // 新機能：プレイリスト保存
  const savePlaylistsToFirebase = async (playlistData) => {
    try {
      await saveToFirebase('playlists', playlistData);
      setPlaylists(playlistData);
      console.log('Playlists saved:', playlistData);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  // 初期化（既存機能保持 + 新機能追加）
  useEffect(() => {
    const init = async () => {
      setLoadingFirebase(true);
      
      try {
        const [loadedSongs, loadedPublished, loadedMessage, loadedDarkMode, loadedPlaylists] = await Promise.all([
          loadFromFirebase('songs', initialSongs),
          loadFromFirebase('publishedSongs', initialSongs),
          loadFromFirebase('adminMessage', '配信をご視聴いただき、ありがとうございます！リクエストお待ちしております♪'),
          loadFromFirebase('isDarkMode', true),
          loadFromFirebase('playlists', playlists)
        ]);

        setSongs(loadedSongs);
        setPublishedSongs(loadedPublished);
        setAdminMessage(loadedMessage);
        setIsDarkMode(loadedDarkMode);
        setPlaylists(loadedPlaylists);

        setFirebaseConnected(true);
        setDatabaseConnected(true);
        setLastSyncTime(new Date());
        
        console.log('[Firebase] Initialization completed successfully');
      } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        setFirebaseConnected(false);
        setDatabaseConnected(false);
        
        setSongs(initialSongs);
        setPublishedSongs(initialSongs);
      }
      
      setLoadingFirebase(false);
    };
    
    init();
  }, []);

  // 計算プロパティ（強化版）
  const displayedSongs = isAdmin ? songs : publishedSongs;
  const topSongs = displayedSongs.filter(song => song.copyCount > 0).sort((a, b) => b.copyCount - a.copyCount).slice(0, 3);
  
  // 強化された検索・フィルター・ソート機能
  const getFilteredAndSortedSongs = () => {
    let filtered = displayedSongs.filter(song => {
      const matchesSearch = searchTerm === '' || 
             song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
             song.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (song.reading && song.reading.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (song.tags && song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
             (song.memo && song.memo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGenre = filterGenre === '' || song.genre === filterGenre;
      const matchesRating = filterRating === 0 || song.rating >= filterRating;
      const matchesFavorites = !showFavoritesOnly || song.isFavorite;
      
      return matchesSearch && matchesGenre && matchesRating && matchesFavorites;
    });

    // ソート機能
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
        case 'copyCount':
          aValue = a.copyCount || 0;
          bValue = b.copyCount || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
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

  // 統計データ計算
  const getStatistics = () => {
    const total = displayedSongs.length;
    const totalRequests = displayedSongs.reduce((sum, song) => sum + (song.copyCount || 0), 0);
    const averageRating = displayedSongs.reduce((sum, song) => sum + (song.rating || 0), 0) / total;
    const favoriteCount = displayedSongs.filter(song => song.isFavorite).length;
    
    const genreStats = {};
    displayedSongs.forEach(song => {
      genreStats[song.genre] = (genreStats[song.genre] || 0) + 1;
    });

    return {
      total,
      totalRequests,
      averageRating: averageRating.toFixed(1),
      favoriteCount,
      genreStats
    };
  };

  // イベントハンドラー（既存機能保持）
  const copyToClipboard = async (song) => {
    const requestText = `♪ ${song.title} - ${song.artist}`;
    try {
      await navigator.clipboard.writeText(requestText);
      setCopiedSong(song.id);
      
      if (isAdmin) {
        const updatedSongs = songs.map(s => s.id === song.id ? {
          ...s, 
          copyCount: (s.copyCount || 0) + 1,
          lastRequested: new Date()
        } : s);
        await saveSongsToFirebase(updatedSongs);
      } else {
        const updatedPublished = publishedSongs.map(s => s.id === song.id ? {
          ...s, 
          copyCount: (s.copyCount || 0) + 1,
          lastRequested: new Date()
        } : s);
        await savePublishedSongsToFirebase(updatedPublished);
      }
      
      setTimeout(() => setCopiedSong(null), 2000);
    } catch (err) {
      setCopiedSong(song.id);
      setTimeout(() => setCopiedSong(null), 2000);
    }
  };

  // 新機能：お気に入り機能
  const toggleFavorite = async (songId) => {
    const updatedSongs = songs.map(song => 
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
    );
    await saveSongsToFirebase(updatedSongs);
  };

  // 新機能：評価機能
  const updateRating = async (songId, rating) => {
    const updatedSongs = songs.map(song => 
      song.id === songId ? { ...song, rating } : song
    );
    await saveSongsToFirebase(updatedSongs);
  };

  // 新機能：CSVエクスポート
  const exportToCSV = () => {
    const headers = ['楽曲名', 'アーティスト', '読み仮名', 'ジャンル', 'タグ', 'キー', '難易度', '時間', '評価', 'リクエスト回数', 'お気に入り'];
    const csvData = displayedSongs.map(song => [
      song.title,
      song.artist,
      song.reading || '',
      song.genre,
      (song.tags || []).join(';'),
      song.key || '',
      song.difficulty || '',
      song.duration || '',
      song.rating || '',
      song.copyCount || 0,
      song.isFavorite ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'songs_export.csv';
    link.click();
  };

  // 既存のイベントハンドラー（保持）
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
      const id = Math.max(...songs.map(s => s.id), 0) + 1;
      const songToAdd = { 
        ...newSong, 
        id, 
        copyCount: 0, 
        tags: newSong.tags || [],
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedSongs = [...songs, songToAdd];
      await saveSongsToFirebase(updatedSongs);
      
      setNewSong({ 
        title: '', 
        artist: '', 
        reading: '', 
        genre: '', 
        tags: [], 
        memo: '',
        key: '',
        difficulty: 1,
        duration: '',
        rating: 0
      });
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

  // 星評価コンポーネント
  const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'w-4 h-4' }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && onRatingChange && onRatingChange(star)}
            disabled={readOnly}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star 
              className={`${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  // 難易度表示コンポーネント
  const DifficultyDisplay = ({ difficulty }) => {
    const colors = ['text-green-400', 'text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-2 h-2 rounded-full ${level <= difficulty ? colors[difficulty - 1] : 'bg-gray-400'}`}
          />
        ))}
      </div>
    );
  };

  // カード表示コンポーネント
  const SongCard = ({ song }) => (
    <div className={`${currentTheme.card} rounded-lg p-4 border ${currentTheme.cardHover} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`${currentTheme.text} font-medium mb-1`}>{song.title}</h3>
          {song.reading && (
            <p className={`${currentTheme.textTertiary} text-xs mb-1`}>{song.reading}</p>
          )}
          <p className={`${currentTheme.textSecondary} text-sm`}>{song.artist}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => toggleFavorite(song.id)}
            className={`p-1 rounded transition-colors ${song.isFavorite ? 'text-red-400' : 'text-gray-400'}`}
          >
            <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        <span className={`px-2 py-1 ${isDarkMode ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-100 text-purple-800'} rounded text-xs`}>
          {song.genre}
        </span>
        {song.tags && song.tags.map((tag, index) => (
          <span key={index} className={`px-2 py-1 ${isDarkMode ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-100 text-blue-800'} rounded text-xs`}>
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        {song.key && (
          <div className={`${currentTheme.textTertiary}`}>
            キー: <span className={`${currentTheme.textSecondary}`}>{song.key}</span>
          </div>
        )}
        {song.duration && (
          <div className={`${currentTheme.textTertiary}`}>
            時間: <span className={`${currentTheme.textSecondary}`}>{song.duration}</span>
          </div>
        )}
        {song.difficulty && (
          <div className={`${currentTheme.textTertiary} flex items-center space-x-2`}>
            <span>難易度:</span>
            <DifficultyDisplay difficulty={song.difficulty} />
          </div>
        )}
        <div className={`${currentTheme.textTertiary} flex items-center space-x-2`}>
          <span>評価:</span>
          <StarRating 
            rating={song.rating || 0} 
            onRatingChange={isAdmin ? (rating) => updateRating(song.id, rating) : null}
            readOnly={!isAdmin}
            size="w-3 h-3"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {!isAdmin ? (
          <button
            onClick={() => copyToClipboard(song)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-xs flex-1 justify-center ${copiedSong === song.id ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}
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
        ) : (
          <div className="flex space-x-2 flex-1">
            <button
              onClick={() => {
                setEditingSong(song);
                setShowEditModal(true);
              }}
              className="flex-1 p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded text-blue-300 transition-colors"
            >
              <Edit className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => setDeleteConfirm(song)}
              className="flex-1 p-2 bg-red-500/30 hover:bg-red-500/50 rounded text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        )}
        
        {song.copyCount > 0 && (
          <div className={`${currentTheme.textTertiary} text-xs ml-2`}>
            {song.copyCount}回
          </div>
        )}
      </div>
    </div>
  );

  // 統計モーダル
  const StatsModal = () => {
    const stats = getStatistics();
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
              楽曲統計
            </h3>
            <button
              onClick={() => setShowStatsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
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
                
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">キー</label>
                    <input
                      type="text"
                      value={newSong.key || ''}
                      onChange={(e) => setNewSong({...newSong, key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="C, Am など"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">難易度 (1-5)</label>
                    <select
                      value={newSong.difficulty || 1}
                      onChange={(e) => setNewSong({...newSong, difficulty: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>★{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                    <input
                      type="text"
                      value={newSong.duration || ''}
                      onChange={(e) => setNewSong({...newSong, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="4:23"
                    />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">評価</label>
                  <div className="flex items-center space-x-2">
                    <StarRating 
                      rating={newSong.rating || 0} 
                      onRatingChange={(rating) => setNewSong({...newSong, rating})}
                    />
                    <span className="text-sm text-gray-600">{newSong.rating || 0}/5</span>
                  </div>
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
                
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">キー</label>
                    <input
                      type="text"
                      value={editingSong.key || ''}
                      onChange={(e) => setEditingSong({...editingSong, key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="C, Am など"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">難易度 (1-5)</label>
                    <select
                      value={editingSong.difficulty || 1}
                      onChange={(e) => setEditingSong({...editingSong, difficulty: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>★{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                    <input
                      type="text"
                      value={editingSong.duration || ''}
                      onChange={(e) => setEditingSong({...editingSong, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="4:23"
                    />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">評価</label>
                  <div className="flex items-center space-x-2">
                    <StarRating 
                      rating={editingSong.rating || 0} 
                      onRatingChange={(rating) => setEditingSong({...editingSong, rating})}
                    />
                    <span className="text-sm text-gray-600">{editingSong.rating || 0}/5</span>
                  </div>
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
}="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">総楽曲数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalRequests}</div>
              <div className="text-sm text-green-800">総リクエスト数</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
              <div className="text-sm text-yellow-800">平均評価</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.favoriteCount}</div>
              <div className="text-sm text-red-800">お気に入り数</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3">ジャンル別分布</h4>
            <div className="space-y-2">
              {Object.entries(stats.genreStats).map(([genre, count]) => (
                <div key={genre} className="flex items-center justify-between">
                  <span className="text-gray-700">{genre}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{width: `${(count / stats.total) * 100}%`}}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3">人気楽曲 TOP5</h4>
            <div className="space-y-2">
              {displayedSongs
                .filter(song => song.copyCount > 0)
                .sort((a, b) => b.copyCount - a.copyCount)
                .slice(0, 5)
                .map((song, index) => (
                  <div key={song.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg text-gray-500">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-gray-800">{song.title}</div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={song.rating || 0} readOnly size="w-3 h-3" />
                      <span className="text-sm text-gray-600">{song.copyCount}回</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              <Download className="w-4 h-4" />
              <span>CSVエクスポート</span>
            </button>
          </div>
        </div>
      </div>
    );
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
              {/* 新機能：統計ボタン */}
              <button
                onClick={() => setShowStatsModal(true)}
                className={`p-2 ${isDarkMode ? 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-300' : 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-600'} rounded transition-colors`}
                title="統計を表示"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              
              {/* 新機能：表示モード切り替え */}
              <div className="flex rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 text-xs ${viewMode === 'table' ? 'bg-purple-500 text-white' : 'bg-gray-500/30 text-gray-400'} transition-colors`}
                >
                  テーブル
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 text-xs ${viewMode === 'card' ? 'bg-purple-500 text-white' : 'bg-gray-500/30 text-gray-400'} transition-colors`}
                >
                  カード
                </button>
              </div>

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

        {/* 配信者メッセージ */}
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

        {/* ゲスト向け説明・TOP3 */}
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

        {/* 管理者機能 */}
        {isAdmin && (
          <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border`}>
            <div className="flex items-center justify-between">
              <h3 className={`${currentTheme.text} font-bold text-sm`}>楽曲管理</h3>
              <div className="flex space-x-2">
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>エクスポート</span>
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
                ✅ 楽曲リストが公開されました
              </div>
            )}
          </div>
        )}

        {/* 検索・フィルター機能 */}
        <div className={`${currentTheme.card} rounded-lg p-3 mb-3 border space-y-3`}>
          {/* 検索バー */}
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

          {/* フィルター・ソート */}
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
              
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className={`px-2 py-1 ${currentTheme.inputBg} border rounded ${currentTheme.inputText} text-sm`}
              >
                <option value={0}>全評価</option>
                <option value={4}>★4以上</option>
                <option value={5}>★5のみ</option>
              </select>

              {isAdmin && (
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${showFavoritesOnly ? 'bg-red-500 text-white' : 'bg-gray-500/30 text-gray-400'}`}
                >
                  <Heart className="w-3 h-3 inline mr-1" />
                  お気に入りのみ
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
                <option value="copyCount">リクエスト数順</option>
                <option value="rating">評価順</option>
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
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-50'}`}>
                    {!isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>リクエスト</th>}
                    <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>楽曲名</th>
                    <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>アーティスト</th>
                    <th className={`px-4 py-3 text-left ${currentTheme.text} font-bold`}>ジャンル/タグ</th>
                    <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>評価</th>
                    {isAdmin && <th className={`px-4 py-3 text-center ${currentTheme.text} font-bold`}>お気に入り</th>}
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
                        {(song.key || song.duration) && (
                          <div className={`${currentTheme.textTertiary} text-xs mt-1 flex space-x-2`}>
                            {song.key && <span>キー: {song.key}</span>}
                            {song.duration && <span>時間: {song.duration}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`${currentTheme.textSecondary}`}>{song.artist}</div>
                        {song.difficulty && (
                          <div className={`${currentTheme.textTertiary} text-xs mt-1 flex items-center space-x-2`}>
                            <span>難易度:</span>
                            <DifficultyDisplay difficulty={song.difficulty} />
                          </div>
                        )}
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
                      <td className="px-4 py-3 text-center">
                        <StarRating 
                          rating={song.rating || 0} 
                          onRatingChange={isAdmin ? (rating) => updateRating(song.id, rating) : null}
                          readOnly={!isAdmin}
                        />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleFavorite(song.id)}
                            className={`p-1 rounded transition-colors ${song.isFavorite ? 'text-red-400' : 'text-gray-400'}`}
                          >
                            <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}

          {filteredSongs.length === 0 && (
            <div className={`text-center py-8 ${currentTheme.textTertiary}`}>
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">該当する楽曲が見つかりませんでした</p>
            </div>
          )}
        </div>

        {/* 統計モーダル */}
        {showStatsModal && <StatsModal />}

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
              
              <div className
