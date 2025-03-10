# Recommendation Architecture

## Project Overview

Recommendation and insights platform that helps users find personalized strain recommendations based on their preferences, experience level, and medical needs. The system utilizes advanced AI models to analyze user profiles, provides interactive chat functionality for education and guidance, and offers journal analytics to help users understand their consumption patterns and effects.

### Key Features

- **AI-Powered Strain Recommendations**: Personalized cannabis strain suggestions based on desired effects, medical needs, and user experience level
- **Interactive Chat**: Conversational AI assistant for education and guidance on cannabis use
- **Journal Analytics**: Insights and pattern recognition from user consumption journals
- **Safety Validation**: Comprehensive safety checks for recommendations, including medication interaction detection and overuse monitoring
- **Usage Statistics**: Visualization of consumption patterns and effects over time
- **Feedback Collection**: System for gathering and analyzing user feedback to improve recommendations

## Architecture

### High-Level Architecture

Canova follows a layered architecture with clear separation of concerns:

1. **UI Layer**: React Native components that provide the user interface
2. **Hook Layer**: React hooks that serve as the interface between UI and services
3. **Service Layer**: Core business logic and external API integration
4. **Database Layer**: SQLite databases and AsyncStorage for persistent data
5. **External API Layer**: Integration with Anthropic's Claude API for AI capabilities

