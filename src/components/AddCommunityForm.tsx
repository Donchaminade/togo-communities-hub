import React, { useState } from 'react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NEIGHBORHOODS, AVAILABLE_TAGS } from '../data/togoData';
import { Info, Plus, Check, Loader2, Sparkles, Send, ShieldAlert, X } from 'lucide-react';
import { Community } from '../types';

interface AddCommunityFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddCommunityForm({ onSuccess, onCancel }: AddCommunityFormProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0].name);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');

  // Auto dispersion of lat/lng center based on selected neighborhood
  const getDispersedCoords = (neighborhoodName: string) => {
    const parent = NEIGHBORHOODS.find((n) => n.name === neighborhoodName);
    if (!parent) return { lat: 6.1360, lng: 1.2220 };
    
    // Static mapping estimation for Lomé coords context
    let centerLat = 6.1360;
    let centerLng = 1.2220;
    
    switch (parent.id) {
      case 'agoe': centerLat = 6.2250; centerLng = 1.2140; break;
      case 'adidogome': centerLat = 6.1810; centerLng = 1.1620; break;
      case 'totsi': centerLat = 6.1950; centerLng = 1.1980; break;
      case 'tokoin': centerLat = 6.1650; centerLng = 1.2210; break;
      case 'deckon': centerLat = 6.1310; centerLng = 1.2250; break;
      case 'nyekonakpoe': centerLat = 6.1360; centerLng = 1.2020; break;
      case 'be': centerLat = 6.1350; centerLng = 1.2510; break;
      case 'baguida': centerLat = 6.1550; centerLng = 1.2950; break;
    }

    // Add slight random noise to prevent coordinates overlaps
    const deltaLat = (Math.random() - 0.5) * 0.005;
    const deltaLng = (Math.random() - 0.5) * 0.005;

    return {
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng
    };
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 5) {
        alert('Vous pouvez choisir un maximum de 5 compétences/technologies.');
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Dynamic validations
    if (!name.trim()) return setError('Veuillez entrer le nom de la communauté.');
    if (!description.trim() || description.length < 20) return setError('Description requise (minimum 20 caractères).');
    if (selectedTags.length === 0) return setError('Veuillez sélectionner au moins 1 mot-clé.');
    if (!leaderName.trim()) return setError('Le nom du responsable est exigé.');
    if (!leaderEmail.trim()) return setError('L\'adresse e-mail de contact est exigée.');

    // Extract dispersion coordinates
    const coords = getDispersedCoords(neighborhood);

    const payload: Partial<Community> = {
      name: name.trim(),
      description: description.trim(),
      logoUrl: logoUrl.trim() || undefined,
      tags: selectedTags,
      whatsappUrl: whatsappUrl.trim() || undefined,
      telegramUrl: telegramUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      twitterUrl: twitterUrl.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      neighborhood,
      lat: coords.lat,
      lng: coords.lng,
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      leaderPhone: leaderPhone.trim() || undefined,
      status: 'pending',
      createdAt: serverTimestamp() // Set server times secure
    };

    try {
      const parentCol = 'communities';
      await addDoc(collection(db, parentCol), payload);
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting form to firestore:', err);
      setLoading(false);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'communities');
      } catch (formattedErr: any) {
        setErrorMsg('Échec de la soumission. Règles de sécurité ou quotas Firestore bloquants.');
      }
    }
  };

  const setError = (text: string) => {
    setErrorMsg(text);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in max-w-4xl mx-auto">
      {/* Togo Flag-inspired visual header banner */}
      <div className="relative h-4 bg-togo-green flex overflow-hidden">
        <div className="bg-togo-red w-12 flex items-center justify-center text-[8px] text-white">⭐</div>
        <div className="flex-1 bg-togo-yellow h-full"></div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              Référencer votre Communauté
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Soumettez votre groupe. Après validation par l'équipe admin, votre fiche sera publiée sur la carte de Lomé.
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-xs flex gap-2 items-center mb-6 border border-red-200">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core details */}
          <div className="bg-slate-50/60 p-5 rounded-2.5xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-togo-green"></span>
              Fiche d'identité générale
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la communauté *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex. GDG Lomé, Togo Devs, Codelab"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green focus:ring-1 focus:ring-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quartier d'activités principal *</label>
                <select 
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-3 py-2.5 transition"
                >
                  {NEIGHBORHOODS.map((n) => (
                    <option key={n.id} value={n.name}>{n.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description et Mission * (Min 20 car.)</label>
              <textarea 
                required
                rows={3}
                placeholder="Décrivez les objectifs, les activités, les types de meetups, le public cible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green focus:ring-1 focus:ring-togo-green outline-none rounded-xl px-4 py-2 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lien du Logo (URL optionnelle)</label>
                <input 
                  type="url" 
                  placeholder="https://exemple.tg/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tags / Skills */}
          <div className="bg-slate-50/60 p-5 rounded-2.5xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-togo-green"></span>
                Technologies & Mots-clés (Max 5) *
              </h3>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                Sélectionnés : {selectedTags.length}/5
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 font-medium ${
                      isSelected 
                        ? 'bg-togo-green border-togo-green text-white font-bold' 
                        : 'bg-white border-slate-200 hover:border-togo-green text-slate-600 hover:text-togo-green'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Links */}
          <div className="bg-slate-50/60 p-5 rounded-2.5xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-togo-green"></span>
              Liens d'accès & Réseaux sociaux
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lien d'intégration Whatsapp (Recommandé)</label>
                <input 
                  type="url" 
                  placeholder="https://chat.whatsapp.com/..."
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lien de canal Telegram</label>
                <input 
                  type="url" 
                  placeholder="https://t.me/ou-groupe"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Page LinkedIn</label>
                <input 
                  type="url" 
                  placeholder="https://linkedin.com/company/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Page Twitter / X</label>
                <input 
                  type="url" 
                  placeholder="https://twitter.com/..."
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site Web Officiel / Blog</label>
                <input 
                  type="url" 
                  placeholder="https://www.macommunaute.tg"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Responsibility */}
          <div className="bg-orange-50/30 p-5 rounded-2.5xl border border-orange-100/50 space-y-4">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              Coordonnées du Responsable (Invisible du public)
            </h3>
            
            <p className="text-[11px] text-slate-500 leading-normal mb-2">
              ⚠️ Ces identifiants restent privés et serviront uniquement aux modérateurs pour vous notifier ou vérifier l'authenticité de l'association.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex. Afi Sika"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green focus:ring-1 focus:ring-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email de contact *</label>
                <input 
                  type="email" 
                  required
                  placeholder="afi.sika@exemple.tg"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green focus:ring-1 focus:ring-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Whatsapp / Appel</label>
                <input 
                  type="tel" 
                  placeholder="+228 99 99 99 99"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 focus:border-togo-green focus:ring-1 focus:ring-togo-green outline-none rounded-xl px-4 py-2.5 transition"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-togo-green hover:bg-togo-green-dark text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Soumettre la communauté
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
