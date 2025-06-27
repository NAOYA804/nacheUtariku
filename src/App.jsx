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
            <h3 className
