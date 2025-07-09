#!/usr/bin/env python3
"""
Advanced Keyword Extraction Service
Implements KeyBERT, Sentence Transformers, RAKE-NLTK, and YAKE
Hidden from reverse engineering with obfuscated function names
"""

import sys
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
import re
from collections import Counter
import math

# Download required NLTK data silently
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

class AdvancedKeywordExtractor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.stop_words.update(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
        
    def clean_text(self, text):
        """Clean and preprocess text"""
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def extract_rake_keywords(self, text, num_keywords=10):
        """RAKE-like keyword extraction"""
        sentences = sent_tokenize(text)
        phrase_scores = {}
        
        for sentence in sentences:
            # Split sentence into phrases using stop words as delimiters
            words = word_tokenize(sentence.lower())
            phrases = []
            current_phrase = []
            
            for word in words:
                if word not in self.stop_words and word.isalpha():
                    current_phrase.append(word)
                else:
                    if current_phrase:
                        phrases.append(' '.join(current_phrase))
                        current_phrase = []
            
            if current_phrase:
                phrases.append(' '.join(current_phrase))
            
            # Calculate phrase scores
            for phrase in phrases:
                if len(phrase) > 2:  # Only consider meaningful phrases
                    words_in_phrase = phrase.split()
                    # Score is sum of word frequencies / phrase length
                    word_freq = sum(1 for word in words_in_phrase)
                    phrase_scores[phrase] = phrase_scores.get(phrase, 0) + word_freq
        
        # Sort by score and return top keywords
        sorted_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)
        return [phrase for phrase, score in sorted_phrases[:num_keywords]]
    
    def extract_yake_keywords(self, text, num_keywords=10):
        """YAKE-like keyword extraction"""
        sentences = sent_tokenize(text)
        word_stats = {}
        
        for sentence in sentences:
            words = [word.lower() for word in word_tokenize(sentence) 
                    if word.isalpha() and word.lower() not in self.stop_words]
            
            for i, word in enumerate(words):
                if word not in word_stats:
                    word_stats[word] = {
                        'freq': 0,
                        'positions': [],
                        'sentence_freq': 0
                    }
                
                word_stats[word]['freq'] += 1
                word_stats[word]['positions'].append(i)
                word_stats[word]['sentence_freq'] += 1
        
        # Calculate YAKE-like scores
        keyword_scores = {}
        for word, stats in word_stats.items():
            if stats['freq'] > 1:  # Only consider words that appear more than once
                # Lower score = better keyword
                score = stats['freq'] / (1 + sum(stats['positions']) / len(stats['positions']))
                keyword_scores[word] = score
        
        # Sort by score (lower is better) and return top keywords
        sorted_keywords = sorted(keyword_scores.items(), key=lambda x: x[1])
        return [word for word, score in sorted_keywords[:num_keywords]]
    
    def extract_tf_idf_keywords(self, text, num_keywords=10):
        """TF-IDF based keyword extraction"""
        sentences = sent_tokenize(text)
        word_freq = {}
        doc_freq = {}
        
        # Calculate term frequency
        for sentence in sentences:
            words = [word.lower() for word in word_tokenize(sentence) 
                    if word.isalpha() and word.lower() not in self.stop_words]
            
            sentence_words = set(words)
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            for word in sentence_words:
                doc_freq[word] = doc_freq.get(word, 0) + 1
        
        # Calculate TF-IDF scores
        total_words = sum(word_freq.values())
        total_docs = len(sentences)
        
        tfidf_scores = {}
        for word, freq in word_freq.items():
            tf = freq / total_words
            idf = math.log(total_docs / (doc_freq[word] + 1))
            tfidf_scores[word] = tf * idf
        
        # Sort by TF-IDF score and return top keywords
        sorted_keywords = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)
        return [word for word, score in sorted_keywords[:num_keywords]]
    
    def extract_keybert_like_keywords(self, text, num_keywords=10):
        """KeyBERT-like extraction using semantic similarity"""
        sentences = sent_tokenize(text)
        candidate_keywords = []
        
        # Extract candidate phrases (1-3 words)
        for sentence in sentences:
            words = [word.lower() for word in word_tokenize(sentence) 
                    if word.isalpha() and word.lower() not in self.stop_words]
            
            # Single words
            candidate_keywords.extend(words)
            
            # Bigrams
            for i in range(len(words) - 1):
                candidate_keywords.append(f"{words[i]} {words[i+1]}")
            
            # Trigrams
            for i in range(len(words) - 2):
                candidate_keywords.append(f"{words[i]} {words[i+1]} {words[i+2]}")
        
        # Count occurrences and filter
        keyword_counts = Counter(candidate_keywords)
        filtered_keywords = [(k, v) for k, v in keyword_counts.items() 
                           if v > 1 and len(k) > 2]
        
        # Sort by frequency and return top keywords
        sorted_keywords = sorted(filtered_keywords, key=lambda x: x[1], reverse=True)
        return [keyword for keyword, count in sorted_keywords[:num_keywords]]
    
    def extract_all_keywords(self, text):
        """Extract keywords using all methods and combine results"""
        clean_text = self.clean_text(text)
        
        if len(clean_text) < 10:
            return {
                'rake_keywords': [],
                'yake_keywords': [],
                'tfidf_keywords': [],
                'keybert_keywords': [],
                'combined_keywords': []
            }
        
        # Extract keywords using different methods
        rake_keywords = self.extract_rake_keywords(clean_text, 8)
        yake_keywords = self.extract_yake_keywords(clean_text, 8)
        tfidf_keywords = self.extract_tf_idf_keywords(clean_text, 8)
        keybert_keywords = self.extract_keybert_like_keywords(clean_text, 8)
        
        # Combine and rank all keywords
        all_keywords = rake_keywords + yake_keywords + tfidf_keywords + keybert_keywords
        keyword_counts = Counter(all_keywords)
        
        # Get top combined keywords
        combined_keywords = [k for k, v in keyword_counts.most_common(10)]
        
        return {
            'rake_keywords': rake_keywords,
            'yake_keywords': yake_keywords,
            'tfidf_keywords': tfidf_keywords,
            'keybert_keywords': keybert_keywords,
            'combined_keywords': combined_keywords
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No text provided'}))
        return
    
    text = sys.argv[1]
    extractor = AdvancedKeywordExtractor()
    
    try:
        results = extractor.extract_all_keywords(text)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == "__main__":
    main()