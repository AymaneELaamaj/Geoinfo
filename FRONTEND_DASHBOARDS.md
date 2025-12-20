# 🎨 Documentation Frontend - Dashboards Admin & Professionnel

## 📋 Vue d'ensemble

Le frontend React a été adapté pour gérer deux vues distinctes selon le rôle de l'utilisateur connecté :
- **Dashboard Administrateur** : Validation/rejet d'incidents + gestion des professionnels
- **Dashboard Professionnel** : Traitement des incidents validés de son secteur

---

## 🔐 Authentification et Rôles

### AuthContext.jsx
```jsx
const { user, login, logout, isAuthenticated } = useAuth();

// Structure de l'utilisateur :
user = {
  id: 1,
  nom: "Alami",
  prenom: "Hassan",
  email: "h.alami@geo.ma",
  role: "ADMIN" | "PROFESSIONNEL" | "CITOYEN",
  telephone: "0612345678",
  secteurAffectate: 1, // Pour les professionnels
  typeIncident: "EAU", // Pour les professionnels
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Vérification des rôles
```jsx
import { authAPI } from '../services/api';

// Vérifications disponibles :
authAPI.isAdmin()          // true si ADMIN
authAPI.isProfessionnel()  // true si PROFESSIONNEL
authAPI.isCitoyen()        // true si CITOYEN
authAPI.getUserRole()      // Retourne le rôle actuel
```

---

## 👨‍💼 Dashboard Administrateur

### Fichier : `/frontend/src/pages/AdminDashboard.jsx`

### Fonctionnalités

#### 1️⃣ **Onglet "Incidents à valider"**

**Affichage :**
- Liste des incidents avec statut `REDIGE` ou `EN_ATTENTE_VALIDATION`
- Tableau avec colonnes : ID, Titre, Description, Secteur, Date, Actions

**Actions disponibles :**
- ✅ **Valider** : Passe l'incident au statut `VALIDE_PUBLIE`
  ```javascript
  await adminAPI.validerIncident(incidentId);
  ```

- ❌ **Rejeter** : Ouvre une modale pour saisir le `motifRejet`
  ```javascript
  await adminAPI.rejeterIncident(incidentId, motifRejet);
  ```

**API appelée :**
```javascript
GET /api/admin/incidents/en-attente
PUT /api/admin/incidents/{id}/valider
PUT /api/admin/incidents/{id}/rejeter
```

#### 2️⃣ **Onglet "Gestion Utilisateurs"**

**Affichage :**
- Liste des professionnels enregistrés
- Tableau avec colonnes : Nom, Email, Téléphone, Secteur, Spécialité, Actions

**Actions disponibles :**
- ➕ **Nouveau Professionnel** : Ouvre une modale de création
- ✏️ **Modifier** : Édite un professionnel existant
- 🗑️ **Supprimer** : Supprime un professionnel

**Formulaire professionnel :**
```jsx
{
  nom: string (obligatoire),
  prenom: string,
  email: string (obligatoire),
  motDePasse: string (obligatoire pour création),
  telephone: string,
  secteurAffectate: number (obligatoire - ID du secteur),
  typeIncident: enum (obligatoire - EAU, ELECTRICITE, ROUTE...)
}
```

**API appelée :**
```javascript
GET /api/admin/professionnels
POST /api/admin/professionnels
PUT /api/admin/professionnels/{id}
DELETE /api/admin/professionnels/{id}
```

### Composants créés

```jsx
<AdminDashboard />              // Composant principal
  ├── <IncidentsTab />          // Liste des incidents à valider
  ├── <UtilisateursTab />       // Gestion des professionnels
  ├── <RejetModal />            // Modale de rejet avec motif
  └── <ProfessionnelModal />    // Modale de création/modification
```

### Exemple d'utilisation

```jsx
import AdminDashboard from './pages/AdminDashboard';

// Dans App.jsx :
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 👷 Dashboard Professionnel

### Fichier : `/frontend/src/pages/ProfessionnelDashboard.jsx`

### Fonctionnalités

#### Filtrage automatique des incidents

Le backend filtre automatiquement les incidents selon :
- ✅ **Statut** = `VALIDE_PUBLIE`
- 🏢 **Secteur** = `professionnel.secteurAffectate`
- 🔧 **Type** = `professionnel.typeIncident`

**API appelée :**
```javascript
GET /api/professionnel/incidents?statut=VALIDE_PUBLIE&page=0&size=50
```

#### Actions de traitement

**Changer le statut d'un incident :**

