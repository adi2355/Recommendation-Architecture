# Canova AI Cannabis Recommendation System

<div align="center">
<h3>Intelligent strain recommendations powered by AI and advanced similarity matching</h3>
</div>

---

## System Evolution

This document provides an overview of Canova's recommendation architecture, comparing our enhanced approach with previous implementation.

| | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **Core Technology** | Pure AI-based recommendations via Anthropic Claude | Hybrid approach combining AI with multi-vector similarity matching |
| **Token Usage** | High (full strain database sent to API) | Optimized (only query processing via API) |
| **Scalability** | Limited by API token constraints | Highly scalable with local strain database |
| **Accuracy** | Good (AI inference-based) | Excellent (mathematical precision with ML) |
| **Performance** | API-dependent | Optimized with sparse matrices and caching |

---

## Architecture Overview

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Architecture

```
┌───────────────────────────┐
│       UI Layer            │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│       Hook Layer          │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     Service Layer         │
│ ┌─────────────────────┐   │
│ │      AIService      │   │
│ │ ┌───────────┐       │   │
│ │ │Anthropic  │       │   │
│ │ │API        │       │   │
│ │ └───────────┘       │   │
│ │ ┌───────────┐       │   │
│ │ │CacheManager│      │   │
│ │ └───────────┘       │   │
│ └─────────────────────┘   │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     Database Layer        │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     External APIs         │
└───────────────────────────┘
```

</div>
<div style="flex: 1;">

### Current Architecture

```
┌───────────────────────────┐
│       UI Layer            │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│       Hook Layer          │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     Service Layer         │
│ ┌─────────────────────┐   │
│ │      AIService      │   │
│ │ ┌───────────┐       │   │
│ │ │Anthropic  │       │   │
│ │ │API        │       │   │
│ │ └─────┬─────┘       │   │
│ │ ┌─────▼─────┐       │   │
│ │ │CacheManager│      │   │
│ │ └───────────┘       │   │
│ └─────────┬───────────┘   │
│           ▼               │
│ ┌─────────────────────┐   │
│ │Strain Matching Engine│  │
│ └─────────────────────┘   │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     Database Layer        │
└──────────────┬────────────┘
               ▼
┌──────────────┴────────────┐
│     External APIs         │
└───────────────────────────┘
```

</div>
</div>

---

## Data Flow

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Recommendation Flow

1. User inputs preferences via Recommendations Screen
2. `useAIRecommendations` hook processes request
3. AIService delegates to SafetyService for validation
4. If safe, AIService checks CacheManager for similar requests
5. If not cached, AIService sends full strain data to Anthropic API
6. Response is processed, enhanced with safety notes, cached, and returned to UI
7. User provides feedback through RecommendationFeedback component

</div>
<div style="flex: 1;">

### Current Recommendation Flow

1. User inputs preferences via Recommendations Screen
2. `useAIRecommendations` hook processes request
3. AIService delegates to SafetyService for validation
4. If safe, AIService sends only query to Anthropic API for natural language processing
5. Structured preferences passed to Strain Matching Engine for:
   - Multi-vector weighted cosine similarity calculations
   - Sparse matrix operations for memory efficiency
   - Diversity selection for varied recommendations
6. Response is processed, enhanced with safety notes, cached, and returned to UI
7. User provides feedback through RecommendationFeedback component

</div>
</div>

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Chat Flow

1. User sends message through chat interface
2. `useAIRecommendations` hook forwards request to AIService
3. AIService checks CacheManager for similar conversations
4. If not found, message is sent to Anthropic API
5. Response is processed, cached, and returned to UI

</div>
<div style="flex: 1;">

### Current Chat Flow

1. User sends message through chat interface
2. `useAIRecommendations` hook forwards request to AIService
3. AIService sends message to Anthropic API
4. If message contains strain recommendation requests:
   - Query is extracted and processed by Strain Matching Engine
   - Strain recommendations incorporated into chat response
5. Final response is processed, cached, and returned to UI

