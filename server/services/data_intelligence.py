#!/usr/bin/env python3
"""
Advanced Data Intelligence System
Implements auto-cleanup, pattern learning, labeling, deduplication, categorization, and anomaly detection
All features are free and open-source without external APIs
"""

import sys
import json
import nltk
from collections import defaultdict, Counter
import re
from datetime import datetime, timedelta
import hashlib
import math

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        nltk.download('stopwords', quiet=True)
    except:
        pass

class DataIntelligenceSystem:
    def __init__(self):
        try:
            self.stop_words = set(nltk.corpus.stopwords.words('english'))
        except:
            # Fallback stop words if NLTK data is not available
            self.stop_words = set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'is', 'am'])
        self.stop_words.update(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
        
    def clean_old_data(self, data_entries, days_threshold=30):
        """🧹 Auto-cleanup of unused/old data"""
        current_time = datetime.now()
        threshold_date = current_time - timedelta(days=days_threshold)
        
        active_entries = []
        flagged_entries = []
        
        for entry in data_entries:
            try:
                entry_date = datetime.fromisoformat(entry.get('createdAt', current_time.isoformat()).replace('Z', '+00:00'))
            except:
                entry_date = current_time
            
            try:
                last_accessed = datetime.fromisoformat(entry.get('lastAccessed', entry_date.isoformat()).replace('Z', '+00:00'))
            except:
                last_accessed = entry_date
            
            # Convert to naive datetime for comparison
            entry_date = entry_date.replace(tzinfo=None)
            last_accessed = last_accessed.replace(tzinfo=None)
            
            # Flag entries that are old and haven't been accessed recently
            if entry_date < threshold_date and last_accessed < threshold_date:
                flagged_entries.append({
                    'id': entry.get('id'),
                    'reason': 'old_unused',
                    'age_days': (current_time - entry_date).days,
                    'last_access_days': (current_time - last_accessed).days
                })
            else:
                active_entries.append(entry)
        
        return {
            'active_entries': active_entries,
            'flagged_for_cleanup': flagged_entries,
            'cleanup_stats': {
                'total_entries': len(data_entries),
                'active_entries': len(active_entries),
                'flagged_entries': len(flagged_entries)
            }
        }
    
    def analyze_usage_patterns(self, access_logs):
        """📊 Usage pattern learning"""
        patterns = {
            'frequently_accessed': [],
            'rarely_accessed': [],
            'peak_hours': [],
            'usage_trends': {}
        }
        
        if not access_logs:
            return patterns
        
        # Analyze access frequency
        access_counts = Counter(log.get('resource_id') for log in access_logs)
        total_accesses = sum(access_counts.values())
        
        for resource_id, count in access_counts.items():
            frequency = count / total_accesses
            if frequency > 0.1:  # Accessed more than 10% of the time
                patterns['frequently_accessed'].append({
                    'resource_id': resource_id,
                    'access_count': count,
                    'frequency': frequency
                })
            elif frequency < 0.01:  # Accessed less than 1% of the time
                patterns['rarely_accessed'].append({
                    'resource_id': resource_id,
                    'access_count': count,
                    'frequency': frequency
                })
        
        # Analyze peak usage hours
        hour_counts = Counter()
        for log in access_logs:
            try:
                timestamp = datetime.fromisoformat(log.get('timestamp', '').replace('Z', '+00:00'))
                hour_counts[timestamp.hour] += 1
            except:
                continue
        
        if hour_counts:
            peak_hour = hour_counts.most_common(1)[0][0]
            patterns['peak_hours'] = [{'hour': peak_hour, 'count': hour_counts[peak_hour]}]
        
        return patterns
    
    def enrich_data_with_labels(self, content, file_type=None):
        """🧠 Data labeling / enrichment"""
        labels = {
            'sentiment': self.analyze_sentiment(content),
            'type': self.classify_content_type(content),
            'intent': self.detect_intent(content),
            'urgency': self.detect_urgency(content),
            'entities': self.extract_entities(content),
            'file_category': self.categorize_file(file_type) if file_type else None
        }
        
        return labels
    
    def analyze_sentiment(self, text):
        """Analyze sentiment using lexicon-based approach"""
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding', 'professional']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'unprofessional', 'spam']
        
        words = text.lower().split()
        pos_score = sum(1 for word in words if word in positive_words)
        neg_score = sum(1 for word in words if word in negative_words)
        
        if pos_score > neg_score:
            return {'label': 'positive', 'confidence': min(0.9, pos_score / len(words) * 10)}
        elif neg_score > pos_score:
            return {'label': 'negative', 'confidence': min(0.9, neg_score / len(words) * 10)}
        else:
            return {'label': 'neutral', 'confidence': 0.5}
    
    def classify_content_type(self, text):
        """Classify content type based on keywords"""
        service_keywords = {
            'roofing': ['roof', 'shingle', 'gutter', 'leak', 'repair roof'],
            'landscaping': ['lawn', 'garden', 'tree', 'landscape', 'mowing'],
            'cleaning': ['clean', 'house cleaning', 'maid', 'sanitize', 'vacuum'],
            'pest_control': ['pest', 'bug', 'insect', 'exterminator', 'rodent'],
            'home_improvement': ['renovation', 'remodel', 'construction', 'repair', 'improvement'],
            'security': ['security', 'alarm', 'camera', 'monitoring', 'protection'],
            'solar': ['solar', 'panel', 'energy', 'renewable', 'electricity']
        }
        
        text_lower = text.lower()
        scores = {}
        
        for category, keywords in service_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[category] = score
        
        if scores:
            best_category = max(scores, key=scores.get)
            confidence = scores[best_category] / len(text.split()) * 10
            return {'category': best_category, 'confidence': min(0.9, confidence)}
        
        return {'category': 'general', 'confidence': 0.3}
    
    def detect_intent(self, text):
        """Detect user intent"""
        intent_patterns = {
            'quote_request': ['quote', 'estimate', 'price', 'cost', 'how much'],
            'scheduling': ['schedule', 'appointment', 'when', 'available', 'time'],
            'information': ['tell me', 'information', 'details', 'learn more'],
            'complaint': ['problem', 'issue', 'complaint', 'dissatisfied', 'wrong'],
            'sales_pitch': ['offer', 'service', 'company', 'business', 'professional']
        }
        
        text_lower = text.lower()
        for intent, keywords in intent_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                return {'intent': intent, 'confidence': 0.7}
        
        return {'intent': 'general', 'confidence': 0.3}
    
    def detect_urgency(self, text):
        """Detect urgency level"""
        urgent_keywords = ['urgent', 'emergency', 'immediate', 'asap', 'now', 'today', 'critical']
        medium_keywords = ['soon', 'this week', 'limited time', 'expires']
        
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in urgent_keywords):
            return {'level': 'high', 'confidence': 0.8}
        elif any(keyword in text_lower for keyword in medium_keywords):
            return {'level': 'medium', 'confidence': 0.6}
        else:
            return {'level': 'low', 'confidence': 0.4}
    
    def extract_entities(self, text):
        """Extract named entities"""
        # Simple entity extraction using regex patterns
        entities = {
            'phone_numbers': re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text),
            'emails': re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text),
            'urls': re.findall(r'https?://[^\s]+', text),
            'money': re.findall(r'\$\d+(?:,\d{3})*(?:\.\d{2})?', text),
            'dates': re.findall(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text)
        }
        
        return {k: v for k, v in entities.items() if v}
    
    def categorize_file(self, file_type):
        """🧾 Auto-categorization of files"""
        categories = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
            'document': ['pdf', 'doc', 'docx', 'txt'],
            'spreadsheet': ['xls', 'xlsx', 'csv'],
            'presentation': ['ppt', 'pptx'],
            'video': ['mp4', 'avi', 'mov', 'wmv'],
            'archive': ['zip', 'rar', '7z', 'tar']
        }
        
        if not file_type:
            return {'category': 'unknown', 'confidence': 0}
        
        ext = file_type.lower().split('.')[-1]
        
        for category, extensions in categories.items():
            if ext in extensions:
                return {'category': category, 'confidence': 0.9}
        
        return {'category': 'other', 'confidence': 0.3}
    
    def detect_duplicates(self, entries):
        """🔁 Smart deduplication using simple text similarity"""
        if len(entries) < 2:
            return {'duplicates': [], 'unique_entries': entries}
        
        try:
            duplicates = []
            processed = set()
            
            for i in range(len(entries)):
                if i in processed:
                    continue
                
                entry_i = entries[i]
                content_i = (entry_i.get('content', '') + ' ' + entry_i.get('offer', '') + ' ' + entry_i.get('reason', '')).lower()
                words_i = set(content_i.split())
                
                similar_indices = []
                for j in range(i + 1, len(entries)):
                    if j in processed:
                        continue
                    
                    entry_j = entries[j]
                    content_j = (entry_j.get('content', '') + ' ' + entry_j.get('offer', '') + ' ' + entry_j.get('reason', '')).lower()
                    words_j = set(content_j.split())
                    
                    # Calculate simple Jaccard similarity
                    intersection = len(words_i.intersection(words_j))
                    union = len(words_i.union(words_j))
                    similarity = intersection / union if union > 0 else 0
                    
                    if similarity > 0.6:  # 60% similarity threshold
                        similar_indices.append(j)
                
                if similar_indices:
                    duplicate_group = {
                        'primary': entries[i],
                        'duplicates': [entries[j] for j in similar_indices],
                        'similarity_scores': [0.7] * len(similar_indices)  # Approximate similarity
                    }
                    duplicates.append(duplicate_group)
                    processed.add(i)
                    processed.update(similar_indices)
            
            unique_entries = [entry for i, entry in enumerate(entries) if i not in processed]
            
            return {
                'duplicates': duplicates,
                'unique_entries': unique_entries,
                'deduplication_stats': {
                    'total_entries': len(entries),
                    'duplicate_groups': len(duplicates),
                    'unique_entries': len(unique_entries)
                }
            }
        except Exception as e:
            return {'duplicates': [], 'unique_entries': entries, 'error': str(e)}
    
    def detect_anomalies(self, entries, usage_logs):
        """🚨 Anomaly Detection"""
        anomalies = []
        
        # Detect unusual submission patterns
        if len(entries) > 0:
            # Check for spam-like patterns
            content_hashes = {}
            for entry in entries:
                content = entry.get('content', '') + entry.get('offer', '')
                content_hash = hashlib.md5(content.encode()).hexdigest()
                
                if content_hash in content_hashes:
                    anomalies.append({
                        'type': 'duplicate_content',
                        'severity': 'high',
                        'description': 'Identical content submitted multiple times',
                        'entries': [content_hashes[content_hash], entry.get('id')]
                    })
                else:
                    content_hashes[content_hash] = entry.get('id')
            
            # Check for unusual submission frequency
            submission_times = []
            for entry in entries:
                try:
                    timestamp = datetime.fromisoformat(entry.get('createdAt', '').replace('Z', '+00:00'))
                    submission_times.append(timestamp)
                except:
                    continue
            
            if len(submission_times) > 5:  # Only check if we have enough data
                # Check for rapid submissions (potential bot activity)
                submission_times.sort()
                rapid_submissions = 0
                for i in range(1, len(submission_times)):
                    time_diff = (submission_times[i] - submission_times[i-1]).total_seconds()
                    if time_diff < 60:  # Less than 1 minute apart
                        rapid_submissions += 1
                
                if rapid_submissions > 3:
                    anomalies.append({
                        'type': 'rapid_submissions',
                        'severity': 'medium',
                        'description': f'{rapid_submissions} submissions within 1 minute of each other',
                        'count': rapid_submissions
                    })
        
        # Check usage pattern anomalies
        if usage_logs:
            # Detect unusual access patterns
            access_counts = Counter(log.get('ip_address', 'unknown') for log in usage_logs)
            for ip, count in access_counts.items():
                if count > 100:  # More than 100 accesses from single IP
                    anomalies.append({
                        'type': 'excessive_access',
                        'severity': 'high',
                        'description': f'Excessive access from IP: {ip}',
                        'count': count,
                        'ip_address': ip
                    })
        
        return {
            'anomalies': anomalies,
            'anomaly_stats': {
                'total_anomalies': len(anomalies),
                'high_severity': len([a for a in anomalies if a['severity'] == 'high']),
                'medium_severity': len([a for a in anomalies if a['severity'] == 'medium']),
                'low_severity': len([a for a in anomalies if a['severity'] == 'low'])
            }
        }
    
    def comprehensive_analysis(self, entries, usage_logs=None):
        """Perform comprehensive data intelligence analysis"""
        results = {}
        
        # Auto-cleanup analysis
        results['cleanup'] = self.clean_old_data(entries)
        
        # Usage pattern analysis
        if usage_logs:
            results['usage_patterns'] = self.analyze_usage_patterns(usage_logs)
        
        # Data enrichment
        enriched_entries = []
        for entry in entries:
            content = entry.get('content', '') + ' ' + entry.get('offer', '') + ' ' + entry.get('reason', '')
            file_type = entry.get('fileName', '').split('.')[-1] if entry.get('fileName') else None
            
            labels = self.enrich_data_with_labels(content, file_type)
            enriched_entry = {**entry, 'ai_labels': labels}
            enriched_entries.append(enriched_entry)
        
        results['enriched_entries'] = enriched_entries
        
        # Deduplication analysis
        results['deduplication'] = self.detect_duplicates(entries)
        
        # Anomaly detection
        results['anomalies'] = self.detect_anomalies(entries, usage_logs)
        
        return results

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No data provided'}))
        return
    
    try:
        data = json.loads(sys.argv[1])
        entries = data.get('entries', [])
        usage_logs = data.get('usage_logs', [])
        
        system = DataIntelligenceSystem()
        results = system.comprehensive_analysis(entries, usage_logs)
        
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

if __name__ == "__main__":
    main()