import { useState, useEffect, useMemo } from 'react';
import { db, OperationType, handleFirestoreError } from './firebase';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { Community, NeighborhoodData } from './types';
import { INITIAL_COMMUNITIES, AVAILABLE_TAGS, NEIGHBORHOODS } from './data/togoData';
import InteractiveMap from './components/InteractiveMap';
import AddCommunityForm from './components/AddCommunityForm';
import AdminPanel from './components/AdminPanel';

// Icons
import { 
  Users, MapPin, Search, PlusCircle, Settings, MessageSquare, 
  ExternalLink, ArrowUpRight, Compass, Filter, Share2, 
  Bell, Globe, Sparkles, HeartHandshake, CheckCircle, Info
} from 'lucide-react';

export default function App() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<'directory' | 'add' | 'admin'>('directory');
  
  // Communities dataset state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);

  // Detail / Profile view Modal state
  const [featuredCommunity, setFeaturedCommunity] = useState<Community | null>(null);

  // Banner notification state
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Dynamic Firestore Hydrator & Listener
  useEffect(() => {
    setDbLoading(true);
    const parentCol = 'communities';
    const q = query(
      collection(db, parentCol),
      where('status', '==', 'approved')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Community[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Community);
      });

      // Seeding Strategy: If Firestore has no approved entries, we display the rich Togo initial seed dataset
      if (items.length === 0) {
        setCommunities(INITIAL_COMMUNITIES);
      } else {
        setCommunities(items);
      }
      setDbLoading(false);
    }, (error) => {
      console.warn('Fallback to local seeds due to restricted initial load:', error);
      // Fallback securely to seeds if permissions or network fails offline
      setCommunities(INITIAL_COMMUNITIES);
      setDbLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Perform Filtering
  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      // Name Search matching
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tag matching
      const matchesTag = selectedTag ? c.tags.includes(selectedTag) : true;
      
      // Neighborhood ID matching
      const parentNeighborhood = NEIGHBORHOODS.find((n) => n.name === c.neighborhood);
      const matchesNeighborhood = selectedNeighborhood 
        ? parentNeighborhood?.id === selectedNeighborhood 
        : true;

      return matchesSearch && matchesTag && matchesNeighborhood;
    });
  }, [communities, searchTerm, selectedTag, selectedNeighborhood]);

  const stats = useMemo(() => {
    const totalCount = communities.length;
    // Count distinct technology tags
    const allTags = new Set(communities.flatMap((c) => c.tags));
    const districtsCount = new Set(communities.map((c) => c.neighborhood)).size;
    return {
      total: totalCount,
      tagsCount: allTags.size,
      districtsCount
    };
  }, [communities]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-togo-yellow/30">
      
      {/* Togo Patriot Brand Line (Visual Flag banner at the very top) */}
      <div className="h-1.5 w-full flex">
        <div className="bg-togo-red w-1/12 h-full"></div>
        <div className="bg-togo-green w-4/12 h-full"></div>
        <div className="bg-togo-yellow w-2/12 h-full"></div>
        <div className="bg-togo-green w-4/12 h-full"></div>
        <div className="bg-togo-yellow w-1/12 h-full"></div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-togo-green/30 animate-bounce duration-500 max-w-sm">
          <div className="p-1 bg-togo-green rounded-full">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-semibold">{notification}</p>
        </div>
      )}

      {/* Navigation and Branding Header */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
        <div 
          onClick={() => { setActiveTab('directory'); setSelectedNeighborhood(null); setSelectedTag(null); }}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 bg-togo-red rounded flex items-center justify-center shadow-md relative overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current relative z-10">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-togo-green rotate-45 transform translate-x-2 -translate-y-2"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none flex items-center gap-1">
              MINI<span className="text-togo-green">LOMÉ</span>
              <span className="text-[10px] bg-togo-yellow text-slate-950 px-1.5 py-0.5 rounded font-black">TG</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-slate-500 mt-1">Connecter le Togo Numérique</p>
          </div>
        </div>

        {/* Action Navigation Tabs & Add Button */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-1 cursor-pointer transition-colors ${
                activeTab === 'directory'
                  ? 'text-togo-green border-b-2 border-togo-yellow font-bold'
                  : 'hover:text-togo-green'
              }`}
            >
              Communautés
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`pb-1 cursor-pointer transition-colors ${
                activeTab === 'admin'
                  ? 'text-togo-green border-b-2 border-togo-yellow font-bold'
                  : 'hover:text-togo-green'
              }`}
            >
              Administration
            </button>
          </div>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold shadow-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-togo-yellow text-slate-950 shadow-togo-yellow/20 hover:bg-yellow-400'
                : 'bg-togo-green text-white shadow-togo-green/20 hover:bg-togo-green-dark'
            }`}
          >
            <span>Ajouter un groupe</span>
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Body Window */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'directory' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Elegant Patriotic Hero Banner */}
            <div className="bg-gradient-to-br from-togo-green via-togo-green-dark to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Togo design layout background watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-[350px] font-black leading-none uppercase">
                TOGO
              </div>

              <div className="space-y-4 max-w-2xl text-center md:text-left relative z-15">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-togo-yellow text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-togo-red fill-togo-red" />
                    Togo Unifié et Connecté
                  </span>
                  <span className="bg-white/10 backdrop-blur-sm text-togo-yellow text-[10px] font-bold px-2.5 py-1 rounded-full">
                    📍 Lomé Hub du Digital
                  </span>
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Cartographier l'Écosystème des <br className="hidden md:block"/>
                  <span className="text-togo-yellow">Communautés Tech</span> de Lomé
                </h1>
                
                <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
                  Découvrez et rejoignez les associations, groupes de code, clubs de cybersécurité, et collectifs de design à Lomé. Facilitez votre intégration professionnelle par des canaux WhatsApp et Telegram directs !
                </p>

                {/* Micro Counters and quick actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <button 
                    onClick={() => {
                      const listElement = document.getElementById('map-view-box');
                      listElement?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-togo-yellow hover:bg-yellow-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-yellow-500/10"
                  >
                    🚀 Explorer la carte
                  </button>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="bg-white/15 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    ＋ Ajouter une association
                  </button>
                </div>
              </div>

              {/* Bento Grid Mini Indicators */}
              <div className="grid grid-cols-3 gap-3 md:w-80 w-full relative z-10">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center flex flex-col justify-center shadow-inner">
                  <span className="text-2xl font-black text-togo-yellow">{stats.total}</span>
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Groupes</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center flex flex-col justify-center shadow-inner">
                  <span className="text-2xl font-black text-togo-yellow">{stats.districtsCount}</span>
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Quartiers</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center flex flex-col justify-center shadow-inner">
                  <span className="text-2xl font-black text-togo-yellow">{stats.tagsCount}</span>
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Thèmes</span>
                </div>

                <div className="col-span-3 bg-white/5 backdrop-blur-sm px-3.5 py-2 rounded-xl text-[10px] text-emerald-100/90 text-center border border-white/5 flex items-center justify-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-togo-yellow" />
                  <span>Validation humaine des liens de groupes</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Map & Directory Grid */}
            <div id="map-view-box" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Interactive map pane (Left) */}
              <div className="xl:col-span-8 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Compass className="w-5 h-5 text-togo-green" />
                      Visualisation Géographique
                    </h2>
                    <p className="text-xs text-slate-500">Quartiers et communautés actives de Lomé au Togo</p>
                  </div>

                  {selectedNeighborhood && (
                    <span className="text-xs bg-togo-green/10 text-togo-green font-bold px-3 py-1 rounded-full">
                      Quartier filtré : {NEIGHBORHOODS.find((n) => n.id === selectedNeighborhood)?.displayName}
                    </span>
                  )}
                </div>

                <InteractiveMap 
                  communities={communities}
                  selectedNeighborhood={selectedNeighborhood}
                  onSelectNeighborhood={setSelectedNeighborhood}
                  onSelectCommunity={(c) => {
                    setFeaturedCommunity(c);
                    // Scroll profile on mobile
                    if (window.innerWidth < 1024) {
                      setTimeout(() => {
                        document.getElementById('profile-view-drawer')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                />
              </div>

              {/* Communities database lists & Search pane (Right) */}
              <div className="xl:col-span-4 space-y-6">
                
                {/* Search Inputs */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      placeholder="Rechercher (Ex. GDG, Python, Securité...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-100 border-none focus:ring-2 focus:ring-togo-green outline-none rounded-xl pl-10 pr-4 py-3 transition shadow-inner text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Tag quick selection strip */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Filter className="w-3 h-3 text-slate-400" />
                      Filtrer par domaine
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {AVAILABLE_TAGS.slice(0, 10).map((tag) => {
                        const isSelected = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(isSelected ? null : tag)}
                            className={`text-[11px] px-3 py-1 rounded-full font-bold transition cursor-pointer uppercase tracking-wider ${
                              isSelected 
                                ? 'bg-togo-yellow border border-togo-yellow text-slate-900' 
                                : 'bg-slate-100 hover:bg-slate-200 border border-transparent text-slate-500'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                      {selectedTag && (
                        <button 
                          onClick={() => setSelectedTag(null)}
                          className="text-[10px] border border-togo-red text-togo-red hover:bg-togo-red/10 px-2 py-1 rounded-lg font-bold"
                        >
                          Chasser le filtre ❌
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Communities Directory Lists */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Associations ({filteredCommunities.length})
                    </span>
                    
                    {(searchTerm || selectedTag || selectedNeighborhood) && (
                      <button 
                        onClick={() => { setSearchTerm(''); setSelectedTag(null); setSelectedNeighborhood(null); }}
                        className="text-[10px] font-bold text-togo-red hover:underline leading-none"
                      >
                        Effacer les filtres
                      </button>
                    )}
                  </div>

                  {dbLoading ? (
                    <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center">
                      <span className="w-6 h-6 border-2 border-togo-green border-t-transparent animate-spin rounded-full mb-2"></span>
                      <p className="text-xs text-slate-400">Chargement de la base...</p>
                    </div>
                  ) : filteredCommunities.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-250 text-center py-12">
                      <span className="text-2xl">🔍</span>
                      <p className="text-xs font-bold text-slate-700 mt-2">Aucune communauté trouvée</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal max-w-[220px] mx-auto">
                        Ajustez vos filtres de recherche ou proposez votre propre collectif !
                      </p>
                      <button
                        onClick={() => { setSearchTerm(''); setSelectedTag(null); setSelectedNeighborhood(null); }}
                        className="mt-4 text-xs font-bold text-togo-green hover:underline inline-block bg-togo-green/10 px-3 py-1.5 rounded-lg"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredCommunities.map((c) => {
                        const isFeatured = featuredCommunity?.name === c.name;
                        return (
                          <div
                            key={c.id || c.name}
                            onClick={() => setFeaturedCommunity(c)}
                            className={`group p-4 border rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between ${
                              isFeatured 
                                ? 'bg-slate-50 border-togo-green shadow-md ring-1 ring-togo-green/25' 
                                : 'bg-white border-slate-200 hover:border-togo-green hover:shadow-md hover:ring-1 hover:ring-togo-green/20'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              {c.logoUrl ? (
                                <img 
                                  src={c.logoUrl} 
                                  alt={c.name} 
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0 referrer-policy='no-referrer'" 
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                  <div className="text-xl font-black text-togo-green">
                                    {c.name.substring(0, 1).toUpperCase()}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-togo-yellow"></div>
                                <div className="w-2 h-2 rounded-full bg-togo-green"></div>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-800 text-sm leading-snug">
                                {c.name}
                              </h3>
                              <p className="text-xs text-slate-500 mb-3 mt-1 line-clamp-2 leading-relaxed">
                                {c.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mt-2 pt-2 border-t border-slate-100">
                                <span className="text-togo-green flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {c.neighborhood}
                                </span>
                                <div className="flex gap-1.5">
                                  {c.tags.slice(0, 1).map((t) => (
                                    <span key={t} className="text-slate-400 hover:text-slate-600">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Featured Active Profile Showcase View (Detail drawer) */}
            {featuredCommunity && (
              <div id="profile-view-drawer" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-lg flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start animate-fade-in relative overflow-hidden">
                
                {/* Visual flag details ribbon */}
                <div className="absolute right-0 top-0 h-full w-1.5 flex flex-col">
                  <div className="bg-togo-red h-1/4"></div>
                  <div className="bg-togo-yellow h-1/4"></div>
                  <div className="bg-togo-green h-2/4"></div>
                </div>

                <div className="flex-1 space-y-4 text-left">
                  <div className="flex items-start gap-4">
                    {featuredCommunity.logoUrl ? (
                      <img 
                        src={featuredCommunity.logoUrl} 
                        alt={featuredCommunity.name} 
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0 shadow-inner referrer-policy='no-referrer'" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-togo-green to-togo-yellow font-extrabold text-white text-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        {featuredCommunity.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                          {featuredCommunity.name}
                        </h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {featuredCommunity.neighborhood}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {featuredCommunity.tags.map((t) => (
                          <span key={t} className="text-[10px] bg-togo-green/10 text-togo-green border border-togo-green/10 px-2.5 py-0.5 rounded-lg font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-4xl pt-1 whitespace-pre-line">
                    {featuredCommunity.description}
                  </p>
                </div>

                {/* Connect / Actions Panel */}
                <div className="w-full md:w-80 bg-slate-50 p-5 rounded-2.5xl border border-slate-150 flex flex-col justify-between self-stretch">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-togo-green" />
                      Moyens d'accès direct
                    </h4>
                    
                    <p className="text-[10px] text-slate-500 mb-4 font-normal leading-normal">
                      Rejoignez directement leur forum pour échanger avec les membres et être informé des prochains hackathons/ateliers.
                    </p>

                    <div className="space-y-2 text-xs">
                      {featuredCommunity.whatsappUrl ? (
                        <a 
                          href={featuredCommunity.whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-togo-green hover:bg-togo-green-dark text-white font-bold p-3 rounded-xl flex items-center justify-between transition shadow-xs"
                        >
                          <span className="flex items-center gap-2">
                            💬 Groupe WhatsApp
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-emerald-100" />
                        </a>
                      ) : (
                        <div className="text-slate-400 border border-dashed border-slate-200 bg-slate-100 p-2.5 rounded-xl text-center text-[10px]">
                          Pas de groupe WhatsApp public
                        </div>
                      )}

                      {featuredCommunity.telegramUrl && (
                        <a 
                          href={featuredCommunity.telegramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-slate-50 text-slate-700 font-bold p-3 rounded-xl flex items-center justify-between transition border border-slate-250 cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-sky-600">
                            ✈️ Canal Telegram
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* External links */}
                  <div className="mt-4 pt-4 border-t border-slate-250 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Profils externes</span>
                    <div className="flex gap-2">
                      {featuredCommunity.linkedinUrl && (
                        <a href={featuredCommunity.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition" title="LinkedIn">
                          🔗 LinkedIn
                        </a>
                      )}
                      {featuredCommunity.twitterUrl && (
                        <a href={featuredCommunity.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition" title="Twitter / X">
                          𝕏 Twitter
                        </a>
                      )}
                      {featuredCommunity.websiteUrl && (
                        <a href={featuredCommunity.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition" title="Site officiel">
                          🌐 Web
                        </a>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Custom Interactive presentation on Togo's patriotism */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-4 text-left">
              <span className="text-3xl">🇹🇬</span>
              <div>
                <h4 className="text-xs font-black text-togo-green uppercase tracking-widest flex items-center gap-1.5">
                  Fierté Nationale & Consolidation
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Chaque communauté tech du Togo contribue à l'essor technologique de notre patrie. Si vous êtes gestionnaire d'un club informatique universitaire, d'un espace de codage, ou d'un réseau technique à Lomé (Togo), enregistrez-le dès aujourd'hui afin de simplifier sa connectivité nationale !
                </p>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-fade-in py-4">
            <AddCommunityForm 
              onSuccess={() => {
                setActiveTab('directory');
                triggerNotification('🎉 Félicitations ! Votre communauté à été enregistrée et soumise à la modération administrateur pour validation.');
              }}
              onCancel={() => {
                setActiveTab('directory');
              }}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fade-in py-4">
            <AdminPanel 
              onBackToDirectory={() => setActiveTab('directory')}
            />
          </div>
        )}

      </main>

      {/* Aesthetic humbler footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-20 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-white mb-1">
              <span>Lomé Tech Communities</span>
              <span className="text-[10px] bg-togo-green text-white font-extrabold px-1.5 py-0.5 select-none rounded">TG</span>
            </div>
            <p className="text-[11px] text-slate-500">Unissant les compétences numériques du Togo. Travail, Liberté, Patrie.</p>
          </div>

          <div className="flex gap-4 text-xs items-center">
            <span className="hover:text-white cursor-pointer transition">Annuaire</span>
            <span className="hover:text-white cursor-pointer transition">Drapeau togolais</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-white cursor-pointer transition uppercase text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 font-bold">
              Cabinet Admin
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
