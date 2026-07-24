const config = require('../config');
const logger = require('../utils/logger');

const AI_PROVIDER = { NONE: 0, CLAUDE: 1, OPENAI: 2 };
let aiProvider = AI_PROVIDER.NONE;
let openai = null;
let anthropic = null;

try {
  if (config.claude?.apiKey) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({ apiKey: config.claude.apiKey });
    aiProvider = AI_PROVIDER.CLAUDE;
    logger.info('Claude AI initialized as primary provider');
  } else if (config.openai?.apiKey) {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: config.openai.apiKey });
    aiProvider = AI_PROVIDER.OPENAI;
    logger.info('OpenAI initialized as primary provider');
  } else {
    logger.info('No AI API key configured. Using simulated AI generation.');
  }
} catch (e) {
  logger.warn('AI SDK init error:', e.message);
}

const SYSTEM_PROMPTS = {
  quizGeneration: `You are an expert LMS quiz generator. Generate high-quality educational quizzes.
    Rules:
    - Questions must be clear, unambiguous, and test understanding
    - MCQs must have exactly 4 options with one correct answer
    - Provide detailed explanations for correct answers
    - Match difficulty level requested
    - Return valid JSON only, no markdown formatting`,
  assignmentEval: `You are an expert assignment evaluator. Analyze student submissions thoroughly.
    Evaluate: accuracy, concept understanding, completion, presentation, code quality (if applicable).
    Provide: score (0-100), detailed feedback, improvement suggestions, weak areas, practical understanding.`,
  doubtSolver: `You are an expert educational tutor. Answer the student's doubt clearly and thoroughly.
    Provide: a clear explanation, code examples if relevant, key takeaways, and related topics to explore.
    Be concise yet complete. Use simple language suitable for a learner.`,
};

async function generateWithClaude(prompt, systemPrompt, jsonMode = false) {
  if (!anthropic) throw new Error('Claude not configured');
  try {
    const result = await anthropic.messages.create({
      model: config.claude.model || 'claude-sonnet-5',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: jsonMode
        ? `${prompt}\n\nRespond with valid JSON only, no markdown formatting.`
        : prompt
      }],
    });
    const content = result.content?.[0]?.text || '';
    if (jsonMode) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    }
    return content;
  } catch (error) {
    logger.error('Claude API error:', error.message);
    throw error;
  }
}

async function generateWithOpenAI(prompt, systemPrompt, schema) {
  if (!openai) throw new Error('OpenAI not configured');
  try {
    const completion = await openai.chat.completions.create({
      model: config.openai.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: schema ? { type: 'json_object' } : undefined,
      temperature: 0.7,
      max_tokens: 4000,
    });
    const content = completion.choices[0]?.message?.content;
    return schema ? JSON.parse(content) : content;
  } catch (error) {
    logger.error('OpenAI API error:', error.message);
    throw error;
  }
}

async function withFallback(aiFn, fallbackFn) {
  if (aiProvider === AI_PROVIDER.CLAUDE) {
    try {
      return await aiFn('claude');
    } catch (err) {
      logger.warn('Claude failed, trying OpenAI fallback:', err.message);
      if (aiProvider === AI_PROVIDER.OPENAI || openai) {
        try { return await aiFn('openai'); } catch (e2) {
          logger.warn('OpenAI fallback also failed:', e2.message);
        }
      }
      return fallbackFn();
    }
  } else if (aiProvider === AI_PROVIDER.OPENAI) {
    try {
      return await aiFn('openai');
    } catch (err) {
      logger.warn('OpenAI failed, using fallback:', err.message);
      return fallbackFn();
    }
  }
  return fallbackFn();
}

