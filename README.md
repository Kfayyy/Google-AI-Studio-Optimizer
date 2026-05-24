# Google AI Studio Optimizer

Performance optimization userscript for Google AI Studio.

## Features

- Hide old messages
- Reduce DOM lag
- Collapse code blocks
- Restore hidden messages
- Configurable cache system
- Lightweight floating UI

## Description

Google AI Studio Optimizer is a lightweight userscript that improves performance in long Google AI Studio conversations by reducing DOM overload and optimizing message rendering.

It limits the number of visible messages, adds optional code block collapsing, and manages cached content during extended sessions.

Everything runs locally in your browser. No network requests, no tracking, and no modification of AI responses.

## Key features

* Reduces lag in long conversations
* Limits rendered chat messages (you can configure how many messages are loaded)
* Collapses code blocks automatically (expand/collapse all visible blocks with a button)
* Lightweight caching system (configurable cache size)
* Optional DOM cleanup for improved performance
* Simple floating control panel

## 🎯 Goal

Make long Google AI Studio sessions faster and more responsive without changing how the AI works.

## Installation

### 1. Install Tampermonkey
https://www.tampermonkey.net/

### 2. Install the script
Download:
google-ai-studio-optimizer.user.js

### 3. Open Google AI Studio
https://aistudio.google.com/

---

## Feedback / Issues

If you encounter any problem, please open an issue:
https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues

## Why this script exists

Large conversations in Google AI Studio can become slow because:
- too many DOM nodes,
- huge code blocks,
- continuous rendering.

This userscript reduces lag by:
- hiding old messages,
- purging cached DOM nodes,
- collapsing code automatically.

---

## License

MIT

---

## 📖 Utilisation

Après avoir installé le script et ouvert Google AI Studio, l’optimiseur démarre automatiquement en arrière-plan. Aucune configuration supplémentaire n’est nécessaire.

Le script ajoute deux boutons flottants en bas de la page :

### ⚡ Panneau de l’optimiseur

Cliquez sur le bouton **⚡** pour ouvrir le panneau des paramètres.

Options disponibles :

### **Max visible**

Détermine combien de messages restent affichés dans la conversation.

Exemple :

* "35" → seuls les 35 messages les plus récents restent visibles
* les anciens messages sont automatiquement masqués

Valeurs plus faibles :

* réduisent l’utilisation mémoire
* améliorent les performances
* rendent le défilement plus fluide

Valeurs plus élevées :

* gardent davantage d’historique visible
* utilisent davantage de ressources navigateur

---

### **Restore count**

Détermine combien de messages cachés seront restaurés à chaque clic sur **Restore**.

Exemple :

* "10" → cliquer sur **Restore** réaffiche les 10 derniers messages cachés

Utile lorsque vous souhaitez consulter temporairement une partie plus ancienne de la conversation.

---

### **Cache size**

Détermine combien de messages masqués sont conservés dans le cache de l’optimiseur.

Exemple :

- `50` → les 50 derniers messages masqués restent immédiatement disponibles pour restauration.

Valeurs plus faibles :

- réduisent l’utilisation mémoire
- appliquent un nettoyage plus agressif de l’interface

Valeurs plus élevées :

- gardent davantage d’historique rapidement accessible
- utilisent davantage de ressources navigateur

Remarque : le script agit uniquement sur l’affichage de la page. L’historique de votre conversation dans Google AI Studio n’est ni supprimé ni modifié.

---

### **⚡ Optimizer ON / OFF**

Active ou désactive l’optimisation automatique.

**ON** : Le script est actif

**OFF** : le script est désactivé. Il faut rafraichir la page pour que ce soit effectif. Comportement identique au fait de désactiver le script dnas Tampermonkey

---

### **⬆ Restore**

Restaure des messages cachés selon la valeur définie dans **Restore count**.

Exemple : Si "Restore count = 10" 
Cliquer sur **Restore** réaffiche les 10 derniers messages masqués

---

### **⬇ Clean**

Réapplique un clean avec les paramètres de "Max Visible".

Exemple : Si "Max Visible = 10" 
Cliquer sur **Clean** : Seuls les 10 derniers messages seront visibles

---

### ▼ Bouton de réduction du code

Le bouton **▼** réduit tous les **blocs de code** actuellement visibles.

Cela peut améliorer les performances lors de longues sessions de programmation, car les gros blocs de code développés augmentent fortement la charge de rendu de la page.

Astuce : vous pouvez encapsuler n'importe quel texte dans ces balises :

```csharp
texte
```

---

Le script fonctionne entièrement dans votre navigateur et ne modifie pas les réponses de l’IA ni n’envoie de données à des services externes.
