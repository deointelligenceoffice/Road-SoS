import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    setMessages((current) => [...current, { id: `${Date.now()}`, text, isUser: true }]);
    setInput('');

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-ai`,
          text: 'Typing...',
          isUser: false,
        },
      ]);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.chatContent, messages.length === 0 && styles.emptyContent]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>AI</Text>
            <Text style={styles.placeholderTitle}>Start a conversation</Text>
            <Text style={styles.placeholderSub}>Ask me anything about road safety</Text>
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.sender, message.isUser ? styles.userSender : styles.aiSender]}>
                {message.isUser ? 'You' : 'RoadSOS AI'}
              </Text>
              <Text style={message.isUser ? styles.userText : styles.aiText}>{message.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
          placeholderTextColor="#999999"
          style={styles.input}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContent: {
    flexGrow: 1,
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    color: '#7e57c2',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  placeholderTitle: {
    color: '#999999',
    fontSize: 12,
    fontWeight: '800',
  },
  placeholderSub: {
    color: '#bbbbbb',
    fontSize: 10,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 8,
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#C0392B',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderLeftColor: '#7e57c2',
    borderLeftWidth: 3,
  },
  sender: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  userSender: {
    color: 'rgba(255,255,255,0.9)',
  },
  aiSender: {
    color: '#7e57c2',
  },
  userText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 16,
  },
  aiText: {
    color: '#999999',
    fontSize: 11,
    lineHeight: 16,
  },
  inputBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    color: '#333333',
    flex: 1,
    fontSize: 12,
    height: 40,
    paddingHorizontal: 12,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#7e57c2',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 48,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default AIChatScreen;
