# Firestore Schema

## `users/{userId}`

```json
{
  "email": "learner@example.com",
  "displayName": "Asha Learner",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

Purpose: Stores normalized user profile metadata synced from Firebase Auth.

## `progress/{userId}`

```json
{
  "userId": "firebase-auth-uid",
  "completedTopics": ["Neural Networks", "Backpropagation"],
  "currentTopic": "Gradient Descent",
  "quizScores": {
    "quizDocumentId": 86
  },
  "topicPerformance": {
    "Neural Networks": {
      "attempts": 8,
      "correct": 6,
      "totalSpeedSeconds": 94,
      "lastAccuracy": 75,
      "accuracyTrend": [50, 67, 75],
      "currentDifficulty": "medium",
      "weakCount": 1,
      "updatedAt": "2026-04-25T10:00:00.000Z"
    }
  },
  "dailyActivity": {
    "2026-04-25": {
      "answers": 5,
      "correct": 4,
      "xp": 45,
      "timeSpentSeconds": 70
    }
  },
  "xp": 145,
  "level": "Beginner",
  "lastActiveDate": "2026-04-25",
  "streakDays": 3,
  "updatedAt": "serverTimestamp"
}
```

Purpose: Stores topic progress, adaptive performance metrics, XP, streak state, and level state.

## `quizzes/{quizId}`

```json
{
  "id": "quizDocumentId",
  "userId": "firebase-auth-uid",
  "topic": "Neural Networks",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q-1",
      "question": "What is the role of an activation function?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 1,
      "correctAnswer": "Option B",
      "explanation": "Activation functions introduce non-linearity..."
    }
  ],
  "createdAt": "serverTimestamp"
}
```

Purpose: Persists generated quizzes for review history, scoring analysis, and future adaptive recommendations.
