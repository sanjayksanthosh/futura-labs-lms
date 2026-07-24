const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      mentor: req.userId,
      createdBy: req.userId,
    });
    res.status(201).json({ success: true, data: quiz, message: 'Quiz created' });
  } catch (error) {
    next(error);
  }
};

exports.getQuizzes = async (req, res, next) => {
  try {
    let query;
    if (req.userRole === 'mentor') {
      query = Quiz.find({ createdBy: req.userId }).populate('course', 'title');
    } else if (req.userRole === 'student') {
      const student = await require('../models/User').findById(req.userId).select('enrolledCourses');
      const enrolled = student?.enrolledCourses || [];
      const filter = enrolled.length > 0 ? { isPublished: true, course: { $in: enrolled } } : { isPublished: true };
      query = Quiz.find(filter).populate('course', 'title');
      const quizzes = await query;
      const results = await QuizResult.find({ student: req.userId, quiz: { $in: quizzes.map((q) => q._id) } });
      const resultMap = {};
      results.forEach((r) => { resultMap[r.quiz.toString()] = r; });
      const data = quizzes.map((q) => {
        const obj = q.toObject();
        obj.answers = undefined;
        const res_ = resultMap[q._id.toString()];
        obj.attempted = !!res_;
        obj.bestScore = res_ ? res_.score : null;
        obj.resultId = res_ ? res_._id : null;
        return obj;
      });
      return res.status(200).json({ success: true, count: data.length, data });
    } else {
      query = Quiz.find().populate('course', 'title');
    }

    const features = new APIFeatures(query, req.query).filter().search(['title', 'description']).sort().limitFields().paginate();
    const quizzes = await features.query;
    const total = await Quiz.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);
    res.status(200).json({ success: true, count: quizzes.length, pagination, data: quizzes });
  } catch (error) {
    next(error);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');
    if (!quiz) return next(new AppError('Quiz not found', 404));

    if (req.userRole === 'student') {
      const sanitized = quiz.toObject();
      sanitized.questions = sanitized.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.type === 'true_false' ? ['True', 'False'] : q.options,
        points: q.points,
        order: q.order,
      }));
      return res.status(200).json({ success: true, data: sanitized });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return next(new AppError('Quiz not found', 404));
    res.status(200).json({ success: true, data: quiz, message: 'Quiz updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizResult.deleteMany({ quiz: req.params.id });
    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));

    const existingAttempts = await QuizResult.countDocuments({
      quiz: quiz._id,
      student: req.userId,
      status: 'completed',
    });

    if (existingAttempts >= quiz.maxAttempts) {
      return next(new AppError('Maximum attempts reached', 400));
    }

    const { answers: rawAnswers, timeTaken } = req.body;
    const answersArray = Array.isArray(rawAnswers)
      ? rawAnswers
      : Object.entries(rawAnswers || {}).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));

    let earnedPoints = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const gradedAnswers = quiz.questions.map((question) => {
      const userAnswer = answersArray.find(
        (a) => a.questionId.toString() === question._id.toString()
      );
      let isCorrect = false;

      if (userAnswer) {
        if (question.type === 'mcq' || question.type === 'true_false') {
          isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
        } else if (question.type === 'multiple_select') {
          const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
          const selected = Array.isArray(userAnswer.selectedAnswer) ? userAnswer.selectedAnswer : [userAnswer.selectedAnswer];
          isCorrect =
            correct.length === selected.length && correct.every((c) => selected.includes(c));
        } else if (question.type === 'short_answer' || question.type === 'fill_blank') {
          isCorrect = userAnswer.selectedAnswer?.toString().toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim();
        }
      }

      if (isCorrect) {
        earnedPoints += question.points || 1;
        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }

      return {
        questionId: question._id,
        question: question.question,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points || 1,
        pointsEarned: isCorrect ? question.points || 1 : 0,
      };
    });

    const totalPoints = quiz.totalPoints || quiz.questions.reduce((s, q) => s + (q.points || 1), 0);
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = percentage >= quiz.passingScore;

    const result = await QuizResult.create({
      quiz: quiz._id,
      student: req.userId,
      course: quiz.course,
      answers: gradedAnswers,
      totalPoints,
      earnedPoints,
      percentage,
      isPassed,
      attemptNumber: existingAttempts + 1,
      timeTaken,
      completedAt: new Date(),
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      data: {
        result,
        score: percentage,
        correctAnswers,
        incorrectAnswers,
        pointsEarned: earnedPoints,
        totalPoints,
        isPassed,
        totalQuestions: quiz.questions.length,
      },
      message: isPassed ? 'Quiz passed!' : 'Quiz completed',
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuizResults = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const features = new APIFeatures(
      QuizResult.find(quizId ? { quiz: quizId } : { student: req.userId })
        .populate('quiz', 'title')
        .populate('student', 'name email'),
      req.query
    )
      .sort()
      .paginate();

    const results = await features.query;
    const total = await QuizResult.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: results.length, pagination, data: results });
  } catch (error) {
    next(error);
  }
};
