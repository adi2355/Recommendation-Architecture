# Recommendation System

<div align="center">
<h3>2 approaches for my strain recommendation and advanced similarity matching</h3>
</div>

---

## System Evolution

This document provides an overview of my recommendation architecture, comparing our enhanced approach with previous implementation.

| | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **Core Technology** | Pure AI-based recommendations via Anthropic Claude | Hybrid approach combining AI with multi-vector similarity matching |
| **Token Usage** | High (full strain database sent to API) | Optimized (only query processing via API) |
| **Scalability** | Limited by API token constraints | Highly scalable with local strain database |
| **Accuracy** | Good (AI inference-based) | Excellent (mathematical precision with ML) |
| **Performance** | API-dependent | Optimized with sparse matrices and caching |

---
## Application Showcase

<div align="center">
<div style="display: flex; flex-direction: row; gap: 20px; margin-bottom: 20px;">
    <div>
        <img src="Screenshot from 2025-03-10 08-29-01.png" alt="Recommendation Screen" width="380px">
        <p><em>Strain Recommendations</em></p>
    </div>
    <div>
        <img src="Screenshot from 2025-03-10 08-25-05.png" alt="Chat Interface" width="380px">
        <p><em>AI Chat Assistant</em></p>
    </div>
</div>
<div style="display: flex; flex-direction: row; gap: 20px;">
    <div>
        <img src="Screenshot from 2025-03-10 08-30-10.png" alt="Journal Analysis" width="380px">
        <p><em>Journal Insights</em></p>
    </div>
    <div>
        <img src="Screenshot from 2025-03-10 22-30-40.png" alt="Safety Features" width="380px">
        <p><em>Safety Features</em></p>
    </div>
</div>
</div>

## Architecture Overview

<div style="display: flex; flex-direction: row; gap: 20px;">
<div style="flex: 1;">

### Previous Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI Layer (React Native)                       │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │ Recommendations │  │Recommendation    │  │ Other UI Components     │ │
│  │ Screen          │  │Feedback Component│  │                         │ │
│  └────────┬────────┘  └────────┬─────────┘  └─────────────┬───────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                           Hook Layer                                    │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │useAIRecommendat-│  │useStrains        │  │useDataService,          │ │
│  │ions             │  │                  │  │useTimeRangeData         │ │
│  └────────┬────────┘  └────────┬─────────┘  └─────────────┬───────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                  │
│                                                                         │
│  ┌─────────────────────────────────────────┐    ┌──────────────────────┐│
│  │            AIService                    │    │    StrainService     ││
│  │ ┌─────────────────┐ ┌─────────────────┐ │    │                      ││
│  │ │  AnthropicAPI   │ │  FeedbackService│ │    └───────────┬──────────┘│
│  │ └─────────────────┘ └─────────────────┘ │                │           │
│  │ ┌─────────────────┐                     │◄───────────────┘           │
│  │ │  CacheManager   │                     │                            │
│  │ │ ┌─────────────┐ │                     │    ┌──────────────────────┐│
│  │ │ │ MemoryCache │ │                     │    │    SafetyService     ││
│  │ │ └─────────────┘ │                     │◄───┤                      ││
│  │ │ ┌─────────────┐ │                     │    │                      ││
│  │ │ │Persistent   │ │                     │    └──────────────────────┘│
│  │ │ │Cache        │ │                     │                            │
│  │ │ └─────────────┘ │                     │                            │
│  │ └─────────────────┘                     │                            │
│  └─────────────────────────────────────────┘                            │
│                                                                         │
└──────────────────────────────┬────────────────────────────────────┬─────┘
                               │                                    │
                               ▼                                    ▼