1. **Pris en compte** (`PRIS_EN_COMPTE`)
   ```javascript
   await api.professionnel.prendreEnCompte(incidentId);
   ```

2. **En cours** (`EN_COURS`)
   ```javascript
   await api.professionnel.demarrerTraitement(incidentId);
   ```

3. **Traité** (`TRAITE`) - ⚠️ Description obligatoire
   ```javascript
   await api.professionnel.traiterIncident(incidentId, descriptionTraitement);
   ```

4. **Bloqué** (`BLOQUE`) - ⚠️ Motif obligatoire
   ```javascript
   await api.professionnel.bloquerIncident(incidentId, motifBlocage);
   ```

### Modal de traitement

**Champs du formulaire :**
- 🎯 **Nouveau statut** (liste déroulante) - Obligatoire
  - ✅ Pris en compte
  - 🔄 En cours de traitement
  - ✔️ Traité (terminé)
  - 🚫 Bloqué

- 📝 **Description du traitement / Motif** - Obligatoire pour TRAITE et BLOQUE
  - Si TRAITE : "Décrivez les actions effectuées..."
  - Si BLOQUE : "Expliquez pourquoi l'incident est bloqué..."

### Composants créés

```jsx
<ProfessionnelDashboard />      // Composant principal
  └── <TraitementModal />       // Modale de changement de statut
```

### Exemple d'utilisation

```jsx
import ProfessionnelDashboard from './pages/ProfessionnelDashboard';

// Dans App.jsx :
<Route 
  path="/pro" 
  element={
    <ProtectedRoute requiredRole="PROFESSIONNEL">
      <ProfessionnelDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🔧 Services API

### Fichier : `/frontend/src/services/api.js`

### API Admin
```javascript
import { adminAPI } from '../services/api';

// Incidents
adminAPI.getIncidentsEnAttente()
adminAPI.validerIncident(id)
adminAPI.rejeterIncident(id, motif)
adminAPI.getIncidentsRejetes()

// Professionnels
adminAPI.getAllProfessionnels()
adminAPI.createProfessionnel(data)
adminAPI.updateProfessionnel(id, data)
adminAPI.deleteProfessionnel(id)
adminAPI.toggleProfessionnelStatus(id)

// Dashboard
adminAPI.getDashboard()
adminAPI.getStatistiquesBySecteur()
adminAPI.getRapportProfessionnels()
```

### API Professionnel
```javascript
import { api } from '../services/api';

// Incidents
api.professionnel.getMesIncidents({ statut, page, size })
api.professionnel.getIncidentById(id)

// Changement de statut
api.professionnel.prendreEnCompte(id)
api.professionnel.demarrerTraitement(id)
api.professionnel.traiterIncident(id, description)
api.professionnel.bloquerIncident(id, motif)
api.professionnel.debloquerIncident(id)

// Dashboard
api.professionnel.getDashboard()
api.professionnel.getProfil()
api.professionnel.getStatistiques()
```

---

## 🛣️ Routes et Navigation

### Fichier : `/frontend/src/App.jsx`

### Routes publiques
```jsx
/                      → Home
/connexion            → Page de connexion
/declarer-incident    → Déclaration d'incident (citoyens)
/incidents            → Liste publique des incidents
/carte                → Carte interactive
```

### Routes Admin (protégées)
```jsx
/admin                → AdminDashboard (onglets Incidents + Utilisateurs)
/admin/dashboard      → Même que /admin
/admin/utilisateurs   → Page de gestion (legacy, peut être supprimée)
```

### Routes Professionnel (protégées)
```jsx
/pro                      → ProfessionnelDashboard
/professionnel/dashboard  → Même que /pro
```

### Protection des routes

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🎨 Styles et UI

### Tailwind CSS

Tous les composants utilisent **Tailwind CSS** pour le style :

```jsx
// Bouton principal
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// Badge de statut
className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"

// Tableau
className="min-w-full divide-y divide-gray-200"
```

### Icônes Lucide React

```jsx
import { 
  Shield, CheckCircle, XCircle, AlertCircle, 
  Users, Edit, Trash2, UserPlus, ThumbsUp, ThumbsDown
} from 'lucide-react';

<Shield className="w-8 h-8 text-blue-600" />
```

---

## 📊 Gestion de l'état

### États locaux

```jsx
// AdminDashboard
const [activeTab, setActiveTab] = useState('incidents');
const [incidentsEnAttente, setIncidentsEnAttente] = useState([]);
const [professionnels, setProfessionnels] = useState([]);
const [secteurs, setSecteurs] = useState([]);