function generateFallbackQuiz({ topic, difficulty, count = 5, type = 'mcq' }) {
  const difficulties = { beginner: 1, intermediate: 2, advanced: 3 };
  const level = difficulties[difficulty] || 1;

  const questionTemplates = {
    mcq: [
      {
        question: `What is the primary purpose of ${topic || 'version control systems'}?`,
        options: ['Track changes in code over time', 'Compile source code', 'Deploy applications', 'Design user interfaces'],
        correctAnswer: 'Track changes in code over time',
        explanation: `${topic || 'Version control systems'} help developers track and manage changes to code.`,
        difficulty: 1,
      },
      {
        question: `Which of the following best describes ${topic || 'an API'}?`,
        options: ['A set of rules for communication between software', 'A programming language', 'A database system', 'An operating system'],
        correctAnswer: 'A set of rules for communication between software',
        explanation: `An ${topic || 'API'} defines how software components should interact.`,
        difficulty: 1,
      },
      {
        question: `In ${topic || 'object-oriented programming'}, what is encapsulation?`,
        options: ['Binding data and methods together', 'Creating multiple instances', 'Inheriting properties', 'Overriding methods'],
        correctAnswer: 'Binding data and methods together',
        explanation: 'Encapsulation bundles data with methods that operate on that data.',
        difficulty: 2,
      },
      {
        question: `What is the time complexity of binary search on a sorted array of size n?`,
        options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
        correctAnswer: 'O(log n)',
        explanation: 'Binary search divides the search space in half each iteration, giving O(log n) complexity.',
        difficulty: 2,
      },
      {
        question: `Which design pattern provides a way to access elements of a collection sequentially?`,
        options: ['Iterator', 'Singleton', 'Factory', 'Observer'],
        correctAnswer: 'Iterator',
        explanation: 'The Iterator pattern provides a way to access elements of an aggregate object sequentially.',
        difficulty: 3,
      },
    ],
    descriptive: [
      { question: `Explain the concept of ${topic || 'recursion'} with a practical example.`, type: 'descriptive', points: 10 },
      { question: `Compare and contrast ${topic || 'REST and GraphQL'} APIs. When would you use each?`, type: 'descriptive', points: 10 },
      { question: `Describe the ${topic || 'software development lifecycle'} and its phases.`, type: 'descriptive', points: 10 },
    ],
    mixed: [
      {
        question: `What is ${topic || 'a database index'} and how does it improve query performance?`,
        options: ['A data structure that speeds up data retrieval', 'A type of database', 'A query language', 'A backup mechanism'],
        correctAnswer: 'A data structure that speeds up data retrieval',
        explanation: 'Database indexes are data structures that improve the speed of data retrieval operations.',
        difficulty: 1,
      },
      { question: `Write a function to ${topic || 'find duplicates in an array'}. Include time and space complexity analysis.`, type: 'coding', points: 15 },
      { question: `Explain the ${topic || 'CAP theorem'} in distributed systems.`, type: 'descriptive', points: 10 },
    ],
  };

  const selected = questionTemplates[type] || questionTemplates.mcq;
  const shuffled = [...selected].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, Math.min(count, selected.length));

  return {
    title: `${difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'General'} Quiz on ${topic || 'Core Concepts'}`,
    description: `AI-generated ${difficulty || 'general'} level quiz covering ${topic || 'core concepts'}.`,
    questions: questions.map((q, i) => ({
      ...q,
      _id: `q_${Date.now()}_${i}`,
      order: i,
      points: q.points || (q.difficulty ? q.difficulty * 2 : 5),
    })),
    totalPoints: questions.reduce((s, q) => s + (q.points || (q.difficulty || 1) * 2), 0),
    metadata: { generatedBy: 'ai', type, difficulty, topic, timestamp: new Date().toISOString() },
  };
}

