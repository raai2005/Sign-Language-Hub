// Database utilities for exam system

export interface ExamSession {
  sessionId: string;
  setId: number;
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  totalQuestions: number;
}

export interface ExamAnswer {
  sessionId: string;
  questionId: number;
  selectedAnswer: string;
  imageUrl?: string;
  timestamp: Date;
  isCorrect?: boolean;
}

export interface ExamResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
  feedback: QuestionFeedback[];
}

export interface QuestionFeedback {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  geminiAnalysis?: string;
}

// In-memory storage for demonstration
// In production, replace with actual database operations
let examSessions: Map<string, ExamSession> = new Map();
let examAnswers: Map<string, ExamAnswer[]> = new Map();
let examResults: Map<string, ExamResult> = new Map();

export class ExamDatabase {
  
  // Create a new exam session
  static createSession(setId: number, userId?: string): string {
    const sessionId = `session_${setId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: ExamSession = {
      sessionId,
      setId,
      userId,
      startedAt: new Date(),
      totalQuestions: 10
    };

    examSessions.set(sessionId, session);
    examAnswers.set(sessionId, []);
    
    return sessionId;
  }

  // Save an answer to the session
  static saveAnswer(sessionId: string, answer: Omit<ExamAnswer, 'sessionId'>): boolean {
    try {
      const answers = examAnswers.get(sessionId) || [];
      
      // Remove any existing answer for this question
      const filteredAnswers = answers.filter(a => a.questionId !== answer.questionId);
      
      // Add the new answer
      const newAnswer: ExamAnswer = {
        sessionId,
        ...answer
      };
      
      filteredAnswers.push(newAnswer);
      examAnswers.set(sessionId, filteredAnswers);
      
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }

  // Get all answers for a session
  static getAnswers(sessionId: string): ExamAnswer[] {
    return examAnswers.get(sessionId) || [];
  }

  // Complete the exam session
  static completeSession(sessionId: string, score: number): boolean {
    try {
      const session = examSessions.get(sessionId);
      if (!session) return false;

      session.completedAt = new Date();
      session.score = score;
      
      examSessions.set(sessionId, session);
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }

  // Save exam results
  static saveResult(sessionId: string, result: Omit<ExamResult, 'sessionId'>): boolean {
    try {
      const fullResult: ExamResult = {
        sessionId,
        ...result
      };
      
      examResults.set(sessionId, fullResult);
      return true;
    } catch (error) {
      console.error('Error saving result:', error);
      return false;
    }
  }

  // Get exam results
  static getResult(sessionId: string): ExamResult | null {
    return examResults.get(sessionId) || null;
  }

  // Get session information
  static getSession(sessionId: string): ExamSession | null {
    return examSessions.get(sessionId) || null;
  }

  // Get user's exam history (if userId is provided)
  static getUserHistory(userId: string): ExamSession[] {
    if (!userId) return [];
    
    return Array.from(examSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // Get statistics for a test set
  static getSetStatistics(setId: number): {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  } {
    const sessions = Array.from(examSessions.values())
      .filter(session => session.setId === setId);
    
    const totalAttempts = sessions.length;
    const completedSessions = sessions.filter(session => session.completedAt);
    const completionRate = totalAttempts > 0 ? (completedSessions.length / totalAttempts) * 100 : 0;
    
    const scores = completedSessions
      .filter(session => session.score !== undefined)
      .map(session => session.score!);
    
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    return {
      totalAttempts,
      averageScore,
      completionRate
    };
  }

  // Clean up old sessions (for memory management)
  static cleanupOldSessions(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [sessionId, session] of examSessions.entries()) {
      if (session.startedAt < cutoffTime && !session.completedAt) {
        examSessions.delete(sessionId);
        examAnswers.delete(sessionId);
        examResults.delete(sessionId);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

// MongoDB implementation (for production use)
export class MongoExamDatabase {
  private static db: any; // MongoDB connection

  static async initialize(connection: any) {
    this.db = connection;
  }

  static async createSession(setId: number, userId?: string): Promise<string> {
    const sessionId = `session_${setId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.collection('exam_sessions').insertOne({
      sessionId,
      setId,
      userId,
      startedAt: new Date(),
      totalQuestions: 10
    });

    return sessionId;
  }

  static async saveAnswer(sessionId: string, answer: Omit<ExamAnswer, 'sessionId'>): Promise<boolean> {
    try {
      await this.db.collection('exam_answers').replaceOne(
        { sessionId, questionId: answer.questionId },
        { sessionId, ...answer },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }

  static async getAnswers(sessionId: string): Promise<ExamAnswer[]> {
    return await this.db.collection('exam_answers')
      .find({ sessionId })
      .sort({ questionId: 1 })
      .toArray();
  }

  static async completeSession(sessionId: string, score: number): Promise<boolean> {
    try {
      await this.db.collection('exam_sessions').updateOne(
        { sessionId },
        { 
          $set: { 
            completedAt: new Date(),
            score 
          } 
        }
      );
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }
}

// PostgreSQL implementation (for production use)
export class PostgresExamDatabase {
  private static pool: any; // PostgreSQL connection pool

  static async initialize(pool: any) {
    this.pool = pool;
  }

  static async createSession(setId: number, userId?: string): Promise<string> {
    const sessionId = `session_${setId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.pool.query(
      'INSERT INTO exam_sessions (session_id, set_id, user_id, started_at, total_questions) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, setId, userId, new Date(), 10]
    );

    return sessionId;
  }

  static async saveAnswer(sessionId: string, answer: Omit<ExamAnswer, 'sessionId'>): Promise<boolean> {
    try {
      await this.pool.query(
        `INSERT INTO exam_answers (session_id, question_id, selected_answer, image_url, timestamp, is_correct) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (session_id, question_id) 
         DO UPDATE SET 
           selected_answer = EXCLUDED.selected_answer,
           image_url = EXCLUDED.image_url,
           timestamp = EXCLUDED.timestamp,
           is_correct = EXCLUDED.is_correct`,
        [sessionId, answer.questionId, answer.selectedAnswer, answer.imageUrl, answer.timestamp, answer.isCorrect]
      );
      return true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }

  static async getAnswers(sessionId: string): Promise<ExamAnswer[]> {
    const result = await this.pool.query(
      'SELECT * FROM exam_answers WHERE session_id = $1 ORDER BY question_id',
      [sessionId]
    );
    return result.rows;
  }
}
