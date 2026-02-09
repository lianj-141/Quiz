import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Intro from './components/Intro'
import QuizPanel from './components/QuizPanel'
import Results from './components/Results'

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
  // 页面阶段：intro(开始页) -> quiz(答题页) -> results(结果页)
  const [stage, setStage] = useState('intro')
  // 当前题目索引（从 0 开始）
  const [questionIndex, setQuestionIndex] = useState(0)
  // 总分：答对 +1，超时 -1，答错不加不减
  const [score, setScore] = useState(0)
  // 当前题用户选中的选项索引；null 表示还没选
  const [selectedIndex, setSelectedIndex] = useState(null)
  // 是否展示当前题反馈（正确/错误/超时）
  const [showFeedback, setShowFeedback] = useState(false)
  // 当前题是否超时
  const [timedOut, setTimedOut] = useState(false)
  // 当前题剩余秒数
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  // 每题结果汇总，用于结果页展示
  const [results, setResults] = useState([])

  // 当前正在作答的题目对象
  const current = QUIZ[questionIndex]

  // 进度条百分比（例如第 2/5 题 -> 40%）
  const progress = useMemo(() => {
    return Math.round(((questionIndex + 1) / QUIZ.length) * 100)
  }, [questionIndex])

  // 把当前题结果写入 results[questionIndex]
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

  // 切题时要重置的“单题状态”
  const resetQuestionState = useCallback(() => {
    setSelectedIndex(null)
    setShowFeedback(false)
    setTimedOut(false)
    setTimeLeft(QUESTION_TIME)
  }, [])

  // 从开始页进入答题，并重置整场测验状态
  const startQuiz = () => {
    setStage('quiz')
    setQuestionIndex(0)
    setScore(0)
    setResults([])
    resetQuestionState()
  }

  // 用户点击某个选项后的处理
  const handleAnswer = (index) => {
    // 如果已经显示反馈，禁止重复作答
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

  // 进入下一题；如果已经是最后一题则跳到结果页
  const goToNextQuestion = useCallback(() => {
    if (questionIndex === QUIZ.length - 1) {
      setStage('results')
      return
    }

    setQuestionIndex((prev) => prev + 1)
    resetQuestionState()
  }, [questionIndex, resetQuestionState])

  // 当前题超时时：记为错误、扣分，并短暂停留后自动下一题
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

  // 倒计时副作用：
  // 1) 仅在 quiz 阶段且未显示反馈时运行
  // 2) 每秒 timeLeft - 1
  // 3) 到 0 后触发超时逻辑
  // 4) 组件更新/卸载时清理定时器，避免重复计时
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

  // 结果页“再玩一次”：回到 intro 并清空状态
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

      {/* 开始页：仅在 stage = intro 时渲染 */}
      {stage === 'intro' && <Intro onStart={startQuiz} />}

      {/* 答题页：仅在 stage = quiz 且当前题存在时渲染 */}
      {stage === 'quiz' && current && (
        <QuizPanel
          current={current}
          questionIndex={questionIndex}
          totalQuestions={QUIZ.length}
          score={score}
          timeLeft={timeLeft}
          progress={progress}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
          timedOut={timedOut}
          onAnswer={handleAnswer}
          onNext={goToNextQuestion}
        />
      )}

      {/* 结果页：仅在 stage = results 时渲染 */}
      {stage === 'results' && (
        <Results
          score={score}
          totalQuestions={QUIZ.length}
          results={results}
          onRestart={restart}
        />
      )}
    </div>
  )
}

export default App