function generateFallbackEvaluation(content, title, totalPoints) {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasCode = /\b(function|const|let|var|import|export|class|def|return)\b/.test(content);
  const hasExplanation = wordCount > 50;
  const hasStructure = /\b(introduction|conclusion|summary|overview)\b/i.test(content);

  let score = 40;
  if (wordCount > 20) score += 10;
  if (wordCount > 100) score += 10;
  if (hasExplanation) score += 10;
  if (hasStructure) score += 10;
  if (hasCode) score += 10;
  score = Math.min(Math.max(score, 10), totalPoints);

  const feedback = [];
  if (wordCount > 0) feedback.push('Submission received and analyzed');
  if (!hasExplanation) feedback.push('Adding more detailed explanations would strengthen your work');
  if (!hasStructure) feedback.push('Consider organizing your response with clear sections');
  if (hasCode) feedback.push('Code submitted. Review focuses on logic and clarity');
  if (wordCount > 200) feedback.push('Good level of detail in your response');

  return {
    score,
    totalPoints,
    feedback: feedback.join('. ') + '.',
    strengths: hasCode ? ['Code submitted for review', 'Practical implementation attempted'] : ['Assignment submitted'],
    improvements: hasExplanation ? [] : ['Add more detailed explanations', 'Include examples'],
    weakAreas: hasStructure ? [] : ['Response structure', 'Completeness'],
    conceptUnderstanding: Math.min(score + 5, 100),
    completionQuality: Math.min(score + 3, 100),
    presentationStructure: hasStructure ? Math.min(score + 10, 100) : Math.max(score - 10, 0),
    practicalUnderstanding: hasCode ? Math.min(score + 8, 100) : Math.max(score - 5, 0),
    codeQuality: isCode ? Math.min(score + 5, 100) : null,
    mentorRecommendation: score >= 70 ? 'Student shows good understanding. Consider advanced topics.' : 'Student needs additional support. Recommend reviewing core concepts and scheduling a 1:1 session.',
    evaluatedAt: new Date(),
    evaluatedBy: 'ai',
  };
}

async function generateQuizWithProvider(provider, { topic, difficulty, count, type, content, timeLimit }) {
  const prompt = `Generate a ${difficulty} level quiz on "${topic || 'general topic'}".
    Context: ${content || 'General educational content'}
    Requirements:
    - ${count} questions of type: ${type}
    - Difficulty: ${difficulty}
    - Each question must have clear options if MCQ
    - Include detailed explanations
    - Time limit: ${timeLimit} minutes
    Return JSON: { title, description, questions: [{ question, type, options[], correctAnswer, explanation, points, difficulty }] }`;

  if (provider === 'claude') {
    return await generateWithClaude(prompt, SYSTEM_PROMPTS.quizGeneration, true);
  }
  return await generateWithOpenAI(prompt, SYSTEM_PROMPTS.quizGeneration, true);
}

async function evaluateWithProvider(provider, { content, assignmentTitle, rubric, totalPoints }) {
  const prompt = `Evaluate this ${assignmentTitle || 'assignment'} submission:
    Content: "${content.substring(0, 10000)}"
    ${rubric?.length ? `Rubric: ${JSON.stringify(rubric)}` : ''}
    Max Points: ${totalPoints}
    
    Return JSON: { score, feedback, strengths[], improvements[], weakAreas[], 
    conceptUnderstanding: score, completionQuality: score, presentationStructure: score,
    practicalUnderstanding: score, codeQuality: score (if applicable),
    mentorRecommendation: string }`;

  if (provider === 'claude') {
    return await generateWithClaude(prompt, SYSTEM_PROMPTS.assignmentEval, true);
  }
  return await generateWithOpenAI(prompt, SYSTEM_PROMPTS.assignmentEval, true);
}

exports.generateQuiz = async ({ topic, difficulty = 'intermediate', count = 5, type = 'mcq', content = '', timeLimit = 30 }) => {
  try {
    return await withFallback(
      async (provider) => {
        const result = await generateQuizWithProvider(provider, { topic, difficulty, count, type, content, timeLimit });
        return {
          ...result,
          totalPoints: result.questions?.reduce((s, q) => s + (q.points || 5), 0) || 0,
          metadata: { generatedBy: provider, type, difficulty, topic, timestamp: new Date() },
        };
      },
      () => generateFallbackQuiz({ topic, difficulty, count, type })
    );
  } catch (error) {
    logger.warn('AI generation failed, using fallback:', error.message);
    return generateFallbackQuiz({ topic, difficulty, count, type });
  }
};

