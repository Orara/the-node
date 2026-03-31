import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Search, Plus, Bell, User, 
  MessageSquare, Send, Bookmark, MoreHorizontal, 
  CheckCircle2, FileText, CarFront, ChevronRight, Heart,
  Mail, Lock, ArrowRight, Github, Image as ImageIcon, X, Camera, Video
} from 'lucide-react';

// --- Business Logic ---
const filterPrivateInfo = (text: string) => {
  if (!text) return text;
  // Phone numbers: 010-1234-5678, 01012345678, 010 1234 5678
  let filtered = text.replace(/(01[016789])[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g, '[비공개 처리됨]');
  // URLs
  filtered = filtered.replace(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/g, '[비공개 처리됨]');
  // Kakao ID
  filtered = filtered.replace(/(카톡|kakao|카카오톡)\s*(아이디|id)?\s*[:\-]?\s*([a-zA-Z0-9_]+)/gi, '[비공개 처리됨]');
  return filtered;
};

const checkCommercialKeywords = (text: string, isVerified: boolean) => {
  if (isVerified) return true; // 인증 딜러는 제한 없음
  const forbiddenWords = ['견적', '금액', '판매', '얼마', '상담'];
  const hasForbidden = forbiddenWords.some(word => text.includes(word));
  if (hasForbidden) {
    alert('인증 딜러 전용 기능입니다. 상업적 키워드(견적, 금액, 판매, 얼마, 상담)는 사용할 수 없습니다.');
    return false;
  }
  return true;
};

// --- Mock Data ---
const STORIES = [
  { id: 1, user: '내 스토리', avatar: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150&auto=format&fit=crop', isAdd: true },
  { id: 2, user: '김벤츠 딜러', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop', hasStory: true },
  { id: 3, user: '이비엠 딜러', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop', hasStory: true },
  { id: 4, user: '박포르쉐', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop', hasStory: true },
  { id: 5, user: '최고객', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=150&auto=format&fit=crop', hasStory: false },
];

const POSTS = [
  {
    id: 1,
    user: '김벤츠 딜러',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
    role: 'dealer',
    isVerified: true,
    brand: 'Mercedes-Benz',
    location: '한성자동차 강남전시장',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop',
    mediaType: 'image',
    likes: 124,
    content: '오늘 S클래스 500 4MATIC 롱바디 출고 완료했습니다. 대기 기간 없이 즉시 출고 가능한 재고 2대 확보 중입니다. 연락처 010-1234-5678 또는 카톡 kakao id: benz123 으로 문의 바랍니다.',
    tags: ['#MercedesBenz', '#SClass', '#즉시출고'],
    comments: 12,
    time: '2 HOURS AGO',
    type: 'daily'
  },
  {
    id: 2,
    user: '이비엠 딜러',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    role: 'dealer',
    isVerified: true,
    brand: 'BMW',
    location: '코오롱모터스 서초',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop',
    mediaType: 'image',
    likes: 89,
    content: '5시리즈 하이브리드 모델, 이번 달 한정 프로모션 진행합니다. 법인 플릿 적용 시 추가 혜택이 제공됩니다. 가장 합리적인 견적을 약속드립니다. https://bmw-promo.com',
    tags: ['#BMW', '#5Series', '#법인리스'],
    comments: 5,
    time: '5 HOURS AGO',
    type: 'promotion'
  },
  {
    id: 3,
    user: '차량찾는고객',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=150&auto=format&fit=crop',
    role: 'customer',
    isVerified: false,
    location: '서울 강남구',
    image: 'https://images.unsplash.com/photo-1503376760367-112c072781b9?q=80&w=1000&auto=format&fit=crop',
    mediaType: 'image',
    likes: 12,
    content: '포르쉐 카이엔 쿠페 플래티넘 에디션 화이트/보르도레드 실내 재고 구합니다. 리스 승계도 고려하고 있습니다. 010-9876-5432 로 연락주세요.',
    tags: ['#Porsche', '#CayenneCoupe', '#재고문의'],
    comments: 8,
    time: '8 HOURS AGO',
    type: 'inquiry'
  }
];

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Left Side - Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-900/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop" 
          alt="Luxury Car" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 text-white h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-tight">
              Experience<br/>The Premium<br/>Auto Network.
            </h2>
            <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
              Connect with top-tier dealers, discover exclusive promotions, and find your dream car in a trusted community.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase mb-3">
              THE NODE
            </h1>
            <p className="text-slate-500 font-medium">Welcome back. Please enter your details.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-bold text-amber-600 hover:text-amber-700 transition">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} strokeWidth={1.5} />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              Sign In 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm">
                <Github size={20} />
                GitHub
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <a href="#" className="font-bold text-amber-600 hover:text-amber-700 transition">Sign up now</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const LiveConnectTray = () => (
  <div className="flex gap-5 overflow-x-auto px-6 py-8 scrollbar-hide">
    {STORIES.map((story) => (
      <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
        <div className={`relative p-[2px] rounded-2xl transition-transform duration-300 group-hover:scale-105 ${story.hasStory ? 'bg-gradient-to-tr from-slate-800 to-slate-400' : 'bg-transparent'}`}>
          <div className="bg-slate-50 p-[3px] rounded-2xl">
            <img src={story.avatar} alt={story.user} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
          </div>
          {story.isAdd && (
            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-lg border-2 border-slate-50 text-white p-0.5 shadow-md">
              <Plus size={14} strokeWidth={3} />
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-600 font-bold tracking-wide truncate w-16 text-center">{story.user}</span>
      </div>
    ))}
  </div>
);

const PremiumPostCard: React.FC<{ 
  post: typeof POSTS[0], 
  isFollowing?: boolean, 
  onToggleFollow?: () => void, 
  onUserClick?: () => void 
}> = ({ 
  post, 
  isFollowing, 
  onToggleFollow, 
  onUserClick 
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-white mx-4 md:mx-0 mb-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <img 
            src={post.avatar} 
            alt={post.user} 
            onClick={onUserClick}
            className="w-11 h-11 rounded-xl object-cover shadow-sm cursor-pointer hover:opacity-80 transition" 
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span 
                onClick={onUserClick}
                className="font-bold text-sm text-slate-900 cursor-pointer hover:underline"
              >
                {post.user}
              </span>
              {post.role === 'dealer' && <CheckCircle2 size={14} className="text-amber-600" fill="currentColor" stroke="white" />}
              {post.isVerified && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full ml-1 border border-amber-200">
                  THE NODE Verified
                </span>
              )}
              {/* Follow Button */}
              {post.user !== '현재 유저' && onToggleFollow && (
                <button
                  onClick={onToggleFollow}
                  className={`ml-2 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : post.isVerified
                        ? 'bg-amber-600 text-white shadow-sm hover:bg-amber-700'
                        : 'bg-slate-900 text-white shadow-sm hover:bg-black'
                  }`}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </button>
              )}
            </div>
            {post.location && <span className="text-[11px] text-slate-400 font-medium tracking-wide">{post.location}</span>}
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-900 transition"><MoreHorizontal size={20} /></button>
      </div>

      {/* Post Image/Video */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 group">
        {post.mediaType === 'video' ? (
          <video src={post.image} autoPlay muted loop playsInline className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <img src={post.image} alt="Post content" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
        )}
        
        {/* Elegant Badge */}
        <div className="absolute top-5 right-5">
          {post.type === 'inquiry' && (
            <span className="bg-white/90 backdrop-blur-md text-slate-900 border border-white/20 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              <FileText size={12} strokeWidth={2.5}/> Inquiry
            </span>
          )}
          {post.type === 'promotion' && (
            <span className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              <CarFront size={12} strokeWidth={2.5}/> Promo
            </span>
          )}
        </div>
      </div>

      {/* Post Content & Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-5">
            <button onClick={() => setLiked(!liked)} className={`transition transform active:scale-90 ${liked ? 'text-rose-500' : 'text-slate-800 hover:text-slate-500'}`}>
              <Heart size={24} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="text-slate-800 hover:text-slate-500 transition"><MessageSquare size={24} strokeWidth={1.5} /></button>
            <button className="text-slate-800 hover:text-slate-500 transition"><Send size={24} strokeWidth={1.5} /></button>
          </div>
          <button className="text-slate-800 hover:text-slate-500 transition"><Bookmark size={24} strokeWidth={1.5} /></button>
        </div>

        <p className="font-bold text-sm text-slate-900 mb-3">{post.likes + (liked ? 1 : 0)} Likes</p>
        
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          <span className="font-bold text-slate-900 mr-2">{post.user}</span>
          {filterPrivateInfo(post.content)}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs font-medium text-amber-600">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest">{post.time}</p>
          <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition flex items-center gap-1">
            View {post.comments} Comments <ChevronRight size={14} />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {post.isVerified ? (
            <div className="flex gap-3">
              <button className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2">
                <FileText size={16} /> 공식 견적 요청
              </button>
              <button className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-sm py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 border border-amber-200">
                <MessageSquare size={16} /> 실시간 상담
              </button>
            </div>
          ) : (
            <button className="w-full bg-slate-100 text-slate-400 font-bold text-sm py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
              <Lock size={16} /> 일반 유저 게시글
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// --- Main Layout ---

const MainApp = ({ onLogout }: { onLogout: () => void }) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [uploadText, setUploadText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [posts, setPosts] = useState(POSTS);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<typeof POSTS[0] | null>(null);
  
  const currentUser = { 
    user: '현재 유저',
    avatar: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150&auto=format&fit=crop',
    role: 'customer',
    isVerified: false 
  }; // 일반 유저로 가정

  const toggleFollow = (userName: string) => {
    setFollowedUsers(prev => 
      prev.includes(userName) ? prev.filter(name => name !== userName) : [...prev, userName]
    );
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const clearMedia = (revoke: boolean | React.MouseEvent = true) => {
    const shouldRevoke = typeof revoke === 'boolean' ? revoke : true;
    setMediaFile(null);
    if (mediaPreview) {
      if (shouldRevoke) URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  };

  const handleUploadClick = () => {
    if (!uploadText.trim() && !mediaFile) return;
    
    if (checkCommercialKeywords(uploadText, currentUser.isVerified)) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPost = () => {
    const newPost: typeof POSTS[0] = {
      id: Date.now(),
      user: currentUser.user,
      avatar: currentUser.avatar,
      role: currentUser.role,
      isVerified: currentUser.isVerified,
      brand: '',
      location: '',
      image: mediaPreview || '',
      mediaType: mediaFile?.type.startsWith('video/') ? 'video' : 'image',
      likes: 0,
      content: filterPrivateInfo(uploadText), // 필터링 적용
      tags: [],
      comments: 0,
      time: 'JUST NOW',
      type: 'daily'
    };

    setPosts([newPost, ...posts]);
    setUploadText('');
    clearMedia(false); // Do not revoke URL so it stays in the feed
    setShowConfirmModal(false);
    setCurrentTab('home');
  };

  // Removed useEffect that revokes object URL on mediaPreview change
  // to prevent breaking the feed images/videos after posting.

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <nav className="hidden md:flex flex-col w-[280px] fixed left-0 top-0 h-screen bg-white border-r border-slate-100 p-8 z-50">
        <div className="font-luxury text-2xl font-black tracking-tighter text-slate-900 uppercase mb-16 cursor-pointer">
          THE NODE
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'search', icon: Search, label: 'Explore' },
            { id: 'upload', icon: Plus, label: 'Create' },
            { id: 'activity', icon: Bell, label: 'Notifications' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentTab(item.id)} 
              className={`flex items-center gap-5 p-3.5 rounded-2xl transition-all duration-300 ${currentTab === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <item.icon size={24} strokeWidth={currentTab === item.id ? 2 : 1.5} /> 
              <span className={`text-sm tracking-wide ${currentTab === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          ))}
          
          <button onClick={() => setCurrentTab('profile')} className={`flex items-center gap-5 p-3.5 rounded-2xl transition-all duration-300 mt-2 ${currentTab === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <img src={STORIES[0].avatar} className="w-6 h-6 rounded-md object-cover" alt="profile" />
            <span className={`text-sm tracking-wide ${currentTab === 'profile' ? 'font-bold' : 'font-medium'}`}>Profile</span>
          </button>
        </div>

        <div className="mt-auto">
          <button 
            onClick={onLogout}
            className="flex items-center gap-5 p-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition w-full text-left"
          >
            <MoreHorizontal size={24} strokeWidth={1.5} /> <span className="text-sm font-medium tracking-wide">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-[500px] md:ml-[280px] min-h-screen pb-24 md:pb-10 relative">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
          <div className="font-luxury text-xl font-black tracking-tighter text-slate-900 uppercase">
            THE NODE
          </div>
          <div className="flex items-center gap-5">
            <button className="text-slate-800 hover:text-amber-600 transition"><Bell size={22} strokeWidth={1.5} /></button>
            <button className="text-slate-800 hover:text-amber-600 transition"><MessageSquare size={22} strokeWidth={1.5} /></button>
          </div>
        </header>

        {/* Feed Content */}
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full pt-2 md:pt-8"
            >
              <LiveConnectTray />
              <div className="flex flex-col mt-4">
                {posts.map(post => (
                  <PremiumPostCard 
                    key={post.id} 
                    post={post} 
                    isFollowing={followedUsers.includes(post.user)}
                    onToggleFollow={() => toggleFollow(post.user)}
                    onUserClick={() => setSelectedUser(post)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-[70vh] px-6 w-full max-w-md mx-auto"
            >
              <div className="w-full bg-white rounded-3xl p-5 shadow-lg border border-slate-100">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-800 tracking-wide">새 게시물</span>
                  <button onClick={() => setCurrentTab('home')} className="text-slate-400 hover:text-slate-600 transition">
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full object-cover" />
                  <span className="text-sm font-bold text-slate-900">{currentUser.user}</span>
                </div>

                {/* Textarea */}
                <textarea 
                  className="w-full min-h-[120px] p-4 bg-[#F9F9F9] border-none rounded-2xl text-sm focus:outline-none focus:ring-0 resize-none mb-3 text-slate-800 placeholder-slate-400"
                  placeholder={currentUser.isVerified ? "" : "일반 유저는 상업적 키워드(견적, 판매 등)를 사용할 수 없습니다."}
                  value={uploadText}
                  onChange={(e) => {
                    setUploadText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />

                {/* Media Preview */}
                {mediaPreview && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-200">
                    <button 
                      onClick={clearMedia}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition z-10"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-slate-400">
                    <label className="cursor-pointer hover:text-amber-600 transition">
                      <Camera size={22} strokeWidth={1.5} />
                      <input type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleMediaChange} />
                    </label>
                    <label className="cursor-pointer hover:text-amber-600 transition">
                      <ImageIcon size={22} strokeWidth={1.5} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleMediaChange} />
                    </label>
                    <label className="cursor-pointer hover:text-amber-600 transition">
                      <Video size={22} strokeWidth={1.5} />
                      <input type="file" accept="video/*" className="hidden" onChange={handleMediaChange} />
                    </label>
                  </div>
                  
                  <button 
                    onClick={handleUploadClick}
                    disabled={!uploadText.trim() && !mediaFile}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                      (!uploadText.trim() && !mediaFile) 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-slate-900 text-white hover:bg-black shadow-md'
                    }`}
                  >
                    게시
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentTab !== 'home' && currentTab !== 'upload' && (
            <motion.div
              key="other"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-[70vh] text-center px-6"
            >
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-300">
                {currentTab === 'search' && <Search size={40} strokeWidth={1} />}
                {currentTab === 'activity' && <Bell size={40} strokeWidth={1} />}
                {currentTab === 'profile' && <User size={40} strokeWidth={1} />}
              </div>
              <h2 className="text-2xl font-luxury font-black text-slate-900 mb-3 uppercase tracking-widest">{currentTab}</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[250px]">
                This premium feature is currently under development. Stay tuned for updates.
              </p>
              
              {currentTab === 'profile' && (
                <button 
                  onClick={onLogout}
                  className="mt-8 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Log Out
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Right Sidebar (Suggestions) - Desktop Only */}
      <aside className="hidden xl:block w-[350px] p-10 pt-16">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <img src={STORIES[0].avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="My Profile" />
              <div>
                <p className="font-bold text-sm text-slate-900">the_node</p>
                <p className="text-slate-400 text-xs font-medium mt-0.5">Premium Member</p>
              </div>
            </div>
            <button className="text-amber-600 text-xs font-bold tracking-wide uppercase">Switch</button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-slate-400 font-bold text-xs tracking-widest uppercase">Suggested Dealers</span>
          <button className="text-slate-900 text-xs font-bold hover:text-amber-600 transition">View All</button>
        </div>

        <div className="flex flex-col gap-5 px-2">
          {[2, 3, 4].map(id => (
            <div key={id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <img src={STORIES[id].avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition" alt="Suggested" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-slate-900">{STORIES[id].user}</p>
                    <CheckCircle2 size={14} className="text-amber-600" fill="currentColor" stroke="white" />
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium mt-0.5">Official Dealer</p>
                </div>
              </div>
              <button className="bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold px-4 py-2 rounded-lg transition">Follow</button>
            </div>
          ))}
        </div>
        
        <div className="mt-14 px-2">
          <div className="flex flex-wrap gap-x-4 gap-y-3 text-[9px] text-slate-400/60 tracking-[0.2em] font-medium uppercase">
            <button className="hover:text-slate-600 transition-colors duration-500">ABOUT</button>
            <button onClick={() => alert('준비 중입니다.')} className="hover:text-slate-600 transition-colors duration-500">문의하기</button>
            <button className="hover:text-slate-600 transition-colors duration-500">이용약관</button>
            <button onClick={() => alert('준비 중입니다.')} className="hover:text-slate-600 transition-colors duration-500">광고/제휴</button>
            <button className="hover:text-slate-600 transition-colors duration-500">LANGUAGE</button>
          </div>
          <div className="mt-8">
            <span className="font-sans font-medium text-slate-300/70 text-[9px] tracking-[0.15em] uppercase">© 2026 THE NODE. All rights reserved.</span>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 px-6 py-4 rounded-full flex justify-between items-center z-50 shadow-2xl">
        {[
          { id: 'home', icon: Home },
          { id: 'search', icon: Search },
          { id: 'upload', icon: Plus },
          { id: 'activity', icon: Bell },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentTab(item.id)} 
            className={`transition-all duration-300 ${currentTab === item.id ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <item.icon size={24} strokeWidth={currentTab === item.id ? 2 : 1.5} />
          </button>
        ))}
        <button 
          onClick={() => setCurrentTab('profile')} 
          className={`transition-all duration-300 ${currentTab === 'profile' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'} rounded-md`}
        >
          <img src={STORIES[0].avatar} className="w-6 h-6 rounded-md object-cover" alt="profile" />
        </button>
      </nav>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-100"
            >
              <h3 className="text-lg font-black text-slate-900 mb-2 text-center">이대로 게시하시겠습니까?</h3>
              <p className="text-xs text-slate-500 text-center mb-5">작성하신 내용과 미디어를 확인해주세요.</p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 max-h-[40vh] overflow-y-auto">
                {mediaPreview && (
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-200">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                {uploadText && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {filterPrivateInfo(uploadText)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmPost}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-black transition shadow-md"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-100 relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedUser(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10"
              >
                <X size={20} strokeWidth={2} />
              </button>

              <div className="flex flex-col items-center mt-4 mb-6">
                <img 
                  src={selectedUser.avatar} 
                  alt={selectedUser.user} 
                  className="w-20 h-20 rounded-2xl object-cover shadow-md mb-4" 
                />
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-xl font-black text-slate-900">{selectedUser.user}</h3>
                  {selectedUser.role === 'dealer' && <CheckCircle2 size={18} className="text-amber-600" fill="currentColor" stroke="white" />}
                </div>
                {selectedUser.isVerified && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 mb-3">
                    THE NODE Verified
                  </span>
                )}

                <div className="flex gap-6 mt-2 mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900">
                      {posts.filter(p => p.user === selectedUser.user).length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Posts</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900">
                      {followedUsers.includes(selectedUser.user) ? '12.5K' : '12.4K'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Followers</span>
                  </div>
                </div>

                {selectedUser.user !== currentUser.user && (
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => toggleFollow(selectedUser.user)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition shadow-sm ${
                        followedUsers.includes(selectedUser.user)
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : selectedUser.isVerified
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-slate-900 text-white hover:bg-black'
                      }`}
                    >
                      {followedUsers.includes(selectedUser.user) ? '팔로잉' : '팔로우'}
                    </button>
                    <button 
                      onClick={() => {
                        alert('준비 중입니다.');
                        setSelectedUser(null);
                      }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100 transition shadow-sm"
                    >
                      게시물 보기
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div key="login" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <MainApp onLogout={() => setIsAuthenticated(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
