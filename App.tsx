
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import type { Conversation, Message, User } from './types';
import { conversations as mockConversations, currentUser, AGI_SYSTEM_INSTRUCTION } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(conversations[0]?.id);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(AGI_SYSTEM_INSTRUCTION);

  const aiRef = useRef<GoogleGenAI | null>(null);
  const aiResponseTimer = useRef<NodeJS.Timeout | null>(null);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    async function initializeAi() {
      try {
        if (!aiRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            aiRef.current = ai;
        }
      } catch (error) {
        console.error("Failed to initialize AI:", error);
      }
    }
    initializeAi();
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSetReplyTo = (message: Message | null) => {
    setReplyingTo(message);
  };
  
  const handleUserTyping = (typing: boolean) => {
    // This is now handled by the response timer logic, but we keep the prop for potential future use.
  }

  const handleSaveSystemInstruction = (newInstruction: string) => {
    setSystemInstruction(newInstruction);
  };

  const updateMessageStatus = (messageId: string, status: 'delivered' | 'read') => {
    if (!selectedConversationId) return;
    setConversations(prev => prev.map(convo => {
      if (convo.id === selectedConversationId) {
        return {
          ...convo,
          messages: convo.messages.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
          )
        };
      }
      return convo;
    }));
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!selectedConversationId) return;

    setConversations(prev => prev.map(convo => {
        if (convo.id === selectedConversationId) {
            return {
                ...convo,
                messages: convo.messages.map(msg => {
                    if (msg.id === messageId) {
                        const currentReaction = msg.reactions?.[currentUser.id];
                        const newReactions = { ...(msg.reactions || {}) };

                        if (currentReaction === emoji) {
                            delete newReactions[currentUser.id];
                        } else {
                            newReactions[currentUser.id] = emoji;
                        }
                        
                        const reactionsOrUndefined = Object.keys(newReactions).length > 0 ? newReactions : undefined;

                        return { ...msg, reactions: reactionsOrUndefined };
                    }
                    return msg;
                })
            };
        }
        return convo;
    }));
};

  const triggerAIResponse = async () => {
    if (!selectedConversationId) return;

    const currentConversations = conversationsRef.current;
    const selectedConversation = currentConversations.find(c => c.id === selectedConversationId);
    
    if (!selectedConversation || !aiRef.current) return;

    const aiParticipant = selectedConversation.participants.find(p => p.id.startsWith('ai-'));
    if (!aiParticipant) return;

    const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1];
    if (lastMessage && lastMessage.senderId === aiParticipant.id) {
        return; // AI sent the last message, don't get into a loop
    }
    
    // AI starts "thinking"
    const startThinkingDelay = 1000 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, startThinkingDelay));
    
    setIsTyping(true);
    
    // Add a small "thinking" pause while typing indicator is visible
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 1800));
    
    // --- AI response generation ---
    let aiMessages: Message[] = [];
    try {
      const history = selectedConversation.messages.map(msg => {
        let contextualText = msg.text;
        // Add reply context directly into the message text for the AI to understand
        if (msg.replyTo) {
            const participantName = msg.replyTo.senderName === currentUser.name ? "your" : "my";
            contextualText = `[In reply to ${participantName} message: "${msg.replyTo.text}"] ${msg.text}`;
        }
        return {
            role: msg.senderId.startsWith('ai-') ? 'model' : 'user',
            parts: [{ text: contextualText }],
        };
      });

      const response = await aiRef.current!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reaction: {
                type: Type.STRING,
                description: "An optional single emoji to react to the user's last message with. Choose from: ❤️, 👍, 😂, 😮, 😢, 🙏. Only use if it feels very natural."
              },
              responses: {
                type: Type.ARRAY,
                description: "An array of message objects for your response. Most of the time, you should send multiple short messages in quick succession (between 2 and 7) to create a real-time conversational flow. Only send a single message if the response is very short and simple (like 'ok' or 'lol'). You can also reply to a specific previous message.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description: "The text content of this part of your reply."
                    },
                    replyToIndex: {
                      type: Type.INTEGER,
                      description: "Optional. The index of the message in the chat history you are directly replying to. The history is 0-indexed. Only reply to messages sent by the user."
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      const responseJson = JSON.parse(response.text);
      const responses: { text: string, replyToIndex?: number }[] = responseJson.responses || [];
      const reaction: string | undefined = responseJson.reaction;

      // Handle AI reaction
      const lastUserMessage = [...selectedConversation.messages].reverse().find(m => m.senderId === currentUser.id);
      if (reaction && lastUserMessage && ['❤️', '👍', '😂', '😮', '😢', '🙏'].includes(reaction)) {
         setTimeout(() => {
             setConversations(prev => prev.map(convo => {
                if (convo.id === selectedConversationId) {
                    return {
                        ...convo,
                        messages: convo.messages.map(msg => {
                            if (msg.id === lastUserMessage.id) {
                                return { ...msg, reactions: { ...msg.reactions, [aiParticipant.id]: reaction } };
                            }
                            return msg;
                        })
                    };
                }
                return convo;
            }));
         }, Math.random() * 1500 + 500); // React after a short, variable delay
      }

      if (responses.length > 0) {
        aiMessages = responses.map((responsePart, index) => {
            let replyToData;
            const { text, replyToIndex } = responsePart;
    
            if (replyToIndex !== undefined && replyToIndex >= 0 && replyToIndex < selectedConversation.messages.length) {
                const messageToReplyTo = selectedConversation.messages[replyToIndex];
                // Ensure the AI only replies to the user's messages
                if (messageToReplyTo.senderId === currentUser.id) {
                    replyToData = {
                        messageId: messageToReplyTo.id,
                        text: messageToReplyTo.text || 'Image',
                        senderName: currentUser.name
                    };
                }
            }
            
            return {
                id: `msg-${Date.now() + 1 + index}`,
                senderId: aiParticipant.id,
                text: text,
                timestamp: new Date().toISOString(),
                status: 'delivered',
                replyTo: replyToData,
            };
        });
      } else {
        // Don't throw an error, just means the AI chose not to respond textually (e.g., only reacted)
      }

    } catch (error) {
      console.error("Error with AI response:", error);
      aiMessages = [{
        id: `msg-${Date.now() + 1}`,
        senderId: aiParticipant.id,
        text: "Oops, I'm having a little trouble thinking right now. Could you try that again?",
        timestamp: new Date().toISOString(),
        status: 'delivered',
      }];
    }
    
    setIsTyping(false);
    
    // Send AI messages with delays based on message length
    for (let i = 0; i < aiMessages.length; i++) {
      const msg = aiMessages[i];
      if (i > 0) {
        setIsTyping(true);
        const typingDelay = 500 + (msg.text.length * (Math.random() * 20 + 30));
        await new Promise(resolve => setTimeout(resolve, Math.min(typingDelay, 3500)));
        setIsTyping(false);
      }
      setConversations(prev => prev.map(convo =>
        convo.id === selectedConversationId
          ? { ...convo, messages: [...convo.messages, msg] }
          : convo
      ));
    }
  };


  const handleSendMessage = async (text: string, imageBase64: string | null) => {
    if (!selectedConversationId || !selectedConversation) return;

    const aiParticipant = selectedConversation.participants.find(p => p.id.startsWith('ai-'));
    if (!aiParticipant) return;

    const replyToData = replyingTo ? {
        messageId: replyingTo.id,
        text: replyingTo.text || 'Image',
        senderName: replyingTo.senderId === currentUser.id ? currentUser.name : aiParticipant.name
    } : undefined;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
      imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      replyTo: replyToData
    };
    
    setReplyingTo(null);

    setConversations(prev => prev.map(convo => 
      convo.id === selectedConversationId 
        ? { ...convo, messages: [...convo.messages, userMessage] }
        : convo
    ));
    
    const deliveryDelay = Math.random() * 500 + 200;
    setTimeout(() => updateMessageStatus(userMessage.id, 'delivered'), deliveryDelay);
    
    const readDelay = deliveryDelay + 1200 + Math.random() * 2500;
    setTimeout(() => updateMessageStatus(userMessage.id, 'read'), readDelay);

    // Reset and set the AI response timer
    if (aiResponseTimer.current) {
        clearTimeout(aiResponseTimer.current);
    }

    aiResponseTimer.current = setTimeout(() => {
        triggerAIResponse();
    }, 3500); // Wait for a 3.5-second pause from the user before responding
  };

  return (
    <>
      <div className="bg-gray-900 text-white h-screen w-screen flex antialiased overflow-hidden">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
        />
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation.id}
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            isTyping={isTyping && selectedConversationId === selectedConversation.id}
            replyingTo={replyingTo}
            onSetReplyTo={handleSetReplyTo}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onUserTyping={handleUserTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-300">Loading Chat...</h2>
            </div>
          </div>
        )}
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveSystemInstruction}
        currentInstruction={systemInstruction}
      />
    </>
  );
};

export default App;