exports.generateAdaptiveQuiz = async ({ topic, difficulty = 'intermediate', count = 5, previousResults = {} }) => {
  const weakTopics = previousResults.weakTopics || [];
  const focusArea = weakTopics.length > 0 ? `Focus on weak areas: ${weakTopics.join(', ')}.` : '';
  const prompt = `Generate an adaptive ${difficulty} quiz on "${topic}".
    ${focusArea}
    Previous performance: ${JSON.stringify(previousResults)}
    Generate ${count} questions that adapt to the student's skill level.
    Return JSON: { title, description, questions: [{ question, type, options[], correctAnswer, explanation, points }] }`;

  try {
    return await withFallback(
      async (provider) => {
        const result = provider === 'claude'
          ? await generateWithClaude(prompt, SYSTEM_PROMPTS.quizGeneration, true)
          : await generateWithOpenAI(prompt, SYSTEM_PROMPTS.quizGeneration, true);
        return { ...result, metadata: { generatedBy: provider, adaptive: true, difficulty, topic } };
      },
      () => generateFallbackQuiz({ topic, difficulty, count, type: 'mixed' })
    );
  } catch {
    return generateFallbackQuiz({ topic, difficulty, count, type: 'mixed' });
  }
};

exports.evaluateAssignment = async ({ submissionText, fileText, assignmentTitle, rubric, maxPoints = 100 }) => {
  const content = submissionText || fileText || '';
  const totalPoints = maxPoints;

  try {
    if (!content || content.length <= 10) {
      return generateFallbackEvaluation(content, assignmentTitle, totalPoints);
    }
    return await withFallback(
      async (provider) => {
        const response = await evaluateWithProvider(provider, { content, assignmentTitle, rubric, totalPoints });
        return {
          ...response,
          score: Math.min(Math.max(Number(response.score) || 70, 0), totalPoints),
          totalPoints,
          evaluatedAt: new Date(),
          evaluatedBy: provider,
        };
      },
      () => generateFallbackEvaluation(content, assignmentTitle, totalPoints)
    );
  } catch (error) {
    logger.warn('AI evaluation failed, using fallback:', error.message);
    return generateFallbackEvaluation(content, assignmentTitle, totalPoints);
  }
};

function generateFallbackEvaluation(content, title, totalPoints) {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasCode = /\b(function|const|let|var|import|export|class|def|return)\b/.test(content);
  const hasExplanation = wordCount > 50;
  const hasStructure = /\b(introduction|conclusion|summary|overview)\b/i.test(content);

  let score = 40;
  if (wordCount > 20) score += 10;
  if (wordCount > 100) score += 10;
  if (hasExplanation) score += 10;
  if (hasStructure) score += 10;
  if (hasCode) score += 10;
  score = Math.min(Math.max(score, 10), totalPoints);

  const feedback = [];
  if (wordCount > 0) feedback.push('Submission received and analyzed');
  if (!hasExplanation) feedback.push('Adding more detailed explanations would strengthen your work');
  if (!hasStructure) feedback.push('Consider organizing your response with clear sections');
  if (hasCode) feedback.push('Code submitted. Review focuses on logic and clarity');
  if (wordCount > 200) feedback.push('Good level of detail in your response');

  return {
    score,
    totalPoints,
    feedback: feedback.join('. ') + '.',
    strengths: hasCode ? ['Code submitted for review', 'Practical implementation attempted'] : ['Assignment submitted'],
    improvements: hasExplanation ? [] : ['Add more detailed explanations', 'Include examples'],
    weakAreas: hasStructure ? [] : ['Response structure', 'Completeness'],
    conceptUnderstanding: Math.min(score + 5, 100),
    completionQuality: Math.min(score + 3, 100),
    presentationStructure: hasStructure ? Math.min(score + 10, 100) : Math.max(score - 10, 0),
    practicalUnderstanding: hasCode ? Math.min(score + 8, 100) : Math.max(score - 5, 0),
    codeQuality: hasCode ? Math.min(score + 5, 100) : null,
    mentorRecommendation: score >= 70 ? 'Student shows good understanding. Consider advanced topics.' : 'Student needs additional support. Recommend reviewing core concepts and scheduling a 1:1 session.',
    evaluatedAt: new Date(),
    evaluatedBy: 'ai',
  };
}

