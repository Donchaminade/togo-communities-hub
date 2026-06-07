import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, doc, updateDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { Community, CommunityStatus } from '../types';
import { 
  ShieldCheck, ShieldAlert, LogIn, LogOut, CheckCircle, XCircle, 
  Trash2, Mail, Phone, User as UserIcon, MapPin, Calendar, 
  ExternalLink, Layers, Sparkles, KeyRound, CheckSquare, Eye
} from 'lucide-react';

interface AdminPanelProps {
  onBackToDirectory: () => void;
}

export default function AdminPanel({ onBackToDirectory }: AdminPanelProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoBypass, setDemoBypass] = useState(false); // Testing bypass
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedReviewComp, setSelectedReviewComp] = useState<Community | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Auth Monitoring
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Check if current user is the configured Togo admin
  const isActualAdmin = currentUser && currentUser.email === 'chaminade.dondah.adjolou@gmail.com';
  const hasAdminAccess = isActualAdmin || demoBypass;

  // Real-time listener for ALL communities (approved, pending, or rejected)
  useEffect(() => {
    if (!hasAdminAccess) return;

    const q = query(
      collection(db, 'communities'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Community[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Community);
      });
      setCommunities(items);
    }, (error) => {
      console.warn('Silent read error or restricted rules access:', error);
      // Fallback for rules blocking or demo bypass
    });

    return () => unsub();
  }, [hasAdminAccess]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Signin Error:', err);
      alert('Erreur lors de la connexion Google. ' + (err instanceof Error ? err.message : ''));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDemoBypass(false);
    } catch (err) {
      console.error('Signout Error:', err);
    }
  };

  // Moderate Entry
  const handleModerate = async (communityId: string, newStatus: CommunityStatus) => {
    setActionLoading(communityId);
    try {
      const docRef = doc(db, 'communities', communityId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update locally selected review card
      if (selectedReviewComp && selectedReviewComp.id === communityId) {
        setSelectedReviewComp({ ...selectedReviewComp, status: newStatus });
      }

      setActionLoading(null);
    } catch (error) {
      console.error('Error moderating community:', error);
      setActionLoading(null);
      try {
        handleFirestoreError(error, OperationType.UPDATE, `communities/${communityId}`);
      } catch (fErr) {
        alert('Action bloquée. Si vous utilisez le mode démo de contournement, l\'écriture sur l\'instance Firestore réelle est limitée par les règles de sécurité.');
      }
    }
  };

  // Delete Entry
  const handleDelete = async (communityId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette communauté ?')) return;
    
    setActionLoading(communityId);
    try {
      await deleteDoc(doc(db, 'communities', communityId));
      if (selectedReviewComp && selectedReviewComp.id === communityId) {
        setSelectedReviewComp(null);
      }
      setActionLoading(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setActionLoading(null);
      try {
        handleFirestoreError(error, OperationType.DELETE, `communities/${communityId}`);
      } catch (fErr) {
        alert('Action refusée par les règles d\'accès Firestore.');
      }
    }
  };

  const getStatusBadge = (status: CommunityStatus) => {
    switch (status) {
      case 'approved':
        return <span className="bg-togo-green/10 text-togo-green text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">✅ Approuvé</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">❌ Rejeté</span>;
      case 'pending':
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">⏳ En Attente</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Auth Status & Title Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-togo-green/10 text-togo-green font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            Console de Contrôle
          </span>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
            Espace Administrateur Sécurisé
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez, vérifiez et validez les propositions de communautés de Lomé.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-2xl">
              <img 
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full border border-emerald-100 referrer-policy='no-referrer'" 
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.displayName}</p>
                <p className="text-[9px] text-slate-500">{currentUser.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition ml-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleGoogleLogin}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Connexion Google Admin
              </button>
              
              {!demoBypass && (
                <button
                  onClick={() => setDemoBypass(true)}
                  className="bg-amber-550 hover:bg-amber-600 bg-amber-500 text-slate-950 border border-amber-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  Mode Démo (Contournement)
                </button>
              )}
            </div>
          )}

          <button
            onClick={onBackToDirectory}
            className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>

      {hasAdminAccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of elements (Left Pane) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Toutes les Propositions</h3>
                <p className="text-xs text-slate-500">Filtrées en temps réel ({communities.length})</p>
              </div>

              {demoBypass && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                  Bypass Actif
                </span>
              )}
            </div>

            {/* Communities list container */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {communities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Aucune soumission reçue</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Allez sur l'accueil public pour inscrire une communauté factice pour tester.</p>
                </div>
              ) : (
                communities.map((c) => {
                  const isSelected = selectedReviewComp?.id === c.id;
                  const countTags = c.tags ? c.tags.length : 0;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedReviewComp(c)}
                      className={`p-4 rounded-2xl border transition text-left cursor-pointer ${
                        isSelected 
                          ? 'border-togo-green bg-togo-green/5' 
                          : 'border-slate-150 hover:border-togo-green/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight block truncate">
                          {c.name}
                        </h4>
                        {getStatusBadge(c.status)}
                      </div>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2 leading-relaxed">
                        {c.description}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.neighborhood}
                        </span>
                        <span>{countTags} tags</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Review Sandbox Drawer/Workspace (Right Pane) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[600px] flex flex-col justify-between">
            {selectedReviewComp ? (
              <div className="space-y-6 flex-1">
                
                {/* Header review */}
                <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {selectedReviewComp.logoUrl ? (
                      <img 
                        src={selectedReviewComp.logoUrl} 
                        alt="Logo" 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 referrer-policy='no-referrer'" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-togo-green to-togo-yellow font-extrabold text-white text-base flex items-center justify-center">
                        {selectedReviewComp.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">
                        {selectedReviewComp.name}
                      </h2>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-xs bg-slate-150 text-slate-600 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedReviewComp.neighborhood}
                        </span>
                        {getStatusBadge(selectedReviewComp.status)}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(selectedReviewComp.id!)}
                    title="Supprimer définitivement"
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Description and tags */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission & Description</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-55 bg-slate-50 p-4 rounded-2xl whitespace-pre-line border border-slate-100">
                    {selectedReviewComp.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technologies assignées</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReviewComp.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-lg font-bold bg-togo-green/10 text-togo-green border border-togo-green/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Networks lists */}
                <div className="bg-slate-50/50 p-4 rounded-2xl space-y-3 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liens d'Accès</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {selectedReviewComp.whatsappUrl && (
                      <a href={selectedReviewComp.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-togo-green text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-150">
                        <span className="w-2 h-2 rounded-full bg-togo-green animate-pulse"></span>
                        <span className="font-semibold text-slate-800">WhatsApp :</span>
                        <span className="truncate">Rejoindre le groupe</span>
                      </a>
                    )}
                    {selectedReviewComp.telegramUrl && (
                      <a href={selectedReviewComp.telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-700 text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-150">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span className="font-semibold text-slate-800">Telegram :</span>
                        <span className="truncate">Ouvrir le canal</span>
                      </a>
                    )}
                    {selectedReviewComp.linkedinUrl && (
                      <a href={selectedReviewComp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-700 text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-150">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    )}
                    {selectedReviewComp.twitterUrl && (
                      <a href={selectedReviewComp.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900 text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-150">
                        <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                        <span className="font-medium">Twitter / X</span>
                      </a>
                    )}
                    {selectedReviewComp.websiteUrl && (
                      <a href={selectedReviewComp.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-togo-green text-slate-600 truncate bg-white p-2 rounded-xl border border-slate-150 col-span-1 md:col-span-2">
                        <span className="w-2 h-2 rounded-full bg-togo-green"></span>
                        <span className="font-semibold text-slate-800">Site Web :</span>
                        <span className="truncate">{selectedReviewComp.websiteUrl}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Secure Contact Details of the applicant */}
                <div className="bg-amber-50/20 p-4 rounded-2xl space-y-3.5 border border-amber-100/50">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-togo-green" />
                    Données d'enregistrement du déposant (Sécurisées)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-normal leading-tight">Responsable</span>
                        <span className="font-semibold text-slate-800">{selectedReviewComp.leaderName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-normal leading-tight">E-mail</span>
                        <span className="font-semibold text-slate-800">{selectedReviewComp.leaderEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl md:col-span-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-normal leading-tight">Téléphone / WhatsApp</span>
                        <span className="font-semibold text-slate-800">{selectedReviewComp.leaderPhone || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions toolbar */}
                <div className="pt-4 border-t border-slate-150 flex flex-wrap gap-2 justify-end">
                  {selectedReviewComp.status !== 'rejected' && (
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleModerate(selectedReviewComp.id!, 'rejected')}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition border border-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter / Cacher l'entrée
                    </button>
                  )}

                  {selectedReviewComp.status !== 'approved' && (
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleModerate(selectedReviewComp.id!, 'approved')}
                      className="bg-togo-green hover:bg-togo-green-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver & Publier
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                <CheckSquare className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300 stroke-togo-green" />
                <h3 className="font-bold text-slate-700 text-sm">Prêt pour l'examen</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Sélectionnez une communauté déposée dans la colonne de gauche pour auditer son contenu et valider sa publication.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Unauthorized / Please login screen */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 shadow-sm text-center max-w-lg mx-auto py-16">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-650">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Accès Réservé
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-xs mx-auto">
            Seul l'administrateur patriote de la plateforme possède les droits d'écriture sur ce tableau de bord. Veuillez vous authentifier pour continuer ou utiliser le mode démo.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={handleGoogleLogin}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Se connecter avec Google
            </button>
            <button
              onClick={() => setDemoBypass(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <KeyRound className="w-4 h-4" />
              Contourner (Mode Démo)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