┌─────────────────────────────────────────┐  ┌───────────────────────────┐
│            Database Layer               │  │       External APIs       │
│                                         │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  │  ┌─────────────────────┐  │
│  │ DatabaseManager│  │ Repositories   │ │  │  │  Anthropic Claude   │  │
│  └────────┬───────┘  └────────────────┘ │  │  │  API                │  │
│           │                             │  │  └─────────────────────┘  │
│           ▼                             │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  └───────────────────────────┘
│  │ SQLite         │  │ AsyncStorage   │ │
│  │ (Strains,      │  │ (Simple cache, │ │
│  │  Feedback,     │  │  settings)     │ │
│  │  Cache, Safety)│  │                │ │
│  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
```
</div>
<div style="flex: 1;">


### Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI Layer (React Native)                       │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │ Recommendations │  │Recommendation    │  │ Other UI Components     │ │
│  │ Screen          │  │Feedback Component│  │                         │ │
│  └────────┬────────┘  └─────────┬────────┘  └──────────────┬──────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                           Hook Layer                                    │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │useAIRecommendat-│  │useStrains        │  │useDataService,          │ │
│  │ions             │  │                  │  │useTimeRangeData         │ │
│  └────────┬────────┘  └─────────┬────────┘  └──────────────┬──────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                  │
│                                                                         │
│  ┌─────────────────────────────────────────┐    ┌──────────────────────┐│
│  │            AIService                    │    │    StrainService     │|
│  │ ┌─────────────────┐ ┌─────────────────┐ │    │                      ││
│  │ │  AnthropicAPI   │ │  FeedbackService│ │    └───────────┬──────────┘│
│  │ └─────────┬───────┘ └─────────────────┘ │                │           │
│  │           │                             │◄───────────────┘           │
│  │ ┌─────────▼───────┐                     │                            │
│  │ │  CacheManager   │                     │    ┌──────────────────────┐│
│  │ │ ┌─────────────┐ │                     │    │    SafetyService     ││
│  │ │ │ MemoryCache │ │                     │◄───┤                      ││
│  │ │ └─────────────┘ │                     │    │                      ││
│  │ │ ┌─────────────┐ │                     │    └──────────────────────┘│
│  │ │ │Persistent   │ │                     │                            │
│  │ │ │Cache        │ │                     │                            │
│  │ │ └─────────────┘ │                     │                            │
│  │ └─────────────────┘                     │                            │
│  └─────────┬───────────────────────────────┘                            │
│            │                                                            │
│  ┌─────────▼───────────────────────────────┐                            │
│  │      Strain Matching Engine             │                            │
│  │ ┌─────────────────┐ ┌─────────────────┐ │                            │
│  │ │Multi-Vector     │ │Diversity        │ │                            │
│  │ │Similarity       │ │Selection        │ │                            │
│  │ └─────────────────┘ └─────────────────┘ │                            │
│  │ ┌─────────────────┐ ┌─────────────────┐ │                            │
│  │ │Sparse Matrix    │ │Similarity       │ │                            │
│  │ │Optimization     │ │Cache            │ │                            │
│  │ └─────────────────┘ └─────────────────┘ │                            │
│  └─────────────────────────────────────────┘                            │
│                                                                         │
└──────────────────────────────┬────────────────────────────────────┬─────┘
                               │                                    │
                               ▼                                    ▼
┌─────────────────────────────────────────┐  ┌───────────────────────────┐
│            Database Layer               │  │       External APIs       │
│                                         │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  │  ┌─────────────────────┐  │
│  │ DatabaseManager│  │ Repositories   │ │  │  │  Anthropic Claude   │  │
│  └────────┬───────┘  └────────────────┘ │  │  │  API                │  │
│           │                             │  │  └─────────────────────┘  │
│           ▼                             │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  └───────────────────────────┘
│  │ SQLite         │  │ AsyncStorage   │ │
│  │ (Strains,      │  │ (Simple cache, │ │
│  │  Feedback,     │  │  settings)     │ │
│  │  Cache, Safety)│  │                │ │
│  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
```

</div>
</div>

---

## Data Flow

## Data Flow Diagrams

### Previous Implementation

#### Recommendation Flow
```
┌────┐     ┌───────────────────┐     ┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────┐
│ UI │────►│useAIRecommendations────►│AIService│────►│SafetyService │────►│AnthropicAPI │────►│CacheManager │────►│ UI │
└────┘     └───────────────────┘     └─────────┘     └──────────────┘     └─────────────┘     └─────────────┘     └────┘
```

#### Chat Flow
```
┌────┐     ┌───────────────────┐     ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌────┐
│ UI │────►│useAIRecommendation│───► │AIService│────►│AnthropicAPI │────►│CacheManager │────►│ UI │
└────┘     └───────────────────┘     └─────────┘     └─────────────┘     └─────────────┘     └────┘
```

### Current Implementation

#### Recommendation Flow
```
┌────┐     ┌───────────────────┐     ┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────────────────┐     ┌─────────────┐     ┌────┐
│ UI │────►│useAIRecommendation│────►│AIService│────►│SafetyService │────►│AnthropicAPI │────►│Strain Matching Engine │────►│CacheManager │────►│ UI │
└────┘     └───────────────────┘     └─────────┘     └──────────────┘     └─────────────┘     │(Multi-VectorSimilarity│     └─────────────┘     └────┘
                                                                                              │Calculations)          │
                                                                                              └───────────────────────┘
```