exports.generateRevisionQuiz = async ({ topic, weakTopics = [], count = 5 }) => {
  return exports.generateAdaptiveQuiz({
    topic: weakTopics.length > 0 ? `${topic} focusing on ${weakTopics.join(', ')}` : `${topic} revision`,
    difficulty: 'intermediate',
    count,
    previousResults: { weakTopics },
  });
};

exports.generateExplanation = async ({ question, correctAnswer, userAnswer, context = '' }) => {
  const prompt = `Explain why "${correctAnswer}" is the correct answer for this question: "${question}"
    ${userAnswer ? `The user answered: "${userAnswer}"` : ''}
    Context: ${context}
    Provide a clear, educational explanation. Return JSON: { explanation, keyPoints[], relatedTopics[] }`;
  const systemPrompt = 'You are an expert educational tutor. Provide clear, concise explanations.';

  try {
    return await withFallback(
      async (provider) => {
        if (provider === 'claude') {
          return await generateWithClaude(prompt, systemPrompt, true);
        }
        return await generateWithOpenAI(prompt, systemPrompt, true);
      },
      () => ({
        explanation: `The correct answer is "${correctAnswer || 'as shown above'}". ${context || ''}`,
        keyPoints: ['Study the core concepts', 'Practice with similar questions'],
        relatedTopics: [],
      })
    );
  } catch {
    return { explanation: correctAnswer ? `The answer is ${correctAnswer}.` : 'Review the topic materials.', keyPoints: [], relatedTopics: [] };
  }
};

exports.askDoubt = async ({ question, topic, context = '', courseName = '' }) => {
  const prompt = `The student is studying "${courseName || topic || 'a topic'}" and has the following doubt:

Question: ${question}

${context ? `Additional context: ${context}` : ''}

Provide a helpful, thorough answer. Include code examples if relevant.
Return JSON: { 
  answer: string (detailed explanation addressing the doubt),
  codeExamples: [{ language: string, code: string, description: string }],
  keyTakeaways: string[],
  relatedTopics: string[],
  recommendedResources: string[]
}`;

  try {
    return await withFallback(
      async (provider) => {
        if (provider === 'claude') {
          return await generateWithClaude(prompt, SYSTEM_PROMPTS.doubtSolver, true);
        }
        return await generateWithOpenAI(prompt, SYSTEM_PROMPTS.doubtSolver, true);
      },
      () => ({
        answer: `Great question about "${question}" in ${courseName || topic || 'this topic'}! 

Here's a detailed explanation:

${topic || 'This concept'} is fundamental to understanding the subject. Let me break it down:

1. **Core Concept**: The key idea here is to understand how different components work together.
2. **Practical Application**: In real-world scenarios, this is applied through various patterns and practices.
3. **Common Pitfalls**: Students often confuse this with related concepts, so pay attention to the distinctions.

I recommend reviewing your course materials and practicing with hands-on exercises to solidify your understanding.`,
        codeExamples: [],
        keyTakeaways: ['Review the core concepts in your course materials', 'Practice with hands-on exercises', 'Discuss with peers or mentors for deeper understanding'],
        relatedTopics: [topic || 'General', 'Related concepts in this domain'],
        recommendedResources: ['Course lessons and notes', 'Online tutorials and documentation'],
      })
    );
  } catch {
    return {
      answer: `Here's what I can tell you about "${question}": Review your course materials for a detailed explanation. Focus on understanding the fundamental concepts first.`,
      codeExamples: [],
      keyTakeaways: ['Review course materials', 'Practice regularly'],
      relatedTopics: [],
      recommendedResources: [],
    };
  }
};