The system uses a combination of AI-powered analysis (via Anthropic's Claude API) and local algorithms for strain matching, pattern recognition, and safety validation.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI Layer (React Native)                        │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │ Recommendations │  │Recommendation     │  │ Other UI Components     │ │
│  │ Screen          │  │Feedback Component │  │                         │ │
│  └────────┬────────┘  └─────────┬────────┘  └──────────────┬──────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                           Hook Layer                                     │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │useAIRecommendat-│  │useStrains        │  │useDataService,          │ │
│  │ions             │  │                   │  │useTimeRangeData         │ │
│  └────────┬────────┘  └─────────┬────────┘  └──────────────┬──────────┘ │
└───────────┼────────────────────┼──────────────────────────┼─────────────┘
            │                    │                          │               
            ▼                    ▼                          ▼               
┌─────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                   │
│                                                                          │
│  ┌─────────────────────────────────────────┐    ┌──────────────────────┐│
│  │            AIService                     │    │    StrainService     ││
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
│                                                                          │
└──────────────────────────────┬────────────────────────────────────┬─────┘
                               │                                    │
                               ▼                                    ▼
┌─────────────────────────────────────────┐  ┌───────────────────────────┐
│            Database Layer               │  │       External APIs        │
│                                         │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  │  ┌─────────────────────┐ │
│  │ DatabaseManager│  │ Repositories   │ │  │  │  Anthropic Claude   │ │
│  └────────┬───────┘  └────────────────┘ │  │  │  API                │ │
│           │                              │  │  └─────────────────────┘ │
│           ▼                              │  │                           │
│  ┌────────────────┐  ┌────────────────┐ │  └───────────────────────────┘
│  │ SQLite         │  │ AsyncStorage   │ │
│  │ (Strains,      │  │ (Simple cache, │ │
│  │  Feedback,     │  │  settings)     │ │
│  │  Cache, Safety)│  │                │ │
│  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
```

## Data Flow

### Recommendation Flow

1. User inputs desired effects, medical needs, and context via the Recommendations Screen
2. `useAIRecommendations` hook processes the request and calls AIService
3. AIService first delegates to SafetyService for validation checks:
   - Medication interactions
   - Overuse patterns
   - User experience level adjustments
4. If safety checks pass, AIService checks CacheManager for similar requests
5. If not cached, AIService either:
   - Makes a request to Anthropic API (production)
   - Uses local strain matching algorithm with StrainService data (development/fallback)
6. Response is processed, enhanced with safety notes by SafetyService, cached via CacheManager, and returned to UI
7. User can provide feedback through RecommendationFeedback component, which is processed by FeedbackService

### Chat Flow

1. User sends message through chat interface
2. `useAIRecommendations` hook forwards request to AIService.getChatResponse
3. AIService checks CacheManager for similar previous conversations
4. If not found, AIService formats the message and sends it to AnthropicAPI
5. Response is processed, cached via CacheManager, and returned to UI

### Journal Analysis Flow

1. User journal entries are collected over time and stored in SQLite via DatabaseManager
2. `useAIRecommendations` hook calls AIService.analyzeJournalEntries
3. AIService formats the journal entries and sends them to AnthropicAPI
4. AI identifies patterns, insights, and recommendations
5. Results are returned through the hook layer to the UI for display

## Key Components

### AIService

Central orchestrator for all AI features that:
- Manages strain recommendations by coordinating multiple subcomponents
- Processes chat interactions through AnthropicAPI
- Analyzes journal entries for patterns and insights
- Integrates with SafetyService for validation
- Delegates to CacheManager for performance optimization
- Works with FeedbackService for quality improvement

### SafetyService

Independent service that ensures recommendations are safe for users:
- Validates recommendation requests before processing
- Checks for drug interactions with medications
- Detects patterns of potential overuse
- Manages cooling-off periods for users with concerns
- Provides educational content on responsible use
- Enhances recommendations with safety information

### CacheManager

Multi-level caching system integrated with AIService:
- Orchestrates both MemoryCache (fast, volatile) and PersistentCache (durable)
- Implements intelligent eviction strategies based on access patterns
- Handles cache invalidation and pruning
- Optimizes performance for repeated requests

### FeedbackService

Component of AIService that collects and processes user feedback:
- Stores user ratings and comments in SQLite via DatabaseManager
- Evaluates response quality
- Extracts patterns to improve future recommendations

### StrainService

Independent service managing cannabis strain data:
- Maintains SQLite database of strain information
- Provides search and filtering functionality
- Retrieves detailed strain information
- Identifies related strains based on characteristics
- Tracks strain popularity and ratings

### DatabaseManager

Coordinates access to multiple SQLite databases:
- Strain database for cannabis information
- Feedback database for user feedback
- Cache database for persistent caching
- Safety database for safety records and concerns

### UI Components

- **RecommendationsScreen**: Main interface for personalized strain recommendations
- **RecommendationFeedback**: Collects user feedback on recommendations
- **ChatScreen**: Interface for AI-powered conversation

### React Hooks

- **useAIRecommendations**: Primary hook for accessing all AI features
- **useStrains**: Hook for working with StrainService
- **useDataService**: Hook for accessing analytics data
- **useTimeRangeData**: Hook for time-based data visualization

## APIs and External Services

### Anthropic Claude API

The system integrates with Anthropic's Claude AI model through AnthropicAPI component:
- Used for generating strain recommendations
- Processes natural language chat interactions
- Analyzes journal entries for patterns and insights
- API calls are managed with rate limiting, error handling, and caching

### SQLite Database

Local database for persistent storage, accessed through DatabaseManager:
- Strain information and characteristics
- User feedback and preferences
- Cache entries for AI responses
- Safety records and concerns

### AsyncStorage

Lightweight key-value storage for simple persistent data:
- Educational content
- Initialization flags
- User preferences
- Simple caching

## Libraries and Frameworks

### React Native & Expo

- Primary framework for mobile app development
- Cross-platform UI components
- Expo for simplified development workflow

### Database Libraries

- **expo-sqlite**: Interface for SQLite database operations
- **@react-native-async-storage/async-storage**: Simple key-value storage

### UI and Navigation

- **expo-router**: Navigation and routing system
- **@expo/vector-icons**: Icon set for UI elements

### Utility Libraries

- Custom logging and error handling utilities
- SHA-256 hashing for cache keys

## Algorithms and Techniques

### Strain Matching Algorithm

AIService implements a sophisticated algorithm to match user preferences with appropriate cannabis strains:
- Analyzes desired effects against strain characteristics from StrainService
- Considers medical needs and context (recreational/medical)
- Accounts for user experience level and THC tolerance
- Calculates match scores based on multiple weighted factors
- Uses natural language processing to interpret user requests

### Pattern Recognition for Journal Analysis

AIService implements pattern recognition for journal entries:
- Tracks trends in dosage, frequency, and effects over time
- Uses simple linear regression to detect increasing/decreasing trends
- Identifies correlations between strains and reported effects
- Detects potential tolerance development and effectiveness changes

### Safety Validation System

SafetyService implements multiple safety algorithms:
- Medication interaction detection against known drug categories
- Multi-factor overuse detection using statistical analysis
- Risk scoring system for various user behaviors
- Graduated response system (info/warning/critical)
- Personalized safety recommendations based on user profile

### Multi-Level Caching

CacheManager implements a sophisticated caching system:
- Two-tier caching architecture (memory and persistent)
- Uses a scoring algorithm for cache eviction based on:
  - Recency of access (timestamp)
  - Frequency of access (hit count)
  - Cache entry size
- Implements automatic pruning and cleanup
- User-specific cache invalidation

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode for simulators


## Usage

### Strain Recommendations

1. Navigate to the Recommendations screen
2. Select your purpose (Recreational or Medical)
3. Add desired effects (e.g., "relaxed", "creative", "pain relief")
4. Press "Get Recommendations"
5. View personalized strain suggestions with match scores and reasoning
6. Provide feedback on recommendations to improve future suggestions

### Chat Interface

1. Navigate to the Chat screen
2. Ask questions about cannabis strains, effects, dosing, or safety
3. Receive educational information and guidance
4. Conversation history is maintained for context

### Journal Analysis

1. Record your cannabis experiences in the Journal
2. Include strain, dosage, effects, and effectiveness
3. After collecting enough entries, navigate to the Insights screen
4. View patterns, insights, and personalized recommendations based on your experiences

### Safety Features

- The system automatically checks for medication interactions through SafetyService
- Monitors usage patterns for signs of overuse
- Provides educational content on responsible use
- Implements cooling-off periods if concerning patterns are detected

## Future Improvements

### Enhanced AI Integration

- Expand AI capabilities with fine-tuned models specific to cannabis
- Implement more sophisticated natural language understanding in AnthropicAPI integration
- Add multi-modal capabilities for image recognition of strains

### Advanced Analytics

- Enhance journal analysis algorithms with more sophisticated pattern recognition
- Implement machine learning models for personalized effectiveness prediction
- Add comparative analytics between user populations

### Architecture Optimization

- Move to a distributed cache system for better scaling
- Implement a more robust event-driven architecture for component communication
- Add more comprehensive error handling and recovery mechanisms

### Technical Improvements

- Migrate to a more robust remote database solution
- Implement end-to-end encryption for sensitive user data
- Add real-time synchronization across devices
- Optimize performance for older devices and slower connections

### Expanded Safety Features

- Integration with medication databases for more comprehensive interaction checking
- More sophisticated overuse detection algorithms in SafetyService
- Personalized responsible use education
