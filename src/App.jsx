import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const QUESTION_TIME = 60

// 本地 JSON 风格题库
const QUIZ = [
  {
    id: 1,
    question: 'Which method is used to create a shallow copy of an array in JavaScript?',
    options: ['Array.assign()', 'Array.slice()', 'Array.copy()', 'Array.clone()'],
    correctIndex: 1,
    explanation: 'slice() returns a new array with the selected elements.'
  },
  {
    id: 2,
    question: 'In React, which hook is best for memoizing an expensive calculation?',
    options: ['useState', 'useEffect', 'useMemo', 'useRef'],
    correctIndex: 2,
    explanation: 'useMemo caches a computed value until dependencies change.'
  },
  {
    id: 3,
    question: 'Which HTTP status code means “Too Many Requests”?',
    options: ['401', '403', '404', '429'],
    correctIndex: 3,
    explanation: '429 indicates the client has sent too many requests in a given time.'
  },
  {
    id: 4,
    question: 'What does CSS “gap” control in a flex or grid container?',
    options: ['Container width', 'Space between items', 'Font size', 'Border thickness'],
    correctIndex: 1,
    explanation: 'gap sets the spacing between rows and columns.'
  },
  {
    id: 5,
    question: 'Which statement about localStorage is true?',
    options: [
      'It stores data only for the current tab',
      'It persists across browser sessions',
      'It is cleared on page reload',
      'It can store only numbers'
    ],
    correctIndex: 1,
    explanation: 'localStorage persists until explicitly cleared.'
  }
]

