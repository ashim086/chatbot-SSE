'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { streamChat } from '@/api/chat';
import type { ChatMessage, ChatState } from '@/types/chat';

export function useStreamingChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
  });

  // AbortController to cancel in-flight streams
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    // Cancel previous stream if any
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    // Create message IDs
    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();

    // Capture conversationId before state update
    let currentConversationId: string | null = null;

    // Add user + empty assistant messages to state (UI shows instantly)
    setState((prev) => {
      currentConversationId = prev.conversationId;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: userMessageId,
            role: 'user' as const,
            content: message,
            timestamp: new Date(),
          },
          {
            id: assistantMessageId,
            role: 'assistant' as const,
            content: '',
            timestamp: new Date(),
            isStreaming: true,
          },
        ],
        isLoading: true,
        error: null,
      };
    });

    let accumulatedContent = '';

    try {
      // Stream the response - onToken fires for each word
      await streamChat(
        {
          message,
          conversationId: currentConversationId ?? undefined,
        },
        {
          onToken: (token: string) => {
            accumulatedContent += token;
            // Update assistant content - triggers React re-render
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              ),
            }));
          },
          onDone: () => {
            // Mark assistant as done streaming
            setState((prev) => ({
              ...prev,
              isLoading: false,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent, isStreaming: false }
                  : msg
              ),
            }));
          },
          onError: (data) => {
            const errMsg = data.message ?? 'Stream error';
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: errMsg,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      isStreaming: false,
                      error: errMsg,
                      content: msg.content || `[WARNING] ${errMsg}`,
                    }
                  : msg
              ),
            }));
          },
        },
        abortController.signal
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent, isStreaming: false }
              : msg
          ),
        }));
        return;
      }

      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errMsg,
      }));
    }

    // Safety net: ensure assistant is marked as done even if onDone didn't fire
    setState((prev) => ({
      ...prev,
      isLoading: false,
      messages: prev.messages.map((msg) =>
        msg.id === assistantMessageId
          ? { ...msg, content: accumulatedContent, isStreaming: false }
          : msg
      ),
    }));
  }, []);

  const cancelStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const clearChat = useCallback(() => {
    cancelStreaming();
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
    });
  }, [cancelStreaming]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isStreaming: state.isLoading,
    sendMessage,
    cancelStreaming,
    clearChat,
  };
}