#### Chat Flow
```
┌────┐     ┌───────────────────┐     ┌─────────┐     ┌─────────────────┐     ┌───────────────────────┐     ┌─────────────────┐     ┌─────────────┐     ┌────┐
│ UI │────►│useAIRecommendation│────►│AIService│────►│AnthropicAPI     │────►│Strain Matching Engine │────►│AnthropicAPI     │────►│CacheManager │────►│ UI │
└────┘     └───────────────────┘     └─────────┘     │(QueryProcessing)│     │(Multi-VectorSimilarity│     │(Response Fusion)│     └─────────────┘     └────┘
                                                     └─────────────────┘     │Calculations)          │     └─────────────────┘
                                                                             └───────────────────────┘
```

### Recommendation Flow

| Step | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **1** | User inputs preferences via Recommendations Screen | User inputs preferences via Recommendations Screen |
| **2** | useAIRecommendations hook processes request | useAIRecommendations hook processes request |
| **3** | AIService delegates to SafetyService for validation | AIService delegates to SafetyService for validation |
| **4** | If safe, AIService checks CacheManager for similar requests | If safe, AIService sends only query to Anthropic API for natural language processing |
| **5** | If not cached, AIService sends full strain data to Anthropic API | Structured preferences passed to Strain Matching Engine for multi-vector similarity calculations |
| **6** | Response is processed, enhanced with safety notes, cached, and returned to UI | Response is processed, enhanced with safety notes, cached, and returned to UI |
| **7** | User provides feedback through RecommendationFeedback component | User provides feedback through RecommendationFeedback component |

### Chat Flow

| Step | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **1** | User sends message through chat interface | User sends message through chat interface |
| **2** | useAIRecommendations hook forwards request to AIService | useAIRecommendations hook forwards request to AIService |
| **3** | AIService checks CacheManager for similar conversations | AIService sends message to Anthropic API |
| **4** | If not found, message is sent to Anthropic API | If message contains strain recommendation requests, query is extracted and processed by Strain Matching Engine |
| **5** | Response is processed, cached, and returned to UI | Strain recommendations incorporated into chat response |
| **6** | - | Final response is processed, cached, and returned to UI |

---

## Key Components

| Component | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **AIService** | Central orchestrator for AI features             | Central orchestrator for AI features |
| **Strain Matching Engine** | Not present             | Advanced recommendation system with multi-vector similarity, sparse matrix optimization, diversity selection, confidence scoring, and negative correlation insights |
| **SafetyService** | Ensures recommendations are safe             | Ensures recommendations are safe |
| **CacheManager** | Multi-level caching system             | Multi-level caching system |
| **FeedbackService** | Collects and processes user feedback             | Collects and processes user feedback |
| **StrainService** | Manages cannabis strain data             | Manages cannabis strain data |
| **DatabaseManager** | Coordinates database access             | Coordinates database access |

---

## Algorithms & Techniques

| Aspect | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **Approach** | AI-based strain matching via Anthropic API | Multi-vector similarity with mathematical precision |
| **Feature Analysis** | Uses NLP to analyze desired effects | One-hot encoding of strain attributes |
| **Data Structure** | Full JSON data | Memory-efficient sparse matrices |
| **Similarity Calculation** | AI inference | Weighted cosine similarity across attribute categories |
| **Diversity** | Simple filtering | Maximal Marginal Relevance (MMR) algorithm |
| **Conflict Resolution** | Basic | Negative correlation insights to avoid contradictory effects |
| **Confidence** | Fixed values | Dynamic scoring based on match quality and data completeness |
| **Performance** | API-limited | Similarity caching for repeated calculations |
| **Key Advantages** | Natural language understanding | Token efficiency, scalability, accuracy, performance, diversity |

---

## Libraries & Frameworks

| Category | **Previous Implementation** | **Current Implementation** |
|:--|:--|:--|
| **App Framework** | React Native & Expo | React Native & Expo |
| **Database** | expo-sqlite, async-storage | expo-sqlite, async-storage |
| **ML & Analytics** | None | scikit-learn, scipy, numpy, pandas |
| **UI & Navigation** | expo-router, expo-vector-icons | expo-router, expo-vector-icons |
| **Utilities** | Custom logging, SHA-256 hashing | Custom logging, SHA-256 hashing |

---

## Future Improvements

| Category | **Previous Roadmap** | **Current Roadmap** |
|:--|:--|:--|
| **AI/ML Integration** | Enhanced AI Integration | Collaborative filtering, sophisticated diversity algorithms, TensorFlow Lite for image classification |
| **Analytics** | Advanced Analytics | Enhanced journal analysis, ML models for predictions, comparative user analytics |
| **Architecture** | Architecture Optimization | Distributed computation, event-driven architecture, comprehensive error handling |
| **Technical** | Technical Improvements | Remote database migration, end-to-end encryption, sparse matrix optimization |
| **Safety** | Expanded Safety Features | Integrated into other improvement areas |

---

<div align="center">
<p>© Recommendation System</p>
</div>