function App() {
  // 页面阶段：intro -> quiz -> results
  const [stage, setStage] = useState('intro')
  // 核心答题状态
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [results, setResults] = useState([])

  const current = QUIZ[questionIndex]

  // 进度条百分比
  const progress = useMemo(() => {
    return Math.round(((questionIndex + 1) / QUIZ.length) * 100)
  }, [questionIndex])

  // 记录每题结果，用于最终汇总展示
  const recordResult = useCallback(({ selected, isCorrect, wasTimedOut }) => {
    setResults((prev) => {
      const next = [...prev]
      next[questionIndex] = {
        question: current.question,
        options: current.options,
        correctIndex: current.correctIndex,
        selectedIndex: selected,
        isCorrect,
        timedOut: wasTimedOut,
        explanation: current.explanation
      }
      return next
    })
  }, [current, questionIndex])

  const resetQuestionState = useCallback(() => {
    setSelectedIndex(null)
    setShowFeedback(false)
    setTimedOut(false)
    setTimeLeft(QUESTION_TIME)
  }, [])

  // 开始或重新开始答题流程
  const startQuiz = () => {
    setStage('quiz')
    setQuestionIndex(0)
    setScore(0)
    setResults([])
    resetQuestionState()
  }

  const handleAnswer = (index) => {
    if (showFeedback) return

    const isCorrect = index === current.correctIndex
    setSelectedIndex(index)
    setShowFeedback(true)
    setTimedOut(false)

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    recordResult({
      selected: index,
      isCorrect,
      wasTimedOut: false
    })
  }

  const goToNextQuestion = useCallback(() => {
    if (questionIndex === QUIZ.length - 1) {
      setStage('results')
      return
    }

    setQuestionIndex((prev) => prev + 1)
    resetQuestionState()
  }, [questionIndex, resetQuestionState])

  // 超时自动跳题并扣分
  const handleTimeout = useCallback(() => {
    if (showFeedback) return

    setSelectedIndex(null)
    setShowFeedback(true)
    setTimedOut(true)
    setScore((prev) => prev - 1)

    recordResult({
      selected: null,
      isCorrect: false,
      wasTimedOut: true
    })

    setTimeout(() => {
      goToNextQuestion()
    }, 1200)
  }, [goToNextQuestion, recordResult, showFeedback])

  // 倒计时（显示反馈时暂停）
  useEffect(() => {
    if (stage !== 'quiz' || showFeedback) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(prev - 1, 0)
        if (next === 0) {
          clearInterval(timer)
          handleTimeout()
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [stage, showFeedback, questionIndex, handleTimeout])

  const restart = () => {
    setStage('intro')
    setQuestionIndex(0)
    setScore(0)
    setResults([])
    resetQuestionState()
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="badge">Front-End Fundamentals Quiz</div>
        <h1>React Rapid Quiz</h1>
        <p>
          Five fast questions. Immediate feedback. One minute per question. Your
          final score appears with a full breakdown.
        </p>
        <div className="hero-stats">
          <div>
            <span className="stat-label">Questions</span>
            <span className="stat-value">{QUIZ.length}</span>
          </div>
          <div>
            <span className="stat-label">Timer</span>
            <span className="stat-value">{QUESTION_TIME}s each</span>
          </div>
          <div>
            <span className="stat-label">Score</span>
            <span className="stat-value">+1 / -1</span>
          </div>
        </div>
      </header>

      {stage === 'intro' && (
        <section className="panel intro">
          <h2>Ready to begin?</h2>
          <p>
            Tap start to get the first question. Each answer shows instant
            feedback, and timeouts will move you forward automatically.
          </p>
          <button className="primary" onClick={startQuiz}>
            Start the quiz
          </button>
        </section>
      )}

      {stage === 'quiz' && current && (
        <section className="panel quiz">
          <div className="quiz-meta">
            <div>
              <span className="label">Question</span>
              <span className="value">
                {questionIndex + 1} / {QUIZ.length}
              </span>
            </div>
            <div>
              <span className="label">Score</span>
              <span className="value">{score}</span>
            </div>
            <div>
              <span className="label">Time left</span>
              <span className={`value ${timeLeft <= 10 ? 'urgent' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="question-card">
            <h2>{current.question}</h2>
            <div className="options">
              {current.options.map((option, index) => {
                const isCorrect = index === current.correctIndex
                const isSelected = index === selectedIndex
                const showState = showFeedback

                let className = 'option'

                if (showState && isCorrect) {
                  className += ' correct'
                }

                if (showState && isSelected && !isCorrect) {
                  className += ' incorrect'
                }

                return (
                  <button
                    key={option}
                    className={className}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {showFeedback && (
              <div className="feedback">
                <p className="feedback-title">
                  {timedOut
                    ? 'Time is up!'
                    : selectedIndex === current.correctIndex
                    ? 'Correct!'
                    : 'Not quite.'}
                </p>
                <p>
                  The correct answer is{' '}
                  <span className="highlight">
                    {current.options[current.correctIndex]}
                  </span>
                  . {current.explanation}
                </p>
              </div>
            )}
          </div>

          {showFeedback && !timedOut && (
            <button className="secondary" onClick={goToNextQuestion}>
              {questionIndex === QUIZ.length - 1 ? 'View results' : 'Next question'}
            </button>
          )}
        </section>
      )}

      {stage === 'results' && (
        <section className="panel results">
          <h2>Final score</h2>
          <p className="score">
            {score} / {QUIZ.length}
          </p>
          <p className="score-detail">
            Review every answer below. Timeouts are marked and scored as -1.
          </p>

          <div className="results-grid">
            {results.map((result, index) => (
              <div key={result.question} className="result-card">
                <div className="result-header">
                  <span className="result-index">Q{index + 1}</span>
                  <span
                    className={`result-pill ${
                      result.timedOut
                        ? 'timeout'
                        : result.isCorrect
                        ? 'correct'
                        : 'incorrect'
                    }`}
                  >
                    {result.timedOut
                      ? 'Timeout'
                      : result.isCorrect
                      ? 'Correct'
                      : 'Incorrect'}
                  </span>
                </div>
                <h3>{result.question}</h3>
                <p>
                  Your answer:{' '}
                  <span className="highlight">
                    {result.selectedIndex === null
                      ? 'No answer'
                      : result.options[result.selectedIndex]}
                  </span>
                </p>
                <p>
                  Correct answer:{' '}
                  <span className="highlight">
                    {result.options[result.correctIndex]}
                  </span>
                </p>
                <p className="explanation">{result.explanation}</p>
              </div>
            ))}
          </div>

          <button className="primary" onClick={restart}>
            Play again
          </button>
        </section>
      )}
    </div>
  )
}

export default App
