import { useState, useEffect, useCallback, useRef } from 'react';
import { AIService } from '../services/ai';
import SafetyService from '../services/SafetyService';
import { 
  RecommendationRequest, 
  RecommendationResponse, 
  ChatMessage, 
  UserProfile,
  JournalEntry,
  SafetyValidationResult
} from '../types/ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface for useAIRecommendations hook return value
export interface UseAIRecommendationsReturn {
  loading: boolean;
  error: string | null;
  recommendations: RecommendationResponse | null;
  safetyValidation: SafetyValidationResult | null;
  chatHistory: ChatMessage[];
  getRecommendations: (request: RecommendationRequest, recentEntries?: JournalEntry[]) => Promise<RecommendationResponse | null>;
  getChatResponse: (message: string, userProfile: UserProfile) => Promise<ChatMessage | null>;
  analyzeJournalPatterns: (entries: JournalEntry[], userProfile: UserProfile) => Promise<any>;
  clearChatHistory: () => void;
  getSafetyHistory: (userId: string) => Promise<any[]>;
}

/**
 * Hook for accessing AI recommendation features
 * Provides a clean interface to AIService and SafetyService
 */
export const useAIRecommendations = (): UseAIRecommendationsReturn => {
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [safetyValidation, setSafetyValidation] = useState<SafetyValidationResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Refs
  const isInitialized = useRef<boolean>(false);
  const cleanupCalled = useRef<boolean>(false);
  
  // Get service instances
  const aiService = AIService.getInstance();
  
  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      if (isInitialized.current) return;
      
      try {
        // Initialize AI and Safety services
        await aiService.initialize();
        await SafetyService.initialize();
        isInitialized.current = true;
      } catch (err) {
        console.error('Error initializing AI or Safety services:', err);
        setError('Failed to initialize recommendation services');
      }
    };
    
    initServices();
    
    // Load cached recommendations if available
    loadCachedRecommendations();
    
    // Cleanup function
    return () => {
      if (!cleanupCalled.current) {
        cleanupCalled.current = true;
        SafetyService.cleanup().catch(err => {
          console.error('Error during SafetyService cleanup:', err);
        });
      }
    };
  }, []);
  
  // Load cached recommendations
  const loadCachedRecommendations = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('ai_recommendations_cache');
      
      if (cachedData) {
        const { recommendations: cachedRecommendations, timestamp } = JSON.parse(cachedData);
        
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setRecommendations(cachedRecommendations);
        }
      }
    } catch (err) {
      console.warn('Error loading cached recommendations:', err);
    }
  };
  
  // Cache recommendations
  const cacheRecommendations = async (recommendations: RecommendationResponse) => {
    try {
      await AsyncStorage.setItem(
        'ai_recommendations_cache',
        JSON.stringify({
          recommendations,
          timestamp: Date.now()
        })
      );
    } catch (err) {
      console.warn('Error caching recommendations:', err);
    }
  };
  
  // Get strain recommendations with safety checks
  const getRecommendations = useCallback(async (
    request: RecommendationRequest,
    recentEntries: JournalEntry[] = []
  ): Promise<RecommendationResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate request for safety concerns
      const validationResult = await SafetyService.validateRecommendationRequest(request);
      setSafetyValidation(validationResult);
      
      // If request is invalid due to safety concerns, return early
      if (!validationResult.valid) {
        setError(validationResult.reason || 'Request failed safety validation');
        setLoading(false);
        return null;
      }
      
      // Apply any safety modifications to the request
      const safeRequest = validationResult.modifications 
        ? { ...request, ...validationResult.modifications }
        : request;
      
      // Get recommendations from AI service
      const rawRecommendations = await aiService.getRecommendations(safeRequest);
      
      // Process recommendations through safety service
      const safeRecommendations = await SafetyService.processRecommendationResponse(
        rawRecommendations,
        request.userProfile,
        recentEntries
      );
      
      // Update state and cache
      setRecommendations(safeRecommendations);
      cacheRecommendations(safeRecommendations);
      
      setLoading(false);
      return safeRecommendations;
      
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again later.');
      setLoading(false);
      return null;
    }
  }, [aiService]);
  
  // Get chat response
  const getChatResponse = useCallback(async (
    message: string,
    userProfile: UserProfile
  ): Promise<ChatMessage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      
      // Create chat request
      const chatRequest = {
        message,
        userProfile,
        previousMessages: chatHistory.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }))
      };
      
      // Get AI response
      const aiResponseData = await aiService.getChatResponse(chatRequest);
      
      // Create chat message from response
      const aiResponseMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        content: aiResponseData.response,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      // Add AI response to history
      setChatHistory(prev => [...prev, aiResponseMessage]);
      
      setLoading(false);
      return aiResponseMessage;
      
    } catch (err) {
      console.error('Error getting chat response:', err);
      setError('Failed to get response. Please try again later.');
      setLoading(false);
      return null;
    }
  }, [chatHistory, aiService]);
  
  // Analyze journal patterns
  const analyzeJournalPatterns = useCallback(async (
    entries: JournalEntry[],
    userProfile: UserProfile
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await aiService.analyzeJournalEntries(userProfile.id, entries);
      setLoading(false);
      return analysis;
      
    } catch (err) {
      console.error('Error analyzing journal patterns:', err);
      setError('Failed to analyze journal entries. Please try again later.');
      setLoading(false);
      return null;
    }
  }, [aiService]);
  
  // Clear chat history
  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);
  
  // Get safety history
  const getSafetyHistory = useCallback(async (userId: string) => {
    try {
      return await SafetyService.getSafetyHistory(userId);
    } catch (err) {
      console.error('Error getting safety history:', err);
      return [];
    }
  }, []);
  
  return {
    loading,
    error,
    recommendations,
    safetyValidation,
    chatHistory,
    getRecommendations,
    getChatResponse,
    analyzeJournalPatterns,
    clearChatHistory,
    getSafetyHistory
  };
};

export default useAIRecommendations;