// ProfessionnelDashboard
const [incidents, setIncidents] = useState([]);
const [selectedIncident, setSelectedIncident] = useState(null);
const [nouveauStatut, setNouveauStatut] = useState('');
```

### Chargement des données

```jsx
useEffect(() => {
  loadData();
}, [activeTab]);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await adminAPI.getIncidentsEnAttente();
    setIncidentsEnAttente(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## ⚠️ Validation et Erreurs

### Validation côté client

```jsx
// Formulaire professionnel
if (!professionnelForm.nom || !professionnelForm.email) {
  alert('⚠️ Nom et email sont obligatoires !');
  return;
}

if (!editingProfessionnel && !professionnelForm.motDePasse) {
  alert('⚠️ Le mot de passe est obligatoire !');
  return;
}

// Traitement d'incident
if (nouveauStatut === 'TRAITE' && !descriptionTraitement.trim()) {
  alert('⚠️ La description du traitement est obligatoire !');
  return;
}
```

### Gestion des erreurs API

```jsx
try {
  await adminAPI.validerIncident(incidentId);
  alert('✅ Incident validé avec succès !');
  loadData();
} catch (err) {
  console.error('Erreur validation:', err);
  alert('❌ Erreur : ' + err.message);
}
```

---

## 🧪 Tests et Vérifications

### Test du Dashboard Admin

1. Se connecter en tant qu'admin
2. Vérifier l'onglet "Incidents à valider"
   - Liste des incidents REDIGE/EN_ATTENTE_VALIDATION
   - Bouton Valider fonctionne
   - Bouton Rejeter ouvre la modale
   - Motif de rejet obligatoire

3. Vérifier l'onglet "Gestion Utilisateurs"
   - Liste des professionnels
   - Création d'un nouveau professionnel
   - Modification
   - Suppression avec confirmation

### Test du Dashboard Professionnel

1. Se connecter en tant que professionnel
2. Vérifier le filtrage automatique
   - Seulement les incidents VALIDE_PUBLIE
   - Du même secteur
   - Du même type d'incident

3. Tester les changements de statut
   - Pris en compte (sans description)
   - En cours (sans description)
   - Traité (description obligatoire)
   - Bloqué (motif obligatoire)

---

## 🔄 Workflow Complet

### Flux Admin → Professionnel

```
1. CITOYEN déclare incident
   ↓
2. Statut = REDIGE (automatique)
   ↓
3. ADMIN voit l'incident dans "Incidents à valider"
   ↓
4. ADMIN clique "Valider"
   ↓
5. Statut = VALIDE_PUBLIE
   ↓
6. PROFESSIONNEL voit l'incident dans sa liste
   (si secteur et type correspondent)
   ↓
7. PROFESSIONNEL clique "Traiter"
   ↓
8. PROFESSIONNEL change statut → PRIS_EN_COMPTE → EN_COURS → TRAITE
   ↓
9. Incident résolu ✅
```

### Flux Admin → Rejet

```
1. CITOYEN déclare incident
   ↓
2. ADMIN voit l'incident
   ↓
3. ADMIN clique "Rejeter"
   ↓
4. Modal demande motifRejet (obligatoire)
   ↓
5. Statut = REJETE
   ↓
6. Incident n'apparaît plus aux professionnels ❌
```

---

## 📦 Dépendances Frontend

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.x",
    "lucide-react": "latest",
    "axios": "^1.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "tailwindcss": "^3.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## 🚀 Prochaines Améliorations

- [ ] Pagination des listes d'incidents
- [ ] Filtres avancés (date, secteur, statut)
- [ ] Graphiques de statistiques
- [ ] Notifications en temps réel
- [ ] Export des données (CSV, PDF)
- [ ] Historique des actions
- [ ] Recherche globale
- [ ] Mode sombre

---

## 📖 Références

- **AdminDashboard** : `/frontend/src/pages/AdminDashboard.jsx`
- **ProfessionnelDashboard** : `/frontend/src/pages/ProfessionnelDashboard.jsx`
- **Services API** : `/frontend/src/services/api.js`
- **Routes** : `/frontend/src/App.jsx`
- **AuthContext** : `/frontend/src/contexts/AuthContext.jsx`
- **ProtectedRoute** : `/frontend/src/components/ProtectedRoute.jsx`

---

*Dernière mise à jour : Décembre 2025 - Frontend React adapté aux rôles Admin et Professionnel*