</div>
</div>

---

## Key Components

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Components

- **AIService**: Central orchestrator for AI features
- **SafetyService**: Ensures recommendations are safe
- **CacheManager**: Multi-level caching system
- **FeedbackService**: Collects and processes user feedback
- **StrainService**: Manages cannabis strain data
- **DatabaseManager**: Coordinates database access

</div>
<div style="flex: 1;">

### Current Components

- **AIService**: Central orchestrator for AI features
- **Strain Matching Engine**: Advanced recommendation system with:
  - Multi-vector weighted cosine similarity
  - Sparse matrix optimization
  - Diversity selection algorithms
  - Confidence scoring
  - Negative correlation insights
- **SafetyService**: Ensures recommendations are safe
- **CacheManager**: Multi-level caching system
- **FeedbackService**: Collects and processes user feedback
- **StrainService**: Manages cannabis strain data
- **DatabaseManager**: Coordinates database access

</div>
</div>

---

## Algorithms & Techniques

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Strain Matching

- AI-based strain matching via Anthropic API
- Analyzes desired effects against strain characteristics
- Considers medical needs and context
- Accounts for user experience level and THC tolerance
- Calculates match scores based on multiple weighted factors
- Uses natural language processing to interpret requests

</div>
<div style="flex: 1;">

### Current Strain Matching

The Strain Matching Engine implements:
- One-hot encoding of strain attributes
- Memory-efficient sparse matrices
- Weighted cosine similarity across attribute categories
- Diversity selection via Maximal Marginal Relevance (MMR)
- Negative correlation insights to avoid contradictory effects
- Confidence scoring based on match quality and data completeness
- Similarity caching for performance

**Advantages:**
- **Token Efficiency**: Reduces API costs by processing strain data locally
- **Scalability**: Handles larger strain databases without increasing API costs
- **Accuracy**: Uses precise mathematical similarity rather than AI approximation
- **Performance**: Optimized for mobile with sparse matrices and caching
- **Diversity**: Ensures recommendations aren't too similar to each other

</div>
</div>

---

## Libraries & Frameworks

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Libraries

- **React Native & Expo**: Mobile app development
- **Database Libraries**:
  - expo-sqlite
  - @react-native-async-storage/async-storage
- **UI and Navigation**:
  - expo-router
  - @expo/vector-icons
- **Utility Libraries**:
  - Custom logging and error handling
  - SHA-256 hashing for cache keys

</div>
<div style="flex: 1;">

### Current Libraries

- **React Native & Expo**: Mobile app development
- **Database Libraries**:
  - expo-sqlite
  - @react-native-async-storage/async-storage
- **ML and Analytics Libraries**:
  - scikit-learn: For cosine similarity calculations
  - scipy: Provides sparse matrix operations
  - numpy: Handles numerical computations
  - pandas: Used for data manipulation
- **UI and Navigation**:
  - expo-router
  - @expo/vector-icons
- **Utility Libraries**:
  - Custom logging and error handling
  - SHA-256 hashing for cache keys

</div>
</div>

---

## Future Improvements

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Roadmap

- Enhanced AI Integration
- Advanced Analytics
- Architecture Optimization
- Technical Improvements
- Expanded Safety Features

</div>
<div style="flex: 1;">

### Current Roadmap

- **Enhanced ML Integration**:
  - Add collaborative filtering
  - Implement more sophisticated diversity algorithms
  - Integrate TensorFlow Lite for on-device strain image classification
- **Advanced Analytics**:
  - Enhance journal analysis algorithms
  - Implement ML models for personalized predictions
  - Add comparative analytics between user populations
- **Architecture Optimization**:
  - Implement distributed computation for strain matching
  - Move to event-driven architecture
  - Add comprehensive error handling
- **Technical Improvements**:
  - Migrate to robust remote database
  - Implement end-to-end encryption
  - Further optimize sparse matrix operations

</div>
</div>

---

<div align="center">
<p>© Canova AI Recommendation System</p>
</div>
